# Architecture Search

Strategies for exploring model architecture: width, depth, attention patterns, and their tradeoffs within a fixed time budget.

## The Aspect Ratio Discovery

The single largest improvement in SkyPilot-scaled autoresearch came from scaling model width. Going wider (ASPECT_RATIO 48 -> 96, model_dim 384 -> 768) outperformed every hyperparameter tweak combined.

This was only discovered because parallel execution allowed testing 6 widths in a single wave. Sequential search might have tested one, seen no improvement, and moved on.

## Architecture Parameters

| Parameter | Default | Range | Effect |
| --- | --- | --- | --- |
| `ASPECT_RATIO` | 48 | 48 - 112 | Controls model_dim = 8 * AR. Higher = wider model |
| `DEPTH` | 8 | 4 - 12 | Number of transformer layers |
| `WINDOW_PATTERN` | "SSSL" | "L", "SL", "SSSL" | Attention pattern: S=sliding, L=local/global |

## Width vs Depth Tradeoff

In a fixed time budget:
- **Wider models** (higher AR) have more parameters per layer but same number of layers. Each step is slower, so fewer total steps. The extra capacity per step can compensate.
- **Deeper models** (higher DEPTH) have more sequential computation. Each step is slower, and gradient flow becomes harder. With few total steps, deeper models often don't converge.

**Rule of thumb for 5-minute budgets:**
- AR=96, DEPTH=8 is a strong default for H100
- AR=112 is too big — not enough steps to use the extra capacity
- DEPTH=10+ consistently underperforms DEPTH=8

## Search Protocol

### Step 1: Width Sweep

Test 5-6 aspect ratios in a single parallel wave:

```
AR=48 (baseline), AR=64, AR=72, AR=80, AR=96, AR=112
```

Look for the trend: val_bpb should improve as AR increases until VRAM or step count becomes the bottleneck.

### Step 2: Depth Check

With the best AR, test 2-3 depths:

```
DEPTH=6, DEPTH=8, DEPTH=10
```

Usually DEPTH=8 wins for 5-minute budgets. Deeper models need more steps to converge.

### Step 3: Attention Pattern

Test window patterns with the best AR + DEPTH:

```
WINDOW_PATTERN="L"    (all local/global)
WINDOW_PATTERN="SL"   (alternating sliding + local)
WINDOW_PATTERN="SSSL" (3 sliding + 1 local)
```

"SL" often outperforms "SSSL" for wider models. "L" only may be efficient on smaller hardware.

## VRAM Budget

Every architecture change affects memory. Monitor `peak_vram_mb` after each run:

| AR | Approx VRAM (DEPTH=8) | Fits H100 (80GB) | Fits H200 (141GB) |
| --- | --- | --- | --- |
| 48 | ~25 GB | Yes | Yes |
| 72 | ~40 GB | Yes | Yes |
| 96 | ~60 GB | Yes | Yes |
| 112 | ~75 GB | Tight | Yes |
| 128 | ~95 GB | No (OOM) | Yes |

If a configuration OOMs, it counts as a "crashed" experiment. Log it and move on.

## Steps Completed vs Model Size

The time budget is fixed. Larger models run fewer steps:

| AR | Approx Steps (5 min, H100) |
| --- | --- |
| 48 | ~1,450 |
| 72 | ~1,200 |
| 96 | ~1,060 |
| 112 | ~900 |

The sweet spot is where val_bpb improvement from extra capacity exceeds the loss from fewer steps. This is empirically found via the width sweep.

## Beyond Basic Architecture

Once the core architecture is optimized, consider:

- **Activation functions**: GeLU vs SiLU vs ReLU²
- **Normalization**: RMSNorm vs LayerNorm, pre-norm vs post-norm
- **Positional encoding**: RoPE vs ALiBi vs learned
- **Attention variants**: Multi-query attention, grouped-query attention
- **Residual connections**: Standard vs scaled vs gated

Each of these is a hypothesis to test in the experiment loop. Apply the same one-change-at-a-time discipline.

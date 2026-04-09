# Optimizer Guide

Tuning Muon, AdamW, and learning rate schedules for LLM training within fixed time budgets.

## Optimizer Stack

The default autoresearch setup uses a dual-optimizer approach:

| Optimizer | Applied To | Key Parameters |
| --- | --- | --- |
| **Muon** | Weight matrices (QKV, output projections, FFN) | `MATRIX_LR`, `momentum`, `ns_steps`, `muon_beta2` |
| **AdamW** | Embeddings, scalar parameters | `EMBEDDING_LR`, `SCALAR_LR`, `ADAM_BETAS`, `WEIGHT_DECAY` |

## Muon Optimizer

Muon (Momentum + Unitarization via Newton-Schulz) is a matrix-aware optimizer that normalizes weight updates. It tends to outperform AdamW for weight matrices in transformer models.

### Key Parameters

| Parameter | Default | Recommended Range | Notes |
| --- | --- | --- | --- |
| `MATRIX_LR` | 0.05 | 0.01 - 0.1 | Learning rate for Muon-optimized parameters |
| `momentum` | 0.95 | 0.90 - 0.97 | Momentum coefficient |
| `ns_steps` | 5 | 3 - 7 | Newton-Schulz orthogonalization iterations. More = more compute per step |
| `muon_beta2` | 0.95 | 0.95 - 0.99 | Second momentum for adaptive gradient scaling |

### Critical Finding: muon_beta2

In SkyPilot-scaled experiments, `muon_beta2 = 0.98` (up from 0.95) was the single largest late-stage improvement (~0.001 val_bpb). This parameter controls how aggressively gradient normalization adapts — a higher value smooths the normalization and permits larger effective steps.

Test beta2 in {0.95, 0.96, 0.97, 0.98, 0.99} as a focused sweep.

## AdamW

Used for embedding layers and scalar parameters where matrix-aware optimization isn't applicable.

### Key Parameters

| Parameter | Default | Recommended Range | Notes |
| --- | --- | --- | --- |
| `EMBEDDING_LR` | 0.6 | 0.1 - 1.0 | LR for token embedding layer |
| `SCALAR_LR` | 0.5 | 0.1 - 1.0 | LR for residual mixing scalars |
| `ADAM_BETAS` | (0.9, 0.95) | beta1: 0.7-0.9, beta2: 0.90-0.99 | Momentum parameters |
| `WEIGHT_DECAY` | 0.2 | 0.04 - 0.2 | L2 regularization strength |

### Interaction with Muon

When Muon handles weight matrices, AdamW only sees a smaller subset of parameters. This can change the optimal AdamW settings:

- Lower `ADAM_BETAS[0]` (e.g., 0.70 instead of 0.90) can work because Muon already provides momentum for matrices
- Lower `WEIGHT_DECAY` (0.08 vs 0.2) is common — Muon's normalization provides implicit regularization

## Learning Rate Schedules

### Warmup + Warmdown

The standard schedule for fixed-budget training:

1. **Warmup** (first ~5% of steps): Linear ramp from 0 to peak LR
2. **Constant** (middle portion): Hold at peak LR
3. **Warmdown** (last `WARMDOWN_RATIO` fraction): Cosine decay to `FINAL_LR_FRAC * peak_lr`

### Schedule Parameters

| Parameter | Default | Recommended Range |
| --- | --- | --- |
| `WARMDOWN_RATIO` | 0.6 | 0.3 - 0.8 |
| `FINAL_LR_FRAC` | 0.05 | 0.01 - 0.1 |

### Hardware-Dependent Schedules

The optimal `FINAL_LR_FRAC` can differ by hardware because faster GPUs complete more steps:

- On H200 (~9% more steps than H100), keeping LR higher toward the end helps
- Rankings that hold on H100 may flip on H200 for schedule-related parameters
- Always validate schedule changes on the target hardware

## Tuning Order

Recommended sequence for optimizer tuning:

1. **Batch size** first — determines how many optimizer steps fit in the time budget
2. **Weight decay** — large effect, usually want to decrease from defaults
3. **Adam betas** — especially beta1, which interacts with Muon's momentum
4. **Muon beta2** — high-value late-stage optimization
5. **Learning rates** — tune MATRIX_LR, EMBEDDING_LR, SCALAR_LR together or sequentially
6. **Schedule** — WARMDOWN_RATIO and FINAL_LR_FRAC last, after architecture is fixed

## Common Pitfalls

- **Tuning LR before architecture**: Architecture changes (model width) shift the optimal LR. Fix architecture first.
- **Ignoring LR-batch size coupling**: Halving batch size often requires adjusting LR. Test them together if both are in play.
- **Over-tuning ns_steps**: Going from 5 to 7 adds compute per step. The val_bpb improvement is usually marginal.
- **Assuming schedule transfers across hardware**: Always re-validate schedule parameters when moving to different GPU types.

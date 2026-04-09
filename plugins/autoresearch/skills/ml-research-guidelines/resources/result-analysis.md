# Result Analysis

How to interpret experiment metrics, detect diminishing returns, and decide when to stop searching.

## Primary Metric: val_bpb

**Validation bits per byte (val_bpb)** measures how well the model compresses held-out text. Lower is better.

Properties:
- Vocab-size-independent, so architecture changes are fairly compared
- Computed on a fixed validation set (same across all experiments)
- Small improvements (0.001) are meaningful at competitive levels
- Sensitive to random seed — use replication runs for close comparisons

## Reading Experiment Results

Each experiment produces a JSON line in `.autoresearch/experiments/experiment-log.jsonl`:

```json
{
  "id": "exp-042",
  "result": 0.981,
  "previous_best": 1.003,
  "delta": -0.022,
  "status": "improved",
  "hardware": "H100",
  "steps_completed": 1450,
  "peak_vram_mb": 45200
}
```

### Key Fields

| Field | Interpretation |
| --- | --- |
| `delta` | Negative = improved. The magnitude indicates significance. |
| `steps_completed` | Fewer steps than expected may indicate a larger model or slower config. |
| `peak_vram_mb` | Monitor for OOM risk. Keep below 90% of GPU memory. |
| `hardware` | Critical for cross-hardware comparison (see below). |

## Cross-Hardware Comparison

Identical configurations produce different val_bpb on different hardware because faster GPUs complete more training steps:

| Hardware | Relative Steps (5 min) | val_bpb Offset |
| --- | --- | --- |
| H100 | Baseline | Baseline |
| H200 | ~9% more | ~0.003-0.005 lower |

**Rule**: Never compare raw val_bpb across hardware types. Either:
1. Normalize by steps completed, or
2. Maintain separate best-config trackers per hardware type, or
3. Validate all finalists on the same hardware

The SkyPilot-scaled autoresearch approach: screen on H100, validate winners on H200.

## Diminishing Returns Detection

Track improvement rate across experiment batches:

```
Phase 1 (hyperparams):    1.003 → 0.981  (Δ = 0.022, ~200 experiments)
Phase 2 (architecture):   0.981 → 0.977  (Δ = 0.004, ~200 experiments)
Phase 3 (fine-tuning):    0.977 → 0.975  (Δ = 0.002, ~150 experiments)
Phase 4 (optimizer):      0.975 → 0.974  (Δ = 0.001, ~150 experiments)
Phase 5 (combinations):   0.974 → ???    (Δ < 0.0001)
```

### Stopping Criteria

Stop the current search phase when any of:

1. **Improvement per experiment** drops below 0.0001 val_bpb
2. **Last N experiments** (N=20) show no improvement
3. **The search space is exhausted** — all reasonable combinations tested
4. **Compute budget is exceeded** — wall-clock time or GPU-hours limit reached

## Analyzing Sweep Results

When reviewing a parallel wave of experiments:

### Ranking

Sort by val_bpb ascending. The top result is the candidate for the new baseline.

### Sensitivity Analysis

For each varied parameter, compute the range of val_bpb across its values while holding others constant. Parameters with larger ranges are more important to tune finely.

### Interaction Detection

If the best value of parameter A changes depending on parameter B, they interact. Always test interacting parameters together in factorial grids.

### Statistical Significance

For close results (delta < 0.002), run replication experiments with different random seeds. A result is reliable if it holds across 3+ seeds.

## Failure Analysis

### Common Failure Modes

| Symptom | Likely Cause | Action |
| --- | --- | --- |
| val_bpb increases | Change is harmful | Revert |
| val_bpb same as baseline | Change has no effect at this scale | Log and move on |
| Training crashes (OOM) | Model too large for VRAM | Reduce AR or DEPTH |
| Training crashes (NaN loss) | LR too high or numerical instability | Reduce LR, check dtype |
| val_bpb improves but steps_completed drops > 30% | Model too slow | May not scale; check if val_bpb improvement compensates |

### When to Investigate vs Move On

- **Crash on first step**: Likely a code bug. Debug it (up to 4 retries).
- **Crash after 50+ steps**: Likely numerical instability. Note the step count and try mitigations.
- **Slow convergence**: The model may need more steps than the time budget allows. Note it as "potentially better with longer training" and move on.

## Reporting

The `/research-report` command generates a summary from `experiment-log.jsonl`. Key sections:

1. **Best configuration** with full parameter listing
2. **Improvement timeline** showing val_bpb progression
3. **Top 10 experiments** ranked by delta
4. **Search coverage** — which parameters were explored and their ranges
5. **Recommendations** for further investigation

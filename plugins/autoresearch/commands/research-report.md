---
description: Generate a summary report of all experiments, findings, and the current best configuration
argument-hint: full | summary | timeline | --since <experiment-id>
---

Generate a research report from the experiment log.

## Data Source

Read `.autoresearch/experiments/experiment-log.jsonl` for all experiment data. Read `.autoresearch/experiments/best-config.json` for the current best configuration.

## Report Sections

### 1. Executive Summary

```
RESEARCH REPORT
═══════════════

Total Experiments: N
Successful: N  |  Crashed: N  |  Improved: N
Duration: X hours
Best val_bpb: X.XXX (experiment exp-NNN)
Baseline val_bpb: Y.YYY
Total Improvement: Z.ZZZ (P.P%)
```

### 2. Best Configuration

Full parameter listing of the current best configuration from `best-config.json`:

```
Best Configuration (exp-NNN):
  ASPECT_RATIO:    96
  DEPTH:           8
  TOTAL_BATCH_SIZE: 2**18
  WEIGHT_DECAY:    0.08
  ADAM_BETAS:      (0.70, 0.95)
  MATRIX_LR:       0.05
  EMBEDDING_LR:    0.6
  SCALAR_LR:       0.5
  muon_beta2:      0.98
  WARMDOWN_RATIO:  0.6
  FINAL_LR_FRAC:   0.05
  WINDOW_PATTERN:  "SL"
```

### 3. Improvement Timeline

Show val_bpb progression over experiments:

```
Improvement Timeline:
  exp-001 (baseline):     1.003
  exp-015 (batch size):   0.993  (Δ -0.010)
  exp-042 (weight decay): 0.981  (Δ -0.012)
  exp-089 (aspect ratio): 0.977  (Δ -0.004)
  exp-134 (muon_beta2):   0.974  (Δ -0.003)
```

### 4. Top 10 Experiments

Ranked by improvement delta, showing what each experiment changed and its result.

### 5. Search Coverage

Which parameters were explored and their tested ranges:

```
Parameter Coverage:
  WEIGHT_DECAY:     [0.04, 0.06, 0.08, 0.10, 0.12, 0.2] — 6 values
  ASPECT_RATIO:     [48, 64, 72, 80, 96, 112] — 6 values
  ADAM_BETA2:       [0.90, 0.93, 0.95, 0.99] — 4 values
  muon_beta2:       [0.95, 0.96, 0.97, 0.98, 0.99] — 5 values
  DEPTH:            [6, 8, 10] — 3 values
  TOTAL_BATCH_SIZE: [2**17, 2**18, 2**19] — 3 values
```

### 6. Failure Analysis

Summary of crashed experiments: common error types, retry success rate, patterns.

### 7. Recommendations

Based on the search trajectory:
- Which parameters have remaining headroom for improvement
- Whether diminishing returns have been reached
- Suggested next experiments or phase transitions
- Whether to run replication experiments for statistical confidence

## Arguments

`$ARGUMENTS` can be:
- `full` — Complete report with all sections (default)
- `summary` — Executive summary only
- `timeline` — Improvement timeline only
- `--since <experiment-id>` — Report only experiments after the specified ID

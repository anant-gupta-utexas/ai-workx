---
description: Run a single training experiment, parse metrics, and compare against the current best result
argument-hint: baseline | run | --script <path> | --budget <seconds>
---

Run a single training experiment and evaluate the result.

## Setup

1. Check that `.autoresearch/` directory exists. If not, create it with default config:
   ```yaml
   # .autoresearch/config.yaml
   metric: val_bpb
   time_budget: 300
   training_script: train.py
   ```

2. Detect the training script:
   - Check `$ARGUMENTS` for `--script <path>`
   - Fall back to `.autoresearch/config.yaml` -> `training_script`
   - Fall back to `train.py` in the project root

3. Check for `best-config.json` in `.autoresearch/experiments/`. If it doesn't exist, this is the baseline run.

## Execution

1. If `$ARGUMENTS` contains "baseline":
   - Run the training script as-is to establish the baseline
   - Save result as the initial `best-config.json`

2. Otherwise, run the experiment:
   ```bash
   uv run train.py 2>&1 | tee .autoresearch/experiments/latest-run.log
   ```
   If the experiment wrapper exists, prefer:
   ```bash
   bash hooks/experiment-wrapper.sh train.py
   ```

3. Parse output for metrics:
   - `val_bpb:` line -> primary metric
   - `peak_vram_mb:` line -> memory usage
   - Exit code -> success/crash status

## Evaluation

Compare the result against `.autoresearch/experiments/best-config.json`:

```
EXPERIMENT RESULT
═════════════════
Metric:        val_bpb
Result:        X.XXX
Previous Best: Y.YYY
Delta:         Z.ZZZ
Status:        IMPROVED / REGRESSED / NO CHANGE / CRASHED

Hardware:      [detected GPU type]
Steps:         [from output]
VRAM:          [peak_vram_mb] MB
Duration:      [seconds]
```

## Logging

Append a JSON line to `.autoresearch/experiments/experiment-log.jsonl` with:
- `id`: Auto-incremented experiment ID
- `timestamp`: ISO 8601
- `result`: val_bpb value
- `previous_best`: val_bpb of current best
- `delta`: result - previous_best
- `status`: improved / regressed / crashed
- `hardware`: Detected GPU type
- `steps_completed`: From training output
- `peak_vram_mb`: From training output
- `duration_seconds`: Wall clock time

If the result improved, update `.autoresearch/experiments/best-config.json` with the current `train.py` configuration.

## Arguments

`$ARGUMENTS` can be:
- `baseline` — Run current code as baseline, save as initial best
- `run` — Run experiment and compare to best (default)
- `--script <path>` — Use a specific training script
- `--budget <seconds>` — Override time budget

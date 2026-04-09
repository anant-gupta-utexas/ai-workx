---
description: Run a hyperparameter sweep across multiple configurations, optionally in parallel via Agent Teams or SkyPilot
argument-hint: <param>=<val1>,<val2>,... | --parallel | --grid <param1> <param2>
---

Run a hyperparameter sweep across multiple configurations.

## Parse Arguments

`$ARGUMENTS` specifies the sweep:

- **Single parameter**: `WEIGHT_DECAY=0.04,0.08,0.12,0.2`
- **Multiple parameters (grid)**: `--grid WEIGHT_DECAY=0.04,0.08 ADAM_BETA2=0.95,0.99`
- **Parallel flag**: `--parallel` to use Agent Teams or SkyPilot if available

## Generate Configurations

1. Parse parameter values from arguments
2. For grid sweeps, compute the Cartesian product of all parameter values
3. Assign each configuration an experiment ID

Example: `--grid WEIGHT_DECAY=0.04,0.08 ADAM_BETA2=0.95,0.99` produces:
```
exp-sweep-001: WEIGHT_DECAY=0.04, ADAM_BETA2=0.95
exp-sweep-002: WEIGHT_DECAY=0.04, ADAM_BETA2=0.99
exp-sweep-003: WEIGHT_DECAY=0.08, ADAM_BETA2=0.95
exp-sweep-004: WEIGHT_DECAY=0.08, ADAM_BETA2=0.99
```

## Execution

### Sequential (default)

For each configuration:
1. Modify `train.py` with the parameter values
2. Run `/experiment run`
3. Revert `train.py` to baseline before the next configuration
4. Collect the result

### Parallel via Agent Teams

If `--parallel` is specified and `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`:
1. Create a copy of `train.py` for each configuration
2. Spawn a Builder teammate per configuration
3. Each teammate runs the experiment independently
4. Collect all results when teammates complete

### Parallel via SkyPilot

If `--parallel` is specified and SkyPilot is available:
1. For each configuration, launch or queue on a GPU cluster:
   ```bash
   sky exec gpu-NN experiment.yaml -d \
     --env EXPERIMENT_ID=exp-sweep-NNN \
     --env EXPERIMENT_DESC="PARAM=VALUE"
   ```
2. Monitor all clusters until all experiments complete
3. Parse results from `sky logs`

## Analysis

After all configurations have run, produce a sweep report:

```
SWEEP RESULTS: [N configurations]
═══════════════════════════════════

Rank | ID           | val_bpb | Config
─────┼──────────────┼─────────┼──────────────────────
  1  | exp-sweep-003| 0.978   | WD=0.08, BETA2=0.95
  2  | exp-sweep-004| 0.979   | WD=0.08, BETA2=0.99
  3  | exp-sweep-001| 0.983   | WD=0.04, BETA2=0.95
  4  | exp-sweep-002| 0.984   | WD=0.04, BETA2=0.99

Best: exp-sweep-003 (val_bpb=0.978)
Current baseline: 0.985
Improvement: 0.007

Sensitivity:
  WEIGHT_DECAY: range 0.005 (high sensitivity)
  ADAM_BETA2:   range 0.001 (low sensitivity)

Interactions: [detected / none]

Recommendation: [adopt best config / run finer grid / test on validation hardware]
```

## Logging

Log all sweep experiments to `.autoresearch/experiments/experiment-log.jsonl` with a shared `sweep_id` field. If the best sweep result improves on the current baseline, update `best-config.json`.

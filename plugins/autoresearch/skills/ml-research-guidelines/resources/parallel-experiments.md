# Parallel Experiments

Scaling autoresearch to multiple GPUs with SkyPilot, including cluster management, hardware-aware strategies, and Agent Teams integration.

## Overview

Sequential autoresearch runs ~10-12 experiments/hour on a single GPU. With 16 GPUs and SkyPilot, throughput scales to ~90 experiments/hour — a 9x improvement that changes the search strategy from greedy hill-climbing to factorial grids.

## SkyPilot Integration

### experiment.yaml Template

```yaml
resources:
  accelerators: {H100:1, H200:1}
  image_id: docker:nvcr.io/nvidia/pytorch:24.07-py3
  infra: k8s  # or slurm, aws, gcp, azure, etc.

workdir: .

envs:
  EXPERIMENT_ID: baseline
  EXPERIMENT_DESC: "baseline run"

setup: |
  pip install uv
  uv sync
  uv run prepare.py

run: |
  uv run train.py 2>&1 | tee run.log
  EXIT_CODE=${PIPESTATUS[0]}

  if [ $EXIT_CODE -ne 0 ]; then
    echo "EXPERIMENT_STATUS: crash"
  else
    VAL_BPB=$(grep "^val_bpb:" run.log | awk '{print $2}')
    PEAK_VRAM=$(grep "^peak_vram_mb:" run.log | awk '{print $2}')
    MEMORY_GB=$(echo "scale=1; ${PEAK_VRAM} / 1024" | bc)
    echo "EXPERIMENT_STATUS: done"
    echo "EXPERIMENT_RESULT: ${EXPERIMENT_ID} val_bpb=${VAL_BPB} memory_gb=${MEMORY_GB}"
  fi
  echo "EXPERIMENT_DESC: ${EXPERIMENT_DESC}"
```

### Cluster Management Commands

```bash
# Provision a cluster (returns immediately with -d)
sky launch gpu-01 experiment.yaml -d -y \
  --env EXPERIMENT_ID=exp-01 \
  --env EXPERIMENT_DESC="baseline run"

# Queue next experiment on same cluster (skips setup)
sky exec gpu-01 experiment.yaml -d \
  --env EXPERIMENT_ID=exp-02 \
  --env EXPERIMENT_DESC="higher LR"

# Check results
sky logs gpu-01

# Check all cluster status
sky status

# Tear down clusters when done
sky down gpu-01
```

### Pipelining Experiments

`sky exec` queues a job that starts when the current one finishes. This allows zero-idle pipelining on each cluster:

```bash
# Queue 3 experiments on gpu-01 — they run sequentially, no idle time
sky exec gpu-01 experiment.yaml -d --env EXPERIMENT_ID=exp-01 --env ...
sky exec gpu-01 experiment.yaml -d --env EXPERIMENT_ID=exp-02 --env ...
sky exec gpu-01 experiment.yaml -d --env EXPERIMENT_ID=exp-03 --env ...
```

## Hardware-Aware Strategies

### Two-Tier Validation

When you have access to multiple GPU types (e.g., 13 H100s + 3 H200s):

1. **Screen** hypotheses on the cheaper/more-available hardware (H100)
2. **Validate** the top 2-3 candidates on faster hardware (H200)
3. **Report** final results from the validation tier

This emerged naturally from SkyPilot-scaled autoresearch — the agent noticed val_bpb was consistently ~0.005 lower on H200 (more steps in the same time budget) and developed the screening strategy autonomously.

### Why Rankings Can Differ

H200 completes ~9% more training steps than H100 in the same 5-minute window. This means:

- Configurations that benefit from more steps (e.g., lower final LR) rank higher on H200
- Rankings that hold across hardware types are more robust
- Schedule-sensitive parameters (WARMDOWN_RATIO, FINAL_LR_FRAC) should always be validated on target hardware

### Infrastructure Selection

```yaml
resources:
  # Prefer H200, fall back to H100
  accelerators: {H200:1, H100:1}
  infra: k8s

  # Or target specific infrastructure
  # infra: aws     # Amazon Web Services
  # infra: gcp     # Google Cloud
  # infra: azure   # Microsoft Azure
  # infra: slurm   # On-prem SLURM cluster
```

## Agent Teams Integration

When SkyPilot is not available or not needed (local multi-GPU), use Claude Code Agent Teams:

```
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

Each Builder teammate:
1. Receives a specific `train.py` variant to test
2. Runs the experiment locally
3. Writes results to `.autoresearch/experiments/`
4. Returns a summary to the orchestrating agent

### Sequential Fallback

When neither SkyPilot nor Agent Teams is available, all commands fall back to sequential execution. The `/sweep` command runs experiments one at a time, and `/tree-search` expands one node per iteration.

## Parallel Wave Protocol

### 1. Define the Wave

Select 10-16 experiment variants (one per available GPU):

```json
[
  {"id": "exp-100", "WEIGHT_DECAY": 0.04, "ADAM_BETA2": 0.95},
  {"id": "exp-101", "WEIGHT_DECAY": 0.04, "ADAM_BETA2": 0.99},
  {"id": "exp-102", "WEIGHT_DECAY": 0.08, "ADAM_BETA2": 0.95},
  {"id": "exp-103", "WEIGHT_DECAY": 0.08, "ADAM_BETA2": 0.99}
]
```

### 2. Launch All

```bash
for i in $(seq 1 16); do
  sky exec gpu-$(printf "%02d" $i) experiment.yaml -d \
    --env EXPERIMENT_ID=exp-$((99+i)) \
    --env EXPERIMENT_DESC="..."
done
```

### 3. Collect Results

Poll `sky logs` for all clusters until all experiments complete. Parse `EXPERIMENT_RESULT` lines.

### 4. Analyze and Iterate

Rank results, identify the best configuration, and design the next wave based on findings.

## Cost Estimation

| Setup | GPUs | Duration | Approx Cost |
| --- | --- | --- | --- |
| 1x H100, 8 hours | 1 | 8h | ~$16 |
| 16x H100, 8 hours | 16 | 8h | ~$256 |
| 13x H100 + 3x H200, 8 hours | 16 | 8h | ~$275 |

API costs for Claude Code are separate (~$9 for an 8-hour session).

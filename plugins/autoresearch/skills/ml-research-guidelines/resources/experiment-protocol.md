# Experiment Protocol

The core edit-run-check loop for autonomous ML research, based on Karpathy's autoresearch.

## Overview

The agent modifies a single training script, runs a fixed-duration experiment, evaluates the result, and decides whether to keep or discard the change. This loop is the atomic unit of all research workflows in this plugin.

## Files

| File | Role | Editable |
| --- | --- | --- |
| `prepare.py` | Data prep, tokenizer, dataloader, evaluation | No |
| `train.py` | Model, optimizer, training loop | Yes (agent only) |
| `program.md` | Agent instructions | Yes (human only) |

## The Loop

### Step 1: Hypothesize

Before editing, articulate a single, testable hypothesis:

- "Reducing batch size from 2^19 to 2^18 will allow more optimizer steps in the time budget, improving val_bpb"
- "Increasing model width (aspect ratio 48 -> 96) will improve capacity without exceeding VRAM"

Write the hypothesis to `.autoresearch/experiments/experiment-log.jsonl` before running.

### Step 2: Edit

Make a single, focused change to `train.py`. Never change multiple independent things at once — if a run improves, you need to know which change caused it.

Good edits:
- Change one hyperparameter (e.g., `WEIGHT_DECAY = 0.08`)
- Modify one architectural parameter (e.g., `ASPECT_RATIO = 96`)
- Swap one optimizer setting (e.g., `muon_beta2 = 0.98`)

Bad edits:
- Change batch size AND learning rate AND model depth simultaneously
- Rewrite the entire training loop

### Step 3: Run

Execute the training script with a fixed time budget:

```bash
uv run train.py
```

The time budget is enforced by the training script itself (default: 5 minutes wall clock, excluding startup/compilation). Alternatively, use the experiment wrapper:

```bash
./hooks/experiment-wrapper.sh train.py
```

### Step 4: Evaluate

Parse the output for the primary metric:

- **val_bpb** (validation bits per byte) — lower is better, vocab-size-independent
- **peak_vram_mb** — must not exceed GPU memory

Compare against the current best in `.autoresearch/experiments/best-config.json`.

### Step 5: Decide

- **IMPROVED**: val_bpb decreased. Keep the change. Update `best-config.json`. Commit to git.
- **REGRESSED**: val_bpb increased or stayed the same. Revert the change. Log the result.
- **CRASHED**: Training failed. Log the error. Revert. Consider a debugging attempt (max 4 retries per experiment).

### Step 6: Log

Append a JSON line to `.autoresearch/experiments/experiment-log.jsonl`:

```json
{
  "id": "exp-042",
  "timestamp": "2026-03-31T14:22:00Z",
  "hypothesis": "Reduce batch size to 2^18 for more optimizer steps",
  "changes": {"TOTAL_BATCH_SIZE": "2**18"},
  "metric": "val_bpb",
  "result": 0.981,
  "previous_best": 1.003,
  "delta": -0.022,
  "status": "improved",
  "hardware": "H100",
  "steps_completed": 1450,
  "peak_vram_mb": 45200,
  "duration_seconds": 300
}
```

### Step 7: Repeat

Generate the next hypothesis based on accumulated results and return to Step 1.

## Experiment Throughput

| Setup | Experiments/Hour | Strategy |
| --- | --- | --- |
| Single GPU, sequential | ~10-12 | Greedy hill-climbing |
| 16 GPUs, parallel (SkyPilot) | ~90 | Factorial grids per wave |

## Error Handling

When an experiment crashes:

1. Capture the full error traceback
2. Log it as a failed experiment
3. Attempt automated debugging (inspect the error, apply a fix)
4. Retry up to 4 times
5. If all retries fail, revert to last known good state and move to the next hypothesis

## Dataset Integration

For datasets not bundled with the project:

- Use HuggingFace Hub MCP to discover datasets
- Generate data-loading code in `prepare.py` (or a separate loader)
- For smaller-compute setups, consider lower-entropy datasets (e.g., TinyStories) and reduced `vocab_size`, `MAX_SEQ_LEN`

## Platform Considerations

| Platform | Adjustments |
| --- | --- |
| H100 (80GB) | Default settings, full model size |
| H200 (141GB) | ~9% more steps in same time budget, use for validation tier |
| Smaller GPUs | Reduce DEPTH, ASPECT_RATIO, MAX_SEQ_LEN, TOTAL_BATCH_SIZE |
| CPU/MPS | Use fork with platform support, significantly reduce model size |

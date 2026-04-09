---
description: Run parallelized experiment tree search with 4 stages (preliminary, hyperparameter, research agenda, ablation)
argument-hint: init | --stage <1-4> | --nodes <N> | status | --budget <max-nodes>
---

Run a tree-based experiment search that explores configurations through 4 stages, with parallel execution via Agent Teams or SkyPilot.

## Arguments

- `init` — Initialize tree search state in `.autoresearch/tree/`
- `--stage <1-4>` — Run a specific stage (default: auto-detect from tree state)
- `--nodes <N>` — Number of nodes to expand per iteration (default: auto based on available GPUs)
- `status` — Show current tree state
- `--budget <max-nodes>` — Maximum total nodes for this session

## Initialization

If `.autoresearch/tree/tree-state.json` doesn't exist, create it:

```json
{
  "current_stage": 1,
  "total_nodes": 0,
  "buggy_nodes": 0,
  "non_buggy_nodes": 0,
  "best_node_id": null,
  "best_val_bpb": null,
  "stage_roots": { "1": null, "2": null, "3": null, "4": null },
  "budget_remaining": { "stage_1": 5, "stage_2": 20, "stage_3": 50, "stage_4": 20 }
}
```

Create stage directories: `stage-1/`, `stage-2/`, `stage-3/`, `stage-4/`.

## Stage Execution

For each stage, repeat until the stopping criterion or budget is exhausted:

### 1. Select Nodes for Expansion

```
With probability 0.3: select a random buggy node (prioritize debugging)
Otherwise: select the non-buggy node with best val_bpb (best-first)
```

Select N nodes total (N = available GPUs or `--nodes` argument).

### 2. Generate Child Nodes

For each selected parent:
- If parent was **buggy**: generate a debug attempt (fix the error)
- If parent was **non-buggy**: generate a refinement (improve the approach)
- For **stage 2**: generate hyperparameter variants
- For **stage 4**: generate ablation variants (remove/modify a component)

Each child node gets:
- A modified `train.py` implementing the variant
- A plan description explaining the change
- A unique node ID

### 3. Execute Experiments

**Parallel (Agent Teams):**
- Spawn N Builder teammates, one per child node
- Each teammate runs the experiment and writes results to `.autoresearch/tree/stage-N/node-ID.json`

**Parallel (SkyPilot):**
- Launch N experiments across GPU clusters
- Each experiment runs the modified `train.py` variant
- Parse results from `sky logs`

**Sequential (fallback):**
- Run each child node one at a time via `/experiment`

### 4. Evaluate Results

For each completed child node:
1. Parse val_bpb, peak_vram_mb, steps_completed
2. Mark as **buggy** (crash or invalid) or **non-buggy** (successful)
3. Write node data to `.autoresearch/tree/stage-N/node-ID.json`
4. Update `tree-state.json`

### 5. Check Stopping Criterion

- **Stage 1**: Stop when a basic working prototype executed successfully
- **Stage 2**: Stop when results are stable across 2+ runs
- **Stage 3**: Stop when budget exhausted
- **Stage 4**: Stop when budget exhausted

## Stage Transition

When a stage completes:

1. Use the experiment-reviewer agent to evaluate all leaf nodes
2. Select the best leaf as the root for the next stage
3. Update `tree-state.json`:
   ```json
   { "current_stage": N+1, "stage_roots": { "N+1": "best-node-id" } }
   ```
4. Report the transition decision

## Replication

After Stage 4 (or when explicitly requested):

1. Take the best node
2. Create 3-5 replication nodes with different random seeds
3. Run all replications
4. Create an aggregation node:
   - Compute mean +/- std of val_bpb across seeds
   - Generate aggregate figures with error bars
   - Write summary for manuscript use

## Status Report

When `$ARGUMENTS` is "status":

```
TREE SEARCH STATUS
══════════════════
Current Stage: N (name)
Total Nodes:   X (Y buggy, Z non-buggy)
Best val_bpb:  X.XXX (node-ID)
Budget:        N/M nodes remaining in current stage

Stage Progress:
  Stage 1 (Preliminary):    [complete / N nodes]
  Stage 2 (Hyperparameter): [complete / N nodes]
  Stage 3 (Research):       [in-progress / N nodes, M remaining]
  Stage 4 (Ablation):       [not started]

Recent Nodes:
  node-042: val_bpb=0.977 (non-buggy) — "wider model AR=96"
  node-041: CRASHED (buggy) — "AR=112 exceeded VRAM"
  node-040: val_bpb=0.981 (non-buggy) — "AR=80 baseline"
```

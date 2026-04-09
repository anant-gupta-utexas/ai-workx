# Tree Search Protocol

4-stage parallelized experiment tree search with specialized node types, modeled after the AI Scientist's template-free experimentation system.

## Overview

The tree search replaces sequential hill-climbing with a structured, multi-stage exploration. Each stage runs its own tree search, and the best leaf from one stage seeds the next. State is persisted in `.autoresearch/tree/`.

## Four Stages

### Stage 1: Preliminary Investigation

**Goal:** Test basic viability of the idea.

- Start from a baseline implementation
- Run 2-3 basic experiments to verify the idea works at all
- **Stopping criterion:** A working prototype has successfully executed

### Stage 2: Hyperparameter Tuning

**Goal:** Optimize the working prototype.

- Systematic exploration of hyperparameter configurations
- Track previously tested hyperparameters to avoid redundancy
- **Stopping criterion:** Convergence in training curves + successful execution across 2+ datasets

### Stage 3: Research Agenda Execution

**Goal:** Run the main experiments via tree search.

- This is the largest stage — bulk of the compute budget
- Expand the tree with diverse experimental variants
- Use best-first selection to prioritize promising branches
- **Stopping criterion:** Computational budget exhausted

### Stage 4: Ablation Studies

**Goal:** Understand the contribution of each component.

- Test removing or modifying each key component
- Track previously tested ablation conditions
- **Stopping criterion:** Computational budget exhausted

## Node Types

### Standard Nodes

| Status | Description | Next Action |
| --- | --- | --- |
| **non-buggy** | Experiment completed successfully | Expand with refinements |
| **buggy** | Experiment crashed or produced invalid results | Expand with debug attempt |

### Specialized Nodes

| Type | Purpose | When Created |
| --- | --- | --- |
| **hyperparameter** | Test alternative hyperparameter configs | Stage 2 |
| **ablation** | Remove/modify a component to test its contribution | Stage 4 |
| **replication** | Re-run parent experiment with different random seed | After best config identified |
| **aggregation** | Consolidate results from replication nodes | After replication nodes complete |

## Node Data Structure

Each node in `.autoresearch/tree/` contains:

```json
{
  "id": "node-042",
  "parent_id": "node-031",
  "stage": 3,
  "type": "standard",
  "status": "non-buggy",
  "experiment_script": "train_v42.py",
  "plan_description": "Test wider model (AR=96) with reduced weight decay",
  "error_trace": null,
  "runtime_seconds": 305,
  "metrics": {
    "val_bpb": 0.977,
    "peak_vram_mb": 58400,
    "steps_completed": 1060
  },
  "code_critique": "Clean implementation. Consider adding gradient clipping.",
  "figures": ["fig_loss_42.png", "fig_lr_42.png"],
  "vlm_feedback": "Loss curve shows clean convergence. Labels are clear.",
  "created_at": "2026-03-31T14:22:00Z"
}
```

## Node Selection

### For Non-Buggy Nodes: Best-First Search

Evaluate candidates based on:
1. val_bpb (primary metric, lower is better)
2. Training dynamics (smooth convergence preferred)
3. Quality of generated figures
4. Code quality assessment

### For Buggy Nodes: Priority Debugging

With a predefined probability, select a buggy node for expansion instead of a non-buggy one. This prioritizes error resolution — a fixed bug can unlock a whole branch of the tree.

### Selection Algorithm

```
At each iteration:
  if random() < BUG_FIX_PROBABILITY (default 0.3):
    select a random buggy node
  else:
    select the non-buggy node with best val_bpb
  
  create a child node:
    if parent was buggy: attempt to fix the error
    if parent was non-buggy: propose a refinement
```

## Parallel Execution

### With Agent Teams

Each iteration can expand N nodes simultaneously:

1. Select N nodes for expansion (mix of buggy and non-buggy)
2. Fork N Builder teammates, each working on one child node
3. Each teammate: generates plan + code, runs experiment, collects results
4. All results written to `.autoresearch/tree/stage-N/`
5. Orchestrator evaluates results and selects next batch

### With SkyPilot

Same pattern, but experiments run on separate GPU clusters:

1. Select N nodes, generate N `train.py` variants
2. Launch N experiments via `sky exec` on separate clusters
3. Poll `sky logs` until all complete
4. Parse results and update tree state

## Tree State File

`.autoresearch/tree/tree-state.json` tracks the full tree:

```json
{
  "current_stage": 3,
  "total_nodes": 42,
  "buggy_nodes": 8,
  "non_buggy_nodes": 34,
  "best_node_id": "node-037",
  "best_val_bpb": 0.974,
  "stage_roots": {
    "1": "node-001",
    "2": "node-005",
    "3": "node-012",
    "4": null
  },
  "budget_remaining": {
    "stage_3_nodes": 15,
    "stage_4_nodes": 10
  }
}
```

## Stage Transitions

At the end of each stage:

1. Evaluate all leaf nodes using the experiment-reviewer agent
2. Select the most promising leaf as the root for the next stage
3. Write the transition decision to `tree-state.json`
4. Begin the next stage's tree search from the selected root

## Replication and Aggregation

After the final stage identifies the best configuration:

1. Create 3-5 **replication nodes** with different random seeds
2. Run all replications (parallel if possible)
3. Create an **aggregation node** that:
   - Computes mean and standard deviation of val_bpb
   - Generates aggregate figures with error bars
   - Produces a summary for the manuscript

## Compute Budget

Default allocations (adjustable in `.autoresearch/config.yaml`):

| Stage | Max Nodes | Max Time per Node |
| --- | --- | --- |
| 1. Preliminary | 5 | 1 hour |
| 2. Hyperparameter | 20 | 1 hour |
| 3. Research Agenda | 50 | 1 hour |
| 4. Ablation | 20 | 1 hour |
| Replication | 5 | 1 hour |

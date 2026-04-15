---
name: ml-research-guidelines
description: Comprehensive guide for autonomous ML research workflows including single-agent experiment loops, parallel GPU experimentation, tree search, manuscript generation, automated peer review, and queue-based orchestration with fresh context per phase. Use when running training experiments, hyperparameter sweeps, optimizing neural network architectures, interpreting val_bpb or validation metrics, managing SkyPilot GPU clusters, writing research papers, running the full AI Scientist pipeline, or orchestrating multi-phase research with context isolation. Covers Karpathy's autoresearch protocol, SkyPilot parallel scaling, the AI Scientist's multi-phase research lifecycle, and fresh-context orchestration patterns.
---

# ML Research Guidelines

## Purpose

Establish a comprehensive workflow for autonomous ML research — from single-experiment loops to full research pipelines that produce manuscripts and peer reviews. Combines patterns from Karpathy's autoresearch, SkyPilot parallel scaling, and the AI Scientist.

## When to Use This Skill

Automatically activates when working on:

- Running training experiments with fixed time budgets
- Hyperparameter sweeps or grid searches
- Neural network architecture modifications (width, depth, attention patterns)
- Optimizer tuning (Muon, AdamW, learning rate schedules)
- Interpreting validation metrics (val_bpb, loss curves, convergence)
- Managing GPU clusters via SkyPilot (`sky launch`, `sky exec`, `sky logs`)
- Parallel experiment execution across multiple GPUs
- Writing research manuscripts from experiment results
- Running automated peer review on papers
- Tree search over experiment configurations
- Orchestrating multi-phase research with fresh context per phase
- Queue-based task management across research topics

---

## Quick Start

### Single Experiment Loop

The core workflow: edit code, train, evaluate, keep or discard.

1. Edit `train.py` with a single hypothesis
2. Run `uv run train.py` (fixed 5-minute time budget)
3. Parse `val_bpb` from output
4. Compare against best known result
5. Keep if improved, revert if not
6. Record result in `.autoresearch/experiments/experiment-log.jsonl`
7. Repeat with next hypothesis

See `./resources/experiment-protocol.md` for the full protocol.

### Parallel Experiments (SkyPilot)

Scale to N GPUs for factorial sweeps:

1. Define experiment variants in SkyPilot YAML
2. Launch clusters: `sky launch gpu-N experiment.yaml -d`
3. Queue experiments: `sky exec gpu-N experiment.yaml -d --env ...`
4. Monitor: `sky logs gpu-N`
5. Collect results, compare across hardware

See `./resources/parallel-experiments.md` for SkyPilot integration.

### Full Research Pipeline

Four-phase AI Scientist workflow:

1. **Ideation** — Generate research directions, check novelty
2. **Experimentation** — Tree search across configurations
3. **Manuscript** — Generate paper from experiment logs
4. **Review** — Ensemble peer review (5 reviews + meta-review)

State persists in `.autoresearch/` across phases.

---

## Core Principles

1. **Fixed time budget** — Every experiment runs for exactly the configured duration (default 5 min). This makes results comparable regardless of architecture or batch size changes.
2. **Single file modification** — Only `train.py` (or the designated training script) is edited between experiments. Keep the scope reviewable.
3. **Metric-driven decisions** — Keep changes that improve `val_bpb` (or the configured metric). Discard everything else. No exceptions.
4. **File-based state** — All pipeline state lives in `.autoresearch/`. Phases communicate via files, enabling context isolation between phases.
5. **Hardware-aware search** — When multiple GPU types are available, screen hypotheses on cheaper hardware and validate winners on faster hardware.
6. **Reproducibility** — Log every experiment with full configuration, random seed, hardware type, and metrics. Enable replication runs on best configs.

---

## Experiment Search Strategy

### Phase 1: Hyperparameter Sweeps (first ~200 experiments)

Test obvious knobs in parallel: batch size, learning rate, weight decay, Adam betas, model depth.

### Phase 2: Architecture Discovery (~200-400 experiments)

Test model width/depth tradeoffs. This often yields the largest single improvement. Run factorial grids of aspect ratios in one wave.

### Phase 3: Fine-Tuning (~400-600 experiments)

With the best architecture locked, tune around it: warmdown schedule, optimizer-specific parameters, learning rate fractions.

### Phase 4: Diminishing Returns (~600+ experiments)

Combinatorial sweeps over remaining knobs. Stop when improvement per experiment drops below threshold.

See `./resources/hyperparameter-tuning.md` and `./resources/architecture-search.md` for strategies.

---

## Tree Search Protocol

For complex research, use the 4-stage experiment progress manager:

1. **Preliminary** — Test basic viability of the idea
2. **Hyperparameter** — Tune hyperparameters on working prototype
3. **Research Agenda** — Execute main experiments via tree search
4. **Ablation** — Understand contribution of each component

Each stage runs its own tree search with node types: buggy, non-buggy, hyperparameter, ablation, replication, aggregation.

See `./resources/tree-search-protocol.md` for the full protocol.

---

## Anti-Patterns to Avoid

- Do not change multiple things between experiments — isolate variables
- Do not skip logging a failed experiment — failures inform the search
- Do not manually tune when a sweep would be faster
- Do not ignore hardware differences when comparing results across GPU types
- Do not commit `train.py` changes without a passing experiment
- Do not exceed VRAM budget — check `peak_vram_mb` after each run
- Do not run experiments without the time budget enforced

---

## Pipeline State Directory

All state lives in `.autoresearch/` at the project root:

```
.autoresearch/
  config.yaml              # Research scope, time budget, GPU config
  ideas/                   # Phase 1: ranked research ideas
  experiments/             # Phase 2: experiment results
    experiment-log.jsonl   # Append-only log of all runs
    best-config.json       # Current best configuration
  tree/                    # Tree search state (stages 1-4)
  manuscripts/             # Phase 3: generated papers
  reviews/                 # Phase 4: review results
  queue/                   # Orchestration state (fresh-context per phase)
    queue.json             # Task list with phase tracking
    tasks/                 # Per-task handoff files
```

---

## Resource Navigation

| Need to... | Read this |
| --- | --- |
| Understand the edit-run-check experiment loop | `./resources/experiment-protocol.md` |
| Run hyperparameter sweeps and grid searches | `./resources/hyperparameter-tuning.md` |
| Explore model width, depth, attention patterns | `./resources/architecture-search.md` |
| Tune Muon, AdamW, learning rate schedules | `./resources/optimizer-guide.md` |
| Interpret metrics and detect diminishing returns | `./resources/result-analysis.md` |
| Scale to multiple GPUs with SkyPilot | `./resources/parallel-experiments.md` |
| Search literature and check novelty | `./resources/literature-search.md` |
| Generate a research manuscript | `./resources/manuscript-writing.md` |
| Run 4-stage tree search over experiments | `./resources/tree-search-protocol.md` |
| Run ensemble peer review on a paper | `./resources/review-protocol.md` |
| Orchestrate phases with fresh context isolation | `./resources/orchestration-protocol.md` |
| Maintain a human-readable research log | `./resources/lab-notebook.md` |

---

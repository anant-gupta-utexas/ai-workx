# Autoresearch Plugin

Autonomous ML research plugin that covers the full spectrum from single-agent experiment loops to multi-phase research pipelines with manuscript generation and automated peer review.

Combines patterns from:
- [Karpathy's autoresearch](https://github.com/karpathy/autoresearch) — single-agent experiment loop
- [SkyPilot parallel scaling](https://blog.skypilot.co/scaling-autoresearch/) — multi-GPU orchestration
- [The AI Scientist](https://www.nature.com/articles/s41586-026-10265-5) — full research lifecycle
- [CCG-workflow](https://github.com/fengshao1227/ccg-workflow) — multi-agent coordination patterns

## Installation

```bash
/plugin marketplace add anant-gupta-utexas/ai-workx
/plugin install autoresearch@ai-workx
```

## What's Included

| Component | Count | Details |
| --- | --- | --- |
| Skills | 1 | ml-research-guidelines (12 resource guides) |
| Agents | 4 | research-orchestrator, ml-researcher, experiment-reviewer, paper-writer |
| Commands | 7 | experiment, sweep, research-report, research-pipeline, tree-search, review-paper, orchestrate |
| Hooks | 3 | experiment-budget-guard, result-regression-check, sky-auto-auth |
| Infrastructure | 2 | experiment-wrapper.sh, config-template.yaml |

## Quick Start

### Run a Single Experiment

```bash
/experiment baseline    # Establish baseline
# Edit train.py with a hypothesis
/experiment run         # Run and compare against baseline
```

### Run a Hyperparameter Sweep

```bash
/sweep WEIGHT_DECAY=0.04,0.08,0.12,0.2
/sweep --grid WEIGHT_DECAY=0.04,0.08 ADAM_BETA2=0.95,0.99 --parallel
```

### Run the Full Research Pipeline

```bash
/research-pipeline improving transformer training efficiency
/research-pipeline resume    # Resume from last phase
/research-pipeline status    # Check progress
```

### Run Tree Search

```bash
/tree-search init
/tree-search --stage 1 --nodes 5
/tree-search status
```

### Review a Paper

```bash
/review-paper .autoresearch/manuscripts/draft-v1.tex
/review-paper --format workshop --reviews 5
```

### Orchestrate with Fresh Context

```bash
/orchestrate 4                       # Process 4 phases from queue (fresh context each)
/orchestrate --phase experimentation # Run just one phase in isolation
/orchestrate status                  # Show queue state
/orchestrate resume                  # Resume from last incomplete phase
```

## Skills

### ml-research-guidelines

Auto-activates when working with training experiments, hyperparameters, model architectures, optimizers, validation metrics, GPU clusters, research pipelines, or manuscript writing.

**Resource Guides (12):**

| Guide | Topics |
| --- | --- |
| experiment-protocol | Edit-run-check loop, logging, error handling |
| hyperparameter-tuning | Grid search, factorial sweeps, interaction detection |
| architecture-search | Width vs depth, aspect ratio, attention patterns, VRAM budget |
| optimizer-guide | Muon, AdamW, learning rate schedules, tuning order |
| result-analysis | Metric interpretation, diminishing returns, stopping criteria |
| parallel-experiments | SkyPilot YAML, multi-GPU management, hardware-aware strategies |
| literature-search | Semantic Scholar MCP, novelty checking, citation building |
| manuscript-writing | LaTeX generation, section-by-section protocol, figure quality |
| tree-search-protocol | 4-stage progress manager, node types, best-first selection |
| review-protocol | Ensemble peer review, scoring rubric, meta-review aggregation |
| orchestration-protocol | Queue-based phase management, handoff files, context isolation |
| lab-notebook | Human-readable research log, resume protocol, session continuity |

## Agents

| Agent | Role | Model |
| --- | --- | --- |
| **research-orchestrator** | Coordinates the 4-phase pipeline (ideation, experiment, manuscript, review) via file-based state | opus |
| **ml-researcher** | Core experiment loop: hypothesize, edit, run, evaluate, decide | opus |
| **experiment-reviewer** | Validates results, detects anomalies, selects best nodes in tree search | sonnet |
| **paper-writer** | Generates LaTeX manuscripts with figures and citations | opus |

## Commands

| Command | Description |
| --- | --- |
| **/experiment** | Run a single training experiment and compare to best |
| **/sweep** | Hyperparameter sweep across N configs (parallel optional) |
| **/research-report** | Generate summary of all experiments and findings |
| **/research-pipeline** | Full 4-phase AI Scientist pipeline |
| **/tree-search** | Parallelized experiment tree search with 4 stages |
| **/review-paper** | Ensemble peer review (5 reviews + meta-review) |
| **/orchestrate** | Queue-based orchestrator with fresh context per phase |

## Hooks

| Hook | Type | Purpose |
| --- | --- | --- |
| **experiment-budget-guard** | PreToolUse (Bash) | Blocks training commands exceeding the configured time budget |
| **result-regression-check** | PostToolUse (Edit) | Reminds to run an experiment after editing training scripts |
| **sky-auto-auth** | PreToolUse (Bash) | Auto-authorizes SkyPilot commands without manual prompts |

Disable hooks via: `export DISABLED_HOOKS="experiment-budget-guard,result-regression-check,sky-auto-auth"`

## State Directory

All pipeline state lives in `.autoresearch/` at the project root (created at runtime):

```
.autoresearch/
  config.yaml              # Research scope, time budget, GPU config
  ideas/                   # Phase 1: ranked research ideas
  experiments/             # Phase 2: experiment results
    experiment-log.jsonl   # Append-only log of all runs
    best-config.json       # Current best configuration
  tree/                    # Tree search state (stages 1-4)
    tree-state.json
    stage-1/ ... stage-4/
  manuscripts/             # Phase 3: generated papers
    draft-v1.tex
    figures/
    references.bib
  reviews/                 # Phase 4: review results
    individual/
    meta-review.json
  queue/                   # Orchestration state (fresh-context per phase)
    queue.json             # Task list with phase tracking
    tasks/                 # Per-task handoff files
```

Copy `config-template.yaml` to `.autoresearch/config.yaml` to customize, or let the commands create defaults.

## Recommended MCP Servers

Configure these in Claude Code settings for full pipeline functionality:

| MCP Server | Used By | Purpose |
| --- | --- | --- |
| **Semantic Scholar** | /research-pipeline (Phase 1 & 3) | Literature search, novelty checking, citations |
| **HuggingFace Hub** | /experiment, ml-researcher | Dataset discovery and loading |
| **Exa** (optional) | /research-pipeline (Phase 1) | Broader web research during ideation |
| **Context7** (optional) | ml-researcher | Library documentation lookup |

## Parallel Execution

### Agent Teams

Enable in Claude Code settings:

```
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

Used by `/tree-search` and `/sweep --parallel` to spawn Builder teammates for parallel experiments.

### SkyPilot

For GPU cluster management, install SkyPilot and configure:

```yaml
# experiment.yaml (copy from SkyPilot examples/autoresearch)
resources:
  accelerators: {H100:1, H200:1}
  infra: k8s
```

The `sky-auto-auth` hook auto-approves SkyPilot commands. See `resources/parallel-experiments.md` for full SkyPilot integration.

### Sequential Fallback

When neither Agent Teams nor SkyPilot is available, all commands fall back to sequential execution.

## Example Workflow

```bash
# 1. Install the plugin
/plugin install autoresearch@ai-workx

# 2. Set up in a project with train.py
/experiment baseline

# 3. Let the agent run autonomous experiments
"Run 20 experiments to optimize val_bpb, starting with batch size and weight decay"

# 4. Check progress
/research-report summary

# 5. Or run the full pipeline
/research-pipeline improving transformer attention patterns

# 6. Review the generated paper
/review-paper --format workshop
```

## Requirements

- Python 3.10+ with `uv` package manager
- NVIDIA GPU (for training experiments)
- SkyPilot (optional, for parallel GPU execution)
- Claude Code with Agent Teams (optional, for parallel execution)

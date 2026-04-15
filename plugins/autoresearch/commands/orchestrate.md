---
description: Queue-based orchestrator with fresh context per phase for multi-step research workflows
argument-hint: <N> | --phase <name> | status | resume
---

Queue-based orchestrator that processes research tasks with fresh context per phase. Each phase runs in an isolated context window, receiving only a compact handoff file from the previous phase. This prevents LLM attention degradation across long-running pipelines.

## Why Fresh Context Per Phase

A full research pipeline accumulates massive context:

```
Phase 1 (Ideation)       ~20K tokens — idea evaluations, novelty checks
Phase 2 (Experimentation) ~50K tokens — experiment logs, hyperparameter tables
Phase 3 (Manuscript)      ~40K tokens — LaTeX sections, figure descriptions
Phase 4 (Review)          ~30K tokens — review criteria, scoring rubrics
```

By Phase 3, the paper-writer competes with 70K tokens of irrelevant experiment data for attention. Fresh context per phase means each phase operates in the "smart zone" — only the compact handoff file (~500 tokens) carries forward.

## Arguments

- `<N>` — Process N tasks/phases from the queue
- `--phase <name>` — Run a specific phase in isolation with fresh context (ideation, experimentation, manuscript, review)
- `status` — Show current queue state without running anything
- `resume` — Resume from the last incomplete task/phase

## Queue Protocol

All orchestration state lives in `.autoresearch/queue/`:

```
.autoresearch/queue/
  queue.json              # Task list with phase tracking
  tasks/
    task-001.md           # Per-task accumulation file (handoff notes)
    task-002.md
```

### queue.json Format

```json
{
  "tasks": [
    {
      "id": "001",
      "topic": "improving transformer attention patterns",
      "current_phase": "experimentation",
      "phases": {
        "ideation": "complete",
        "experimentation": "in-progress",
        "manuscript": "pending",
        "review": "pending"
      },
      "created": "2026-04-14",
      "last_updated": "2026-04-14"
    }
  ]
}
```

Phase states: `pending | in-progress | complete | blocked | failed`

### Task Accumulation File Format

Each `tasks/task-{id}.md` is the handoff between phases:

```markdown
# Task 001: improving transformer attention patterns

## Phase: Ideation (complete)
**Selected idea:** Sparse attention with learned routing
**Hypothesis:** Dynamic sparsity patterns can match dense attention at 40% compute
**Experiment plan:** Compare dense vs top-k vs learned-routing attention on val_bpb
**Files:** .autoresearch/ideas/idea-001.md

## Phase: Experimentation (in-progress)
**Baseline val_bpb:** 1.234
**Best val_bpb:** 1.198 (learned-routing, top-k=64, 3 heads)
**Experiments run:** 12
**Key finding:** Routing overhead negates savings below top-k=32
**Files:** .autoresearch/experiments/experiment-log.jsonl, best-config.json

## Phase: Manuscript (pending)
<!-- Populated after experimentation completes -->

## Phase: Review (pending)
<!-- Populated after manuscript completes -->
```

The accumulation file is compact by design. It summarizes each phase in 3-5 bullet points — enough for the next phase to pick up, small enough to not pollute the fresh context.

## The Orchestration Loop

When `$ARGUMENTS` is a number N:

```
for each of N iterations:
  1. Read queue.json, find next task where current_phase != complete and status != blocked
  2. Read the task's accumulation file (tasks/task-{id}.md)
  3. Determine current phase from task state
  4. Report: "Starting phase [X] for task [id]: [topic]"
  5. Suggest: "Run /clear to free context before this phase" (or use context: fork)
  6. Dispatch to the appropriate command/agent:
     - ideation    → Run Phase 1 of /research-pipeline, write ideas
     - experimentation → Dispatch to /experiment or /sweep
     - manuscript  → Dispatch to paper-writer agent
     - review      → Dispatch to /review-paper
  7. After phase completes, write a compact handoff to the accumulation file
  8. Advance phase in queue.json (current_phase = next, completed phase = "complete")
  9. Report progress and continue to next iteration
```

### Phase Dispatch Table

| Phase | Dispatches to | Input from accumulation file | Output to accumulation file |
|---|---|---|---|
| **ideation** | Inline (or /research-pipeline Phase 1) | Topic only | Selected idea, hypothesis, experiment plan |
| **experimentation** | `/experiment` or `/sweep` | Idea, hypothesis, experiment plan | Baseline, best result, experiments run, key finding |
| **manuscript** | paper-writer agent | Best result, key finding, experiment log path | Manuscript path, compilation status |
| **review** | `/review-paper` | Manuscript path | Review decision, overall score, key strengths/weaknesses |

## Running a Single Phase

When `$ARGUMENTS` is `--phase <name>`:

1. Read queue.json, find the task whose `current_phase` matches `<name>`
2. If no match, report which tasks exist and their current phases
3. Read the task's accumulation file
4. Run only the specified phase (same dispatch logic as the loop)
5. Update the accumulation file and queue.json
6. Do NOT advance to the next phase — the user controls when to proceed

This mode is for manual control: "I want to run experimentation with a fresh context, then review results before moving to manuscript."

## Status Check

When `$ARGUMENTS` is "status":

```
ORCHESTRATION STATUS
════════════════════
Queue: .autoresearch/queue/queue.json

Task 001: improving transformer attention patterns
  Ideation:        ✓ complete
  Experimentation: → in-progress (12 experiments, best val_bpb: 1.198)
  Manuscript:      · pending
  Review:          · pending

Task 002: sparse mixture-of-experts scaling
  Ideation:        → in-progress
  Experimentation: · pending
  Manuscript:      · pending
  Review:          · pending

Next action: /orchestrate 1 (runs experimentation for task 001)
```

## Resume

When `$ARGUMENTS` is "resume":

1. Read queue.json
2. Find the task with an `in-progress` phase
3. Read its accumulation file to understand where it left off
4. Re-dispatch the in-progress phase
5. If the phase had partial results (e.g., experiments ran but weren't logged), pick up from there

## Initialization

If `.autoresearch/queue/` doesn't exist:

1. Create the directory structure: `queue/queue.json`, `queue/tasks/`
2. If `.autoresearch/config.yaml` exists with a topic, create the first task entry
3. If no config exists, ask the user for a research topic

## Integration with /research-pipeline

`/orchestrate` does not replace `/research-pipeline`. They complement each other:

- `/research-pipeline <topic>` — runs all 4 phases in sequence (existing behavior, single context)
- `/orchestrate <N>` — runs N phases with fresh context per phase (new behavior, isolated contexts)
- `/research-pipeline` can internally delegate to `/orchestrate` for phase management when the user prefers context isolation

The user chooses based on context window pressure: short pipelines with small experiments can run in a single context via `/research-pipeline`; long pipelines with many experiments benefit from `/orchestrate`.

## Error Handling

If a phase fails:

1. Set the phase status to `failed` in queue.json
2. Write the error details to the accumulation file under the failed phase
3. Do NOT advance to the next phase
4. Report the failure and suggest: "Fix the issue, then run `/orchestrate resume` to retry"

If the user wants to skip a failed phase:

```
/orchestrate --phase manuscript   # Skip ahead to manuscript despite experimentation failure
```

The accumulation file will note the skip, and the manuscript phase will work with whatever data is available.

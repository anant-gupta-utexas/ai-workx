# Orchestration Protocol

Reference guide for queue-based orchestration with fresh context per phase.

## Core Principle

LLM attention degrades as context fills. A 4-phase research pipeline accumulates 100K+ tokens by its final phase, forcing the model to compete for attention across irrelevant prior-phase data. The orchestration protocol solves this by running each phase in an isolated context window, passing only a compact handoff file (~500 tokens) between phases.

## When to Use Orchestration

| Scenario | Use `/research-pipeline` | Use `/orchestrate` |
|---|---|---|
| Quick experiment (< 10 runs) | Yes — single context is fine | Overkill |
| Long pipeline (20+ experiments) | Context degrades by Phase 3 | Yes — fresh context per phase |
| Multi-topic research | Hard to manage in one context | Yes — queue tracks multiple tasks |
| Resuming after interruption | Manual state reconstruction | Yes — queue persists state to disk |
| Debugging a single phase | Run full pipeline again | Yes — `--phase` runs one phase in isolation |

## Queue File Format

### queue.json

```json
{
  "version": 1,
  "created": "YYYY-MM-DD",
  "tasks": [
    {
      "id": "001",
      "topic": "research topic description",
      "current_phase": "ideation|experimentation|manuscript|review|complete",
      "phases": {
        "ideation": "pending|in-progress|complete|blocked|failed",
        "experimentation": "pending|in-progress|complete|blocked|failed",
        "manuscript": "pending|in-progress|complete|blocked|failed",
        "review": "pending|in-progress|complete|blocked|failed"
      },
      "created": "YYYY-MM-DD",
      "last_updated": "YYYY-MM-DD",
      "config_override": {}
    }
  ]
}
```

### State Transitions

```
pending → in-progress → complete
                      → failed → in-progress (retry)
                      → blocked (manual intervention needed)
```

A task advances to the next phase only when the current phase is `complete`. The `current_phase` field always reflects the earliest non-complete phase.

## Handoff File Format

Each `tasks/task-{id}.md` follows this template:

```markdown
# Task {id}: {topic}

## Phase: Ideation ({status})
**Selected idea:** one-line summary
**Hypothesis:** what we expect to find
**Experiment plan:** what experiments to run
**Files:** paths to generated artifacts

## Phase: Experimentation ({status})
**Baseline:** metric and value
**Best result:** metric, value, and configuration
**Experiments run:** count
**Key finding:** one-sentence takeaway
**Files:** paths to experiment log, best config

## Phase: Manuscript ({status})
**Title:** paper title
**Key contribution:** one-sentence summary
**Manuscript path:** path to .tex file
**Compilation:** success/failure
**Files:** paths to manuscript, figures, references

## Phase: Review ({status})
**Decision:** ACCEPT / BORDERLINE / REJECT
**Overall score:** X.X / 10
**Key strengths:** bullet list
**Key weaknesses:** bullet list
**Files:** paths to reviews, meta-review
```

### Handoff Rules

1. **Compact:** Each phase section is 3-5 bullet points max. The handoff file should never exceed ~500 tokens.
2. **Self-contained:** The next phase can start from the handoff alone — no need to read prior phase artifacts unless specifically needed.
3. **File paths:** Always include paths to generated artifacts so the next phase can read them directly rather than reconstructing from the handoff summary.
4. **Status tracking:** Update the phase status in the handoff file AND in queue.json simultaneously.

## Phase Dispatch Table

| Phase | Command/Agent | Reads from handoff | Writes to handoff |
|---|---|---|---|
| ideation | Inline or /research-pipeline Phase 1 | Topic | Selected idea, hypothesis, plan, file paths |
| experimentation | /experiment, /sweep, or /tree-search | Idea, hypothesis, plan | Baseline, best result, count, key finding, file paths |
| manuscript | paper-writer agent | Best result, key finding, experiment file paths | Title, contribution, manuscript path, compilation status |
| review | /review-paper | Manuscript path | Decision, score, strengths, weaknesses, review file paths |

## Context Isolation Strategies

### Strategy 1: Manual /clear (recommended)

Between phases, the orchestrator suggests: "Phase X complete. Run `/clear` to free context before Phase Y."

The user runs `/clear`, then `/orchestrate resume` to pick up the next phase with a fresh context window. The orchestrator reads the handoff file to reconstruct minimal state.

### Strategy 2: context: fork (if available)

If the skill supports `context: fork` in frontmatter, each phase dispatch spawns a forked sub-agent automatically. The sub-agent receives only the handoff file content as its initial context.

### Strategy 3: Agent Teams (parallel phases)

When independent phases exist (e.g., multiple review instances), dispatch to parallel agents via Agent Teams. Each agent gets its own fresh context.

## Error Handling

### Phase Failure

1. Set phase status to `failed` in both queue.json and the handoff file
2. Write error details under the failed phase in the handoff file:
   ```markdown
   ## Phase: Experimentation (failed)
   **Error:** training script crashed with OOM at batch_size=64
   **Last successful state:** 8 experiments complete, best val_bpb 1.198
   **Suggested fix:** reduce batch_size or enable gradient checkpointing
   ```
3. Do NOT advance to next phase
4. Report failure and suggest remediation

### Retry After Fix

After the user fixes the issue:
```
/orchestrate resume    # Re-reads handoff, retries the failed phase
```

The orchestrator checks if partial results exist from the failed run and picks up from there.

### Skip Phase

If a phase is unrecoverable or unnecessary:
```
/orchestrate --phase manuscript    # Jump directly to manuscript
```

The handoff file notes the skip:
```markdown
## Phase: Experimentation (skipped)
**Reason:** User chose to skip — using external experiment results
**External data:** .autoresearch/external/results.json
```

## Multi-Task Orchestration

The queue supports multiple concurrent tasks at different phases:

```
/orchestrate 3    # Processes 3 phase-advances across any tasks
```

The orchestrator picks tasks in FIFO order, advancing each by one phase per iteration. This enables interleaving: while Task 1 waits for review, Task 2 can start experimentation.

## Integration Points

| Existing command | How orchestrate interacts |
|---|---|
| /research-pipeline | Can delegate phase management to /orchestrate internally |
| /experiment | Called by orchestrate during experimentation phase |
| /sweep | Called by orchestrate for grid searches during experimentation |
| /tree-search | Called by orchestrate for tree-based exploration |
| /review-paper | Called by orchestrate during review phase |
| /research-report | Can read queue state to include orchestration metadata |
| paper-writer agent | Dispatched by orchestrate during manuscript phase |
| experiment-reviewer agent | Dispatched by orchestrate for result validation between phases |

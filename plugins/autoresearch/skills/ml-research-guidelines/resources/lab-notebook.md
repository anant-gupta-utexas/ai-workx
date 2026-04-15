# Lab Notebook

A human-readable research log that serves as externalized working memory across sessions and context compactions.

## Overview

The lab notebook (``.autoresearch/lab-notebook.md``) is a narrative companion to the structured ``experiment-log.jsonl``. While the JSONL stores machine-readable metrics and configurations, the notebook stores reasoning, decisions, dead ends, and next steps in prose. It survives context windows, session boundaries, and compactions — making it the single most important file for resuming research.

## File Location

```
.autoresearch/lab-notebook.md
```

Created automatically on the first experiment run if it doesn't exist. Lives alongside the rest of the pipeline state.

## When to Write

| Trigger | What to append |
| --- | --- |
| **After a meaningful experiment result** | Outcome, whether it beat the best, why you think it did/didn't |
| **After a failed or crashed run** | Error summary, suspected cause, what to try differently |
| **Before stopping work** (compaction, end of session, switching tasks) | Current state summary, incomplete threads, explicit next steps |
| **When resuming work** | What the last entries say, which thread to pick up, any new hypotheses |
| **After a sweep completes** | Winner, surprise results, interaction effects noticed |
| **At stage transitions** (preliminary -> hyperparameter -> research agenda -> ablation) | Stage summary, what was learned, what carries forward |

## Entry Format

Each entry is a Markdown section under a date+time heading. Keep entries concise — 5-15 lines is the sweet spot.

```markdown
## YYYY-MM-DD HH:MM — <short title>

**Objective:** What you set out to do this session/batch.

**Hypothesis:** The specific testable claim (copy from experiment-log if applicable).

**What happened:**
- Ran experiments #N through #M
- Best result: val_bpb X.XXX (experiment #K)
- Key observation: <insight>

**What failed:**
- <approach> didn't work because <reason>

**Metrics snapshot:**
| Experiment | Config change | val_bpb | peak_vram_mb | Verdict |
| --- | --- | --- | --- | --- |
| #42 | width 768 -> 1024 | 1.087 | 6200 | IMPROVED |
| #43 | depth 6 -> 8 | 1.095 | 7800 | REGRESSED |

**Next steps:**
1. <most promising direction>
2. <fallback if #1 doesn't pan out>
3. <open question to investigate>
```

Fields are guidelines, not rigid requirements. Skip sections that don't apply (e.g., no "What failed" if everything worked). The point is narrative continuity, not form-filling.

## Resume Protocol

When starting or resuming a research session:

1. **Read the last 3 notebook entries** to rebuild context on where things stand
2. **Check for incomplete threads** — look for "Next steps" that were never followed up
3. **Cross-reference with experiment-log.jsonl** — confirm the notebook's narrative matches the structured data
4. **Write a brief "Resuming" entry** stating which thread you're picking up and why

```markdown
## YYYY-MM-DD HH:MM — Resuming: width scaling

**Context:** Last session explored width 768-1024 (entries from MM-DD). Best was #42 at val_bpb 1.087 with width 1024. Next steps said to try 1280 and check VRAM.

**Plan:** Run width 1280 and 1536, check VRAM stays under budget.
```

## Relationship to Other State Files

| File | What it stores | Format | Audience |
| --- | --- | --- | --- |
| `experiment-log.jsonl` | Every experiment with full config and metrics | Machine-readable JSON lines | Scripts, analysis tools, the agent's structured decisions |
| `lab-notebook.md` | Reasoning, decisions, dead ends, narrative | Human-readable Markdown | The agent on resume, human researchers reviewing progress |
| `best-config.json` | Current best configuration snapshot | JSON | The experiment loop (comparison target) |
| `tree/tree-state.json` | Tree search node graph and scores | JSON | Tree search commands |
| `queue/queue.json` | Orchestration phase tracking | JSON | The orchestrator |

The notebook is the only file designed for narrative comprehension. Everything else is structured data. When the two disagree, investigate — it usually means an entry was skipped or a revert wasn't logged.

## Anti-Patterns

- **Skipping entries after failed experiments** — failures are the most valuable entries; they prevent repeating dead ends
- **Writing entries that are just metric dumps** — that's what JSONL is for; the notebook should capture *why* and *what next*
- **Entries longer than 20 lines** — keep it scannable; detail belongs in the JSONL or separate analysis notes
- **Not reading the notebook on resume** — the whole point is session continuity; skipping it defeats the purpose
- **Editing old entries** — the notebook is append-only; if a previous entry was wrong, add a correction entry instead

## Bootstrap

If `.autoresearch/lab-notebook.md` doesn't exist, create it with this header:

```markdown
# Lab Notebook

Research log for [project/topic]. Append-only — newest entries at the bottom.

---

## YYYY-MM-DD HH:MM — Project initialized

**Objective:** <initial research goal>

**Baseline:** val_bpb X.XXX (experiment #1)

**Initial search strategy:** <first phase plan>

**Next steps:**
1. <first hypothesis to test>
```

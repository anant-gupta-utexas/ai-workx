# Artifact Conventions

Standardized naming, directory structure, and output formats for deep research investigations. Ensures artifacts from different investigations don't collide and can be found by slug.

## Directory Structure

All deep-research artifacts live under `outputs/research/` at the project root:

```
outputs/research/
  .plans/                           # Investigation plans (hidden dir)
    <slug>-plan.md
  .drafts/                          # Working drafts (hidden dir)
    <slug>-draft.md
    <slug>-thread-1.md              # Per-thread working files (parallel execution)
    <slug>-thread-2.md
  <slug>-verification.md            # Verification log
  <slug>-brief.md                   # Final deliverable
  <slug>.provenance.md              # Source accounting (optional)
  CHANGELOG.md                      # Lab notebook for multi-session investigations
```

Plans and drafts are in hidden directories (`.plans/`, `.drafts/`) because they are working artifacts, not final deliverables. The user primarily interacts with the `<slug>-brief.md` files.

## File Naming

All files use the slug derived during the planning phase (see `planning.md`):

| Artifact | Pattern | When created |
| --- | --- | --- |
| Plan | `<slug>-plan.md` | Planning phase |
| Thread working file | `<slug>-thread-N.md` | Execute phase (parallel only) |
| Draft | `<slug>-draft.md` | Synthesis phase |
| Verification log | `<slug>-verification.md` | Verification phase |
| Final brief | `<slug>-brief.md` | Delivery phase |
| Provenance record | `<slug>.provenance.md` | Delivery phase (optional) |

## CHANGELOG (Lab Notebook)

For investigations that span multiple sessions, maintain `outputs/research/CHANGELOG.md` as a lightweight lab notebook. Append an entry after each meaningful milestone:

```markdown
## YYYY-MM-DD — <slug>: <phase completed>

- Completed: <what was done>
- Findings so far: <brief summary>
- Next: <what remains>
- Status: <planning / executing / synthesizing / verifying / complete>
```

Read the last 3 entries when resuming a multi-session investigation.

## Final Brief Structure

The `<slug>-brief.md` deliverable follows this structure:

```markdown
# <Topic Title>

**Date:** YYYY-MM-DD
**Slug:** <slug>
**Sources consulted:** N
**Sources cited:** M

## Executive Summary

<2-4 sentence overview of key findings. Self-contained — a reader should
understand the core answer from this section alone.>

## Key Findings

### <Finding 1 heading>

<Narrative with inline citations [1][2]. Each finding is a coherent section
covering one aspect of the research question.>

### <Finding 2 heading>

<...>

## Methodology

- **Scope:** <what was investigated and what was excluded>
- **Sources:** <types of sources consulted — papers, docs, repos, forums>
- **Search strategy:** <query variations used, domains prioritized>

## Limitations

- <what couldn't be verified>
- <areas where evidence was thin>
- <potential biases in source selection>

## Open Questions

- <questions that emerged but weren't answered>
- <areas worth investigating further>

## Sources

[1] Author. "Title." Source. URL
[2] ...
```

## Provenance Record (Optional)

For investigations where audit trail matters, generate `<slug>.provenance.md`:

```markdown
# Provenance: <topic>

**Investigation date:** YYYY-MM-DD
**Slug:** <slug>
**Plan:** .plans/<slug>-plan.md

## Sources Consulted
| # | Source | URL | Consulted | Cited | Reason if not cited |
| --- | --- | --- | --- | --- | --- |
| 1 | ... | ... | Yes | Yes | — |
| 2 | ... | ... | Yes | No | Irrelevant to research questions |

## Verification Status
| Claim | Source(s) | Status |
| --- | --- | --- |
| ... | [1][3] | Verified |
| ... | [2] | Weakened |

## Artifact Chain
1. Plan: `.plans/<slug>-plan.md` (YYYY-MM-DD)
2. Draft: `.drafts/<slug>-draft.md` (YYYY-MM-DD)
3. Verification: `<slug>-verification.md` (YYYY-MM-DD)
4. Brief: `<slug>-brief.md` (YYYY-MM-DD)
```

## Cleanup

Working artifacts (`.plans/`, `.drafts/`, thread files) can be deleted after the final brief is delivered and verified. The brief, verification log, and optional provenance record are the permanent artifacts.

Do not delete working artifacts during an active investigation — they may be needed if the user requests revisions or deeper investigation into a subtopic.

# Planning Phase

The planning phase transforms a user's research request into a structured investigation plan. No searches or tool calls happen until the plan is confirmed.

## Slug Derivation

Every investigation gets a short, URL-friendly slug used to name all related artifacts:

1. Take the core topic from the user's request
2. Convert to lowercase hyphenated form
3. Limit to 5 words maximum
4. Remove articles, prepositions, and filler words

Examples:
- "What are the latest advances in mechanistic interpretability?" -> `mechanistic-interpretability`
- "Compare Redis vs Memcached for session caching at scale" -> `redis-vs-memcached-caching`
- "Investigate the impact of learning rate warmup schedules on transformer convergence" -> `lr-warmup-transformer-convergence`

## Task Ledger

Before searching, build a Task Ledger that captures the investigation scope. Write this to the plan file.

### Template

```markdown
# Research Plan: <topic>

**Slug:** <slug>
**Date:** YYYY-MM-DD
**Requested by:** User

## What We Know
- <existing knowledge, context the user provided, constraints mentioned>

## What We Need to Find
1. <specific question or gap>
2. <specific question or gap>
3. ...

## Source Strategy
- **Primary sources:** <where to look first — papers, official docs, repos>
- **Secondary sources:** <where to look next — blogs, forums, comparisons>
- **Domains to prioritize:** <arxiv.org, github.com, specific docs sites>

## Constraints
- <time-sensitivity: is recency important?>
- <scope boundaries: what's explicitly out of scope?>
- <depth: how deep should each subtopic go?>

## Acceptance Criteria
- [ ] All key questions answered with cited sources
- [ ] Contradictions between sources identified and flagged
- [ ] Minimum N primary sources consulted
- [ ] Executive summary is self-contained and actionable

## Estimated Scale
- **Complexity:** <narrow / comparative / broad survey / multi-domain>
- **Research threads:** <1 / 2-3 / 4-6>
- **Expected source count:** <N>
```

## Plan Artifact

Write the completed plan to:

```
outputs/research/.plans/<slug>-plan.md
```

Create the directory if it doesn't exist.

## Confirmation Gate

**Present the plan to the user and wait for explicit confirmation before proceeding.** This is not optional. The user may want to:

- Narrow or broaden the scope
- Add constraints or out-of-scope markers
- Prioritize certain questions over others
- Adjust the expected depth or source count

If the user modifies the plan, update the artifact before continuing.

## Plan Revisions

During execution, the plan may need revision if:

- A research thread uncovers an unexpected subtopic worth pursuing
- A key source is unavailable or paywalled
- The investigation is growing beyond the original scope

When this happens, **pause and present the revised scope to the user** before expanding. Do not silently grow the investigation.

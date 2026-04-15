---
name: deep-research
description: Use when the user wants a thorough, multi-source investigation that produces a formal, source-grounded research brief. Trigger on phrases like "deep research", "investigate thoroughly", "multi-source investigation", "research brief", "source-grounded research", "comprehensive research on", "I need a thorough analysis of", "research this topic in depth", "create a research report on", or when the user wants structured, cited research artifacts rather than quick web lookups. This skill covers the full plan-execute-verify-deliver pipeline adapted from Feynman's deep research workflow. Do NOT trigger for quick factual lookups, debugging searches, or library comparisons — those belong to the web-research-specialist agent.
---

# Deep Research

## Purpose

Structured multi-round investigation that produces source-grounded research briefs. Every factual claim links to a primary source URL. Outputs are formal Markdown artifacts with inline citations, verification logs, and provenance records.

This skill is the pipeline complement to the `web-research-specialist` agent. The agent handles ad-hoc lookups and debugging searches; this skill handles investigations that need planning, parallel evidence gathering, synthesis, and verification before delivery.

## When to use this vs. web-research-specialist

| Signal | Use this skill | Use web-research-specialist |
| --- | --- | --- |
| "Deep research on X" | Yes | No |
| "Research brief on X" | Yes | No |
| "Investigate X thoroughly" | Yes | No |
| "Find best practices for X" | No | Yes |
| "Debug this error" | No | Yes |
| "Compare library A vs B" | No | Yes |
| Quick factual question | No | Yes |

Rule of thumb: if the answer needs a plan, multiple sources, and a formal artifact — use deep-research. If it needs a quick search and a summary — use web-research-specialist.

## How to read this skill

Progressive disclosure: this file tells you the workflow phases and points to resource files with the detail. Load only the resource you need.

| Phase | Resource file |
| --- | --- |
| Planning and task ledger | `resources/planning.md` |
| Complexity assessment and parallelism | `resources/scale-decision.md` |
| Source verification and citation | `resources/verification.md` |
| Output naming and directory layout | `resources/artifact-conventions.md` |

## The Pipeline

```
User request
    │
    ▼
┌─────────┐
│  PLAN   │  Derive slug, build task ledger, write plan artifact
└────┬────┘  Present plan to user for confirmation
     │
     ▼
┌─────────┐
│  SCALE  │  Classify complexity, decide parallel vs sequential
└────┬────┘
     │
     ▼
┌─────────┐
│ EXECUTE │  Search web, papers, repos, docs (parallel if warranted)
└────┬────┘  Each researcher writes findings to a working file
     │
     ▼
┌─────────┐
│SYNTHESIZE│ Merge findings, resolve contradictions, structure the brief
└────┬────┘
     │
     ▼
┌─────────┐
│ VERIFY  │  Citation anchoring, URL validation, strength sweep
└────┬────┘
     │
     ▼
┌─────────┐
│ DELIVER │  Write final brief, verification log, update CHANGELOG
└─────────┘  Present to user with summary
```

## Workflow

### 1. Plan

Read `resources/planning.md`. Derive a slug from the topic, build a Task Ledger (what we know, what we need, constraints, acceptance criteria), and write the plan to `outputs/research/.plans/<slug>-plan.md`. **Present the plan to the user and wait for confirmation before proceeding.**

### 2. Scale Decision

Read `resources/scale-decision.md`. Classify query complexity (narrow, comparative, broad survey, multi-domain) and decide execution strategy. For broad or multi-domain queries, launch parallel subagent researchers using the Task tool. For narrow queries, search directly.

### 3. Execute

Run web searches, fetch pages, read papers, inspect repos. Each research thread writes intermediate findings to a working file. Use multiple search query variations per topic (5-10 queries minimum for broad investigations). Prioritize primary sources over commentary.

### 4. Synthesize

Merge findings from all research threads. Structure the content into the brief format (see `resources/artifact-conventions.md`). Identify and flag contradictions between sources rather than silently choosing one side. Write the draft to `outputs/research/.drafts/<slug>-draft.md`.

### 5. Verify

Read `resources/verification.md`. Run a full verification pass over the draft:
- Anchor every factual claim to a source with `[N]` inline citations
- Validate each URL is live and supports the claim
- Downgrade claims that are stronger than their evidence
- Remove or weaken claims with no traceable source
- Write the verification log to `outputs/research/<slug>-verification.md`

### 6. Deliver

Write the final brief to `outputs/research/<slug>-brief.md`. Append an entry to `outputs/research/CHANGELOG.md` if it exists. Present the executive summary to the user with a link to the full artifact.

## Safety Rules

1. **Plan before executing.** Never start searching without writing and confirming a plan.
2. **Source everything.** Every factual claim must link to a URL. No exceptions.
3. **State uncertainty explicitly.** If evidence is thin, say so. Never present speculation as fact.
4. **Flag contradictions.** When sources disagree, present both positions with their evidence.
5. **Verify before delivering.** The verification pass is not optional.
6. **Don't fabricate sources.** If a URL can't be verified, drop the claim or mark it as unverified.
7. **User controls scope.** If the investigation is growing beyond what was planned, pause and re-confirm with the user.

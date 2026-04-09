---
name: maintaining-wiki
description: Use when the user wants to ingest, query, lint, or check status of their personal knowledge base / second-brain wiki under docs/02_learning/. Trigger on phrases like "ingest into my wiki", "add this to my knowledge base", "absorb this paper", "update my wiki", "what does my wiki say about", "query my notes", "search my knowledge base", "wiki lint", "lint my wiki", "check my wiki for contradictions", "knowledge base status", "wiki status report", "file this into docs/02_learning", "add to second brain", or any mention of raw/, wiki/, processed/, outputs/ inside docs/02_learning/. Also trigger when the user pastes an article, paper, or link and asks to "save", "absorb", "remember", or "keep" it alongside existing notes. The skill owns the three-layer raw/wiki/outputs architecture defined in docs/02_learning/README.md and performs ingest, query, lint, and status operations. Do NOT trigger for generic note-taking outside docs/02_learning/ or for the src/ productivity app.
---

# maintaining-wiki

## Purpose

This skill is the operating manual for a personal, LLM-maintained knowledge base living under `docs/02_learning/` in the `second-brain` repo. The user curates sources (drops articles and papers into `raw/`) and asks questions. The skill does everything else: reads sources, writes wiki pages, maintains cross-references, flags contradictions, and answers queries with citations.

The schema — frontmatter fields, `[[wiki-links]]`, `[Source:]` citations, contradiction markers, `index.md`, `log.md`, and the ingest/query/lint workflows — is defined in `docs/02_learning/README.md`. That file is the source of truth. **Read it on every invocation.** Do not restate its contents inside this skill.

Obsidian-compatible extensions (tags, aliases, callouts) are documented in `references/obsidian.md`. They are additive to the README schema; on first ingest after skill install, propose a README patch rather than silently diverging.

## How to read this skill

Progressive disclosure: this file tells you which operation to run and points to a reference file with the detail. Load only the reference you need.

| Operation | Reference file |
|---|---|
| ingest | `references/ingest.md` |
| query | `references/query.md` |
| lint | `references/lint.md` |
| status | `references/lint.md` (shares walk logic) + `references/templates.md` |
| Obsidian compat | `references/obsidian.md` |
| Prompt templates | `references/prompts.md` |
| File skeletons | `references/templates.md` |

Authoritative sources for rules:
- **Schema**: `docs/02_learning/README.md`
- **Obsidian extensions**: `references/obsidian.md`

If the README and a reference file disagree, the README wins, and you should propose a patch to bring them back into alignment.

## Operation selection

Pick the operation from user intent signals. If ambiguous, ask one clarifying question before proceeding.

| Signal from user | Operation |
|---|---|
| "ingest", "absorb", "file", "save", "remember", "add to wiki", pastes a link/path/content | **ingest** |
| "what does my wiki say", "according to my notes", "find in my notes", factual question in repo context | **query** |
| "lint", "audit", "check contradictions", "find orphans", "verify citations" | **lint** |
| "status", "what's in my wiki", "how many pages", "summarize my notes" | **status** |

Rules:

1. **Multi-op requests** — if the user wants several operations in one turn (e.g. ingest then lint), run them sequentially and propose a single commit at the end.
2. **Fast exit** — if `docs/02_learning/` or `docs/02_learning/README.md` is missing, stop and surface the problem instead of improvising.
3. **Bootstrapping** — if `wiki/index.md` or `wiki/log.md` doesn't exist yet and the user asks for query/lint/status, create empty-but-valid versions from `references/templates.md` first and note that in the response.
4. **Ambiguity** — if intent is unclear, ask exactly one question and then proceed.

## Workflows (high-level)

Detail lives in the reference files. These summaries exist so you can route without loading the detail.

### ingest

**Precondition**: a file in `docs/02_learning/raw/` or user-pasted content that needs to be saved to `raw/` first (with `title`, `url`, `date`, `ingested_via: paste` in YAML).

Steps:
1. Read the source and `docs/02_learning/README.md`.
2. Summarize: produce a structured, high-fidelity digest of the raw source (see `references/prompts.md`).
3. Extract entities, concepts, metrics, systems from the summary.
4. Propose a 10–15 page touch plan as a table (path, new/update, rationale). Wait for user confirmation.
5. Apply: create/update pages using `references/templates.md`, every claim cited `[Source: filename.md]`.
6. Add backlinks from existing pages to new ones.
7. Update `wiki/index.md` (categorized) and append `wiki/log.md`.
8. Contradiction sweep; flag with `> [!warning] CONTRADICTION` callouts.
9. Surface `git status --short docs/02_learning/` and a proposed commit message. Do NOT commit.

Full walkthrough with worked example: `references/ingest.md`.

### query

**Precondition**: `wiki/index.md` exists. If missing, run status first.

Steps:
1. Read `wiki/index.md`.
2. Pick candidate pages (title > tag > alias > slug > fulltext, ≤8 pages).
3. Read candidates.
4. Synthesize the answer; every factual sentence carries `[Source: page-name.md]`.
5. Offer to save to `outputs/YYYY-MM-DD_<slug>.md` using the output template.
6. Append `wiki/log.md` with the query.
7. If gaps surfaced, offer to file an ingest task.

Full detail: `references/query.md`.

### lint

Steps:
1. Walk `wiki/` via Glob/Read/Grep.
2. Run every check in `references/lint.md`.
3. Write `wiki/lint-report-YYYY-MM-DD.md` from the lint report template.
4. Append `wiki/log.md`.
5. Propose fixes as a plan. Do not auto-apply.

Full checklist: `references/lint.md`.

### status

Read-only. No mutations, no log entry.

Steps:
1. Walk `raw/` and `wiki/`.
2. Count: raw files, wiki pages by status, orphan pages, last ingest date, days since last lint, pending `CONTRADICTION` callouts.
3. Read the last 10 entries of `wiki/log.md`.
4. Output the status report skeleton from `references/templates.md` — 5-bullet summary + counts.

Shares the walk logic with `lint`. Full checklist: `references/lint.md`.

## Obsidian compatibility

Adopt these on every new wiki page so the directory can be dropped into an Obsidian vault later with zero rework:

1. `tags: []` in frontmatter (seed organically, no predefined taxonomy).
2. `aliases: []` for acronyms and synonyms.
3. Callouts: `> [!warning] CONTRADICTION`, `> [!note] Definition`, `> [!question] Open question`, `> [!info]` for source context. These render as plain blockquotes in non-Obsidian viewers — strictly additive.
4. Keep `[[wiki-links]]` and `[Source: file.md]` exactly as the README specifies.

Avoid: ` ```dataview ` blocks, `%% obsidian comments %%` (use HTML comments), Templater `<%` syntax, plugin-specific frontmatter keys.

These fields are not in `docs/02_learning/README.md` yet. On first ingest after skill install, propose a README patch adding an "Optional fields (Obsidian-compatible)" subsection and wait for user approval. Never mutate the README silently.

Full rationale: `references/obsidian.md`.

## Git integration

The skill never runs `git add`, `git commit`, or `git push` without explicit user confirmation.

After every mutating operation (ingest, lint with applied fixes, query that saves an output):

1. Run `git status --short docs/02_learning/` and show the diff summary.
2. Show a proposed commit message.
3. Show a staging command list the user can copy-paste.

Scope: only stage files under `docs/02_learning/`. Never stage changes elsewhere during a wiki operation.

Cadence: one commit per operation. Ingesting three sources = three commits.

Suggested commit message formats:

- `wiki(ingest): add <topic-slug> from <source-slug> [N pages touched]`
- `wiki(lint): apply lint fixes YYYY-MM-DD [severity]`
- `wiki(query): save answer on <topic> to outputs/`

## Safety rules

The reasoning behind these rules: the wiki is a compounding artifact. A single silent overwrite or untracked deletion can erase context that took many sessions to build.

1. **Never modify files in `raw/`.** Sources are immutable. If a source is wrong, add a correction page in `wiki/` citing the discrepancy.
2. **Never delete wiki pages without explicit user confirmation.** Propose the deletion, show what links break, wait.
3. **Every mutation must be reflected in `wiki/log.md`.** No silent edits.
4. **Contradictions are flagged, never resolved silently.** Use the callout. Let the user decide which side wins.
5. **If a page's `source_count` would drop**, stop and ask. That usually means a citation was lost.
6. **Never promote query answers into wiki pages without user confirmation.** Queries can surface gaps, but filling them is an ingest operation.

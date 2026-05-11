# Lint

Health checks for the wiki. Also hosts the shared walk logic that `status` reuses.

## When this runs

**Lint** runs when the user explicitly asks (`"lint my wiki"`, `"audit the knowledge base"`, `"check for contradictions"`) or monthly as hygiene.

**Status** runs when the user asks for a snapshot (`"what's in my wiki"`, `"status"`, `"how many pages"`). It's the no-severity, read-only subset of lint — counts only.

## The walk (shared with status)

Both operations start by walking the wiki tree:

1. `Glob` for every `docs/02_learning/wiki/**/*.md` file.
2. For each file, parse the YAML frontmatter (title, created, last_updated, source_count, status, tags, aliases).
3. Build three indices in memory:
   - **slug → page** (from filename and frontmatter `title`)
   - **slug → inbound-links** (by scanning every page for `[[target]]` references)
   - **slug → outbound-links** (from each page's `[[...]]` references)
4. Parse `wiki/index.md` into a set of listed slugs.
5. Read the last N=20 entries of `wiki/log.md`.

This walk is cheap for wikis up to ~200 pages. For larger wikis, consider bundling a script; see the `scripts/` note in SKILL.md.

## Lint checks

Run every check. Group findings by severity in the report.

| # | Check | Severity | Detection |
|---|---|---|---|
| 1 | Contradictions between pages | high | Grep for `> [!warning] CONTRADICTION` and legacy `> CONTRADICTION:`. Also cross-read pages sharing a tag; flag semantic conflicts the callouts missed. |
| 2 | Claims missing `[Source:]` attribution | high | Line-by-line scan of `## Key claims` sections. Any non-empty, non-heading line without a `[Source: ...]` trailing marker or a preceding line carrying one is a finding. |
| 3 | Broken wiki-links | high | For every `[[target]]`, resolve to a file or a frontmatter `aliases:` entry. Unresolved = broken. |
| 4 | Missing frontmatter fields | high | YAML parse. Required: `title`, `created`, `last_updated`, `source_count`, `status`. Obsidian-extended (warn only if totally absent): `tags`, `aliases`. |
| 5 | Index drift | high | Set diff between (files under `wiki/`) and (slugs in `wiki/index.md`). Both directions: page-without-index-entry and index-entry-without-page. |
| 6 | Stale claims | medium | `status: draft` older than 30 days, or `status != reviewed` on a page whose most-recent source is > 18 months old. |
| 7 | Orphan pages | medium | Pages with zero inbound `[[links]]` AND not listed in `index.md` as a hub. |
| 8 | Mentioned-but-never-defined | medium | `[[links]]` whose target has no file. Overlaps with #3 but reported separately because the fix is different (create a page vs. fix a typo). |
| 9 | `last_updated` older than most recent citing source | low | Compare `last_updated` to `mtime` of every `[Source:]`-cited raw file. |
| 10 | Tag sprawl | low | Fuzzy-compare the tag universe. Near-duplicate tags (`recsys` vs `recommender-systems`) are a finding. |

Exclude `wiki/index.md`, `wiki/log.md`, and `wiki/lint-report-*.md` from the page-level checks — they have their own format.

## Severity meaning

- **high** — breaks the contract the wiki makes with its reader. Fix soon.
- **medium** — degrades trust or discoverability but isn't wrong.
- **low** — cosmetic or future-proofing.

## Report

Write the report to `docs/02_learning/wiki/lint-report-YYYY-MM-DD.md` using the lint report template in `references/templates.md`.

Sections:

1. **Summary counts** — total findings by severity, total pages scanned.
2. **High severity** — one subsection per finding with file:line references.
3. **Medium severity** — same.
4. **Low severity** — same.
5. **Proposed fix plan** — grouped by fix cost (cheap / medium / expensive) using the "Lint triage" prompt in `references/prompts.md`.
6. **Sign-off** — empty signature line for the user.

**Never auto-apply fixes.** Lint proposes; the user decides. If the user then says "apply the cheap ones", that becomes a separate mutation turn.

## Cleanliness composite score

After running all checks, compute a single `cleanliness_score` (0–100) from the raw counts. This single number makes wiki health trendable across runs — inspired by the codebase-cleanliness-index pattern (see [[codebase-cleanliness-index]]).

### Inputs

Collect these counts from the walk and checks above:

| Symbol | What it measures |
|--------|-----------------|
| `P` | Total wiki pages scanned (exclude `index.md`, `log.md`, `lint-report-*.md`) |
| `orphans` | Pages with zero inbound links AND not listed as a hub in `index.md` (check #7) |
| `broken_links` | Unresolved `[[wiki-link]]`s (check #3) |
| `contradictions` | Pages carrying an unresolved `> [!warning] CONTRADICTION` callout (check #1) |
| `missing_citations` | Claims in `## Key claims` sections lacking a `[Source: ...]` marker (check #2) |
| `missing_frontmatter` | Pages missing ≥1 required frontmatter field (check #4) |
| `index_drift` | Count of index-vs-file mismatches in both directions (check #5) |
| `stale_pages` | Pages flagged as stale by check #6 |

### Formula

```
penalty = (
    (orphans            / max(P,1)) * 30  +   # orphan rate          (high weight)
    (broken_links       / max(P,1)) * 25  +   # broken-link rate     (high weight)
    (contradictions     / max(P,1)) * 20  +   # contradiction rate   (medium)
    (missing_citations  / max(P,1)) * 10  +   # citation completeness (medium)
    (missing_frontmatter/ max(P,1)) * 10  +   # frontmatter health   (medium)
    (index_drift        / max(P,1)) * 3   +   # index hygiene        (low)
    (stale_pages        / max(P,1)) * 2        # freshness            (low)
)
cleanliness_score = round(max(0, 100 - penalty * 100))
```

Weights sum to 100 percentage-points of penalty headroom. Each term is a rate (finding-count / page-count) so the score is comparable as the wiki grows.

### Interpretation

| Score | Health |
|-------|--------|
| 90–100 | Clean — compounding is safe |
| 75–89 | Acceptable — a few targeted fixes needed |
| 60–74 | Degraded — fix high-severity items before next ingest |
| < 60 | Critical — wiki debt is outpacing value |

### Output line

Emit as the last line of the report **Summary** section:

```
cleanliness_score: NN/100 (orphans=A, broken_links=B, contradictions=C, missing_citations=D, missing_frontmatter=E, index_drift=F, stale_pages=G)
```

### Persistence

Append one tab-separated row to `docs/02_learning/wiki/.lint-history.tsv` (create if absent):

```
YYYY-MM-DD\tNN\tA\tB\tC\tD\tE\tF\tG
```

Header row (write only if the file is new):

```
date\tcleanliness_score\torphan_pages\tbroken_links\tcontradictions\tmissing_citations\tmissing_frontmatter\tindex_drift\tstale_pages
```

This file is the trend source. It is never modified — only appended to.

## Log entry

Append after writing the report:

```
## [YYYY-MM-DD] lint | N findings (H high / M medium / L low) | score: NN/100
```

## State write

After the lint report and log entry are written, update the vault's cadence-state file if it exists at the canonical path:

- **Target**: `docs/00_ops/meta/state.md`
- **Writes**:
  - Replace `last_wiki_lint:` value with today's date (`YYYY-MM-DD`).
  - Replace `last_wiki_lint_score:` value with the computed `cleanliness_score`. Add the line if absent (place it next to `last_wiki_lint`).

This closes the loop with downstream cadence trackers (e.g. `chief-of-staff weekly`) so they don't keep flagging lint as overdue after a successful run.

**Vault-shape-aware**: skip the write silently if `docs/00_ops/meta/state.md` is not present — the skill stays portable to vaults without a chief-of-staff setup. In that case, emit a one-line reminder at the end of the lint output:

```
No state.md found at docs/00_ops/meta/ — track lint cadence yourself.
```

Surface the proposed `state.md` diff to the user as part of the lint output before writing. Never write to `state.md` without showing the diff, same contract as every other mutation in this skill.

## Status report (no-mutation variant)

Status reuses the walk. It writes nothing to disk. Output to the user:

**Counts**:
- Raw sources: X
- Wiki pages: Y (by status: A draft, B reviewed, C needs_update)
- Orphan pages: Z
- Unresolved `CONTRADICTION` callouts: C
- Pending `[!question]` open questions: Q

**Activity**:
- Last ingest: `<date>` — `<source-slug>`
- Days since last lint: D
- Recent log entries: last 5

**Summary**: 5-bullet narrative using the "Status summary" prompt in `references/prompts.md`. Emphasize what's stale and what's well-covered.

Status never writes a log entry. It's a pure read.

# Reweave

Detailed workflow for updating older wiki pages with context from recent ingests.

## When this runs

Triggered when the user wants to propagate new knowledge backward to older pages: "reweave my wiki", "update old pages with new context", "backward pass", "propagate recent ingests", "refresh stale pages".

## Purpose

Ingest adds new pages. Reflect connects them. Reweave completes the cycle by going *backward* — finding older pages that should be enriched, corrected, or nuanced by claims from recent ingests. Without reweave, old pages become fossils: accurate at creation time but increasingly incomplete as the wiki grows.

Backward maintenance is what makes a knowledge graph compound in value rather than just accumulate linearly.

## Preconditions

- `docs/02_learning/README.md` exists and has been read this turn.
- `wiki/log.md` exists with at least 2 ingest entries (reweave needs a "recent" and an "older" cohort).
- `wiki/index.md` exists.

## The loop

### 1. Identify the reweave window

Read `wiki/log.md` and determine the scope:

- **Default:** All ingests since the last `reweave` log entry. If no prior reweave exists, use the last 5 ingests.
- **User-specified:** The user can narrow scope: "reweave from the Netflix paper" targets a specific ingest.

Collect the list of pages touched by those ingests (from the ingest log entries and by reading the pages themselves for `[Source:]` citations).

### 2. Extract new claims

For each page in the reweave window, extract the key claims — the assertions that might affect older pages. Use the "Backward enrichment scan" prompt from `references/prompts.md`.

Focus on claims that are:
- **Novel** — not just restating common knowledge
- **Specific** — concrete enough to update an older page
- **Connected** — reference concepts that exist elsewhere in the wiki

### 3. Find affected older pages

For each extracted claim, search for older wiki pages that should know about it:

1. **Direct topic match** — older pages whose title or tags overlap with the claim's subject.
2. **Contradiction candidates** — older pages that assert something the new claim contradicts or nuances.
3. **Extension candidates** — older pages that cover the same concept but from an earlier, less complete perspective.
4. **Link traversal** — follow `[[wiki-links]]` from the new page outward to find neighbors that might benefit.

Budget: read at most 15 older pages total per reweave run. Prioritize by relevance, not recency.

### 4. Classify each update

For each (new claim, old page) pair, classify the relationship:

| Relationship | Meaning | Action on old page |
|---|---|---|
| **Enrichment** | New claim adds depth or a new angle | Append to `## Key claims` with `[Source:]` citation |
| **Contradiction** | New claim conflicts with an existing claim | Add `> [!warning] CONTRADICTION` callout |
| **Supersession** | New claim replaces an outdated claim | Mark old claim with strikethrough context + add new claim |
| **Extension** | New claim extends a pattern the old page describes | Add to `## Key claims` or `## Related` depending on weight |

### 5. Propose an update plan

Present a table to the user before making any changes:

| # | Old page | New claim (from) | Relationship | Proposed change |
|---|---|---|---|---|
| 1 | `chinchilla-law.md` | "Recsys scaling diverges from Chinchilla at large catalog sizes" (from `scaling-laws-recsys.md`) | contradiction | Add CONTRADICTION callout citing both sources |
| 2 | `cold-start-problem.md` | "Generative recommenders mitigate cold-start via learned priors" (from `generative-recommenders.md`) | extension | Append claim to Key claims, add `[[generative-recommenders]]` link |
| 3 | `transformer-architecture.md` | "Compressed output heads reduce memory 4x with <1% quality loss" (from `compressed-heads.md`) | enrichment | Append to Key claims |

**Wait for user confirmation.**

### 6. Apply updates

For each approved update:

- **Enrichment/Extension:** Append the claim to `## Key claims` with proper `[Source:]` citation pointing to the new page's raw source (or the new page itself if the claim originated there).
- **Contradiction:** Add a `> [!warning] CONTRADICTION` callout following the existing format:
  ```markdown
  > [!warning] CONTRADICTION
  > Old claim: <paraphrase>. Source: `<old-source>.md`.
  > New claim: <paraphrase>. Source: `<new-source>.md`.
  > Status: unresolved.
  ```
- **Supersession:** Do NOT delete the old claim. Add the new claim and annotate the old one:
  ```markdown
  - ~~Old claim text~~ (superseded by [[new-page]] — see below). [Source: old-source.md]
  - New claim text. [Source: new-source.md]
  ```

For every touched page:
- Bump `last_updated` to today.
- Do NOT increment `source_count` unless a genuinely new raw source is being cited for the first time on that page.

### 7. Update log

Append to `wiki/log.md`:
```
## [YYYY-MM-DD] reweave | N pages updated with context from M recent ingests
```

### 8. Propose commit

Run `git status --short docs/02_learning/` and show:

- The list of modified files.
- A proposed commit message:
  ```
  wiki(reweave): update N older pages with context from M recent ingests
  ```
- A staging command the user can copy.

Do not run these commands.

## When to suggest reweave

- After 3+ ingests without a reweave: "You've ingested several sources since the last reweave. Want to propagate new knowledge to older pages?"
- When lint flags `last_updated` drift (old pages whose cited sources have newer versions).
- When a query reveals that an older page is missing context that exists in a newer page.

## Anti-patterns

- **Don't reweave into pages you just ingested.** Reweave goes backward — from new to old. If two pages were ingested in the same session, use reflect to connect them instead.
- **Don't dilute pages with tangential claims.** The new claim must be directly relevant to the old page's topic. "Transformers exist" doesn't enrich `cold-start-problem.md` just because transformers are used in recommenders.
- **Don't resolve contradictions silently.** Always use the callout. The user decides which side wins.
- **Don't change `source_count` for indirect citations.** If page A cites raw source X, and you add a claim from page B (which also cites X), that's not a new source for page A. Only bump `source_count` when citing a raw source for the first time on that page.
- **Don't reweave without a window.** Always scope to recent ingests. A full-wiki reweave on every run would be O(n²) and degrade quality through unfocused updates.

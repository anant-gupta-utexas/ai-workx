# Reduce

Detailed workflow for extracting atomic claims from a broad wiki page or raw source.

## When this runs

Triggered when the user wants to break a wiki page or raw source into finer-grained atomic notes: "reduce this page", "extract atomic claims from X", "this page is too broad, break it down", "distill X into atomic notes".

## How it differs from ingest

Ingest takes a raw source and creates/updates wiki pages. Reduce operates on *already-ingested* content — a wiki page that has grown too large, accumulated too many claims, or covers multiple distinct ideas that deserve their own pages. Reduce is the refinement step that sharpens the graph after initial ingests accumulate material.

If the user points at a raw source that hasn't been ingested yet, redirect them to ingest first.

## Preconditions

- `docs/02_learning/README.md` exists and has been read this turn.
- The target is either:
  - A wiki page under `docs/02_learning/wiki/` that the user wants to decompose, OR
  - A raw source that has already been ingested (check `wiki/log.md` for a prior ingest entry).
- `wiki/index.md` exists.

## The loop

### 1. Read the target

Read the full target page. If it's a wiki page, also read any pages it links to via `[[wiki-links]]` — these provide context for deciding where extracted claims should land.

### 2. Extract claims by category

Using the "Atomic claim extraction" prompt from `references/prompts.md`, extract every distinct claim from the page. Classify each into one of five categories:

| Category | What to find | Output |
|---|---|---|
| Core claim | A direct assertion about the domain — one idea, one sentence | New atomic page |
| Pattern | A recurring structure observed across multiple claims on the page | New pattern page |
| Tension | Two claims on the page that pull in opposite directions | New tension page (or `> [!warning] CONTRADICTION` if they genuinely conflict) |
| Enrichment | A claim that strengthens an *existing* wiki page rather than standing alone | Update to existing page |
| Anti-pattern | Something the source explicitly warns against | New problem/anti-pattern page |

Target: 3–10 extracted claims per page. If fewer than 3, the page is probably already atomic — tell the user and stop. If more than 10, the page was severely overloaded; proceed but warn that the output will be large.

### 3. Composability test

For each extracted claim, verify it passes three tests before proposing it as a new page:

1. **Standalone sense** — the claim makes sense without reading the parent page first.
2. **Specificity** — someone could meaningfully disagree with the claim.
3. **Clean linking** — linking to this claim from another page wouldn't drag in unrelated content.

Claims that fail any test get flagged in the proposal with the failing criterion so the user can decide whether to refine or discard.

### 4. Duplicate detection

For each candidate new page, check whether the wiki already covers it:

1. Search `wiki/index.md` for title/slug matches.
2. Grep `wiki/` for key terms from the claim.
3. Check `tags:` and `aliases:` in existing pages.

If a near-duplicate exists, reclassify the claim as an **enrichment** (update the existing page) rather than a new page.

### 5. Propose a split plan

Present a table to the user before writing anything:

| # | Claim | Category | Action | Target path | Links to add |
|---|---|---|---|---|---|
| 1 | "Transformer attention scales quadratically with sequence length" | core claim | new page | `wiki/attention-scales-quadratically.md` | → `[[transformer-architecture]]` |
| 2 | "Flash attention reduces memory from O(n²) to O(n)" | core claim | new page | `wiki/flash-attention-memory.md` | → `[[attention-scales-quadratically]]` |
| 3 | "KV-cache vs recomputation is a memory-latency tradeoff" | tension | new page | `wiki/kv-cache-recompute-tradeoff.md` | → `[[flash-attention-memory]]` |
| 4 | "Multi-head attention provides representation diversity" | enrichment | update | `wiki/transformer-architecture.md` | — |

Also show what happens to the parent page:
- If all claims are extracted: the parent page becomes a **Map of Content** (MOC) — a hub linking to its extracted children with context phrases.
- If some claims remain: the parent page is trimmed, with extracted claims replaced by `[[wiki-links]]` to the new pages.

**Wait for user confirmation.** Do not write files until the plan is approved.

### 6. Apply

For new pages, use the wiki page template from `references/templates.md`:
- `source_count: 1` (the parent page is the source)
- `status: draft`
- Cite the parent page: `[Source: parent-page.md]`
- Include `## Related` with links back to the parent and sibling claims

For enrichments, update the existing page:
- Append the claim to `## Key claims` with citation
- Bump `last_updated`

For the parent page:
- Replace extracted claims with `[[wiki-links]]` to the new pages
- Add context phrases: `[[claim-page]] — extracted from this page; covers X`
- Bump `last_updated`

### 7. Update index and log

- Update `wiki/index.md`: add each new page under the appropriate category.
- Append to `wiki/log.md`:
  ```
  ## [YYYY-MM-DD] reduce | <parent-slug> — N claims extracted (X new pages, Y enrichments)
  ```

### 8. Propose commit

Run `git status --short docs/02_learning/` and show:

- The list of new and modified files.
- A proposed commit message:
  ```
  wiki(reduce): extract N atomic claims from <parent-slug> [X new, Y enrichments]
  ```
- A staging command the user can copy.

Do not run these commands.

## When to suggest reduce

After an ingest that touches many claims on a single page, or when a `lint` report flags a page as oversized (many `## Key claims` entries), suggest running reduce on that page.

## Anti-patterns

- **Don't reduce pages with fewer than 3 claims.** They're already atomic enough.
- **Don't create pages for trivial claims.** "Python is a programming language" fails the specificity test.
- **Don't orphan the parent.** The parent page must either become a MOC or retain enough content to stand on its own.
- **Don't lose citations.** Every extracted claim must carry its `[Source:]` attribution from the parent page through to the new page.

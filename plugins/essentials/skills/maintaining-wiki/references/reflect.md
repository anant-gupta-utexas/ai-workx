# Reflect

Detailed workflow for discovering cross-connections between existing wiki pages.

## When this runs

Triggered when the user wants to strengthen the wiki graph: "find connections in my wiki", "reflect on my wiki", "what relates to X", "connect recent ingests", "wiki connections", "link my pages together".

## Purpose

Ingest adds pages. Reduce sharpens them. Reflect *connects* them. A wiki with 50 pages and 10 links is an address book. A wiki with 50 pages and 200 links is a knowledge graph. Reflect builds the graph by discovering relationships the ingest step didn't surface.

## Preconditions

- `docs/02_learning/README.md` exists and has been read this turn.
- `wiki/index.md` exists with at least 2 pages listed.
- If the user specifies a target page, that page exists.

## Modes

Reflect supports two modes:

1. **Targeted** — user names a specific page: "reflect on `[[scaling-laws-recsys]]`". Finds connections from that page outward.
2. **Sweep** — no target: "reflect on my wiki" or "find connections for recent ingests". Operates on the N most recently ingested/updated pages (default: pages touched since last reflect, or last 5 ingests from `wiki/log.md`).

## The loop

### 1. Identify target pages

**Targeted mode:** Read the named page and its existing `[[wiki-links]]`.

**Sweep mode:** Read `wiki/log.md` to find recent ingests/reduces. Collect pages touched since the last `reflect` log entry (or last 5 ingests if no prior reflect exists). Read each target page.

### 2. Build candidate pool

Read `wiki/index.md` to get the full page inventory. For each target page, build a candidate pool of potentially related pages using this search heuristic (in priority order):

1. **Tag overlap** — pages sharing any `tags:` value with the target.
2. **Alias overlap** — pages whose `aliases:` match terms in the target's content.
3. **Explicit mentions** — pages whose titles or slugs appear as plain text (not yet linked) in the target.
4. **Category neighbors** — pages in the same `index.md` category section as the target.
5. **Fulltext keyword match** — Grep `wiki/` for 3–5 key terms from the target page. Budget: read at most 12 candidate pages total per target.

### 3. Discover connections

For each candidate, use the "Connection discovery" prompt from `references/prompts.md`. Classify each discovered connection:

| Connection type | Meaning | Link phrasing pattern |
|---|---|---|
| **Extends** | New page adds depth to existing page | "extends [[X]] by showing Y" |
| **Contradicts** | Pages disagree on a claim | "contradicts [[X]] — this claims Y while X claims Z" |
| **Exemplifies** | One page is a concrete case of the other's abstract claim | "[[X]] is a concrete instance of this pattern" |
| **Depends on** | Understanding one requires the other | "requires [[X]] for context on Y" |
| **Complements** | Different angles on the same topic | "complements [[X]] by covering the Y angle" |

**Quality standard:** Every connection must articulate *why* the pages relate, not just *that* they relate. "Related to [[X]]" is never acceptable. The link text must add information: "extends [[X]] by adding the latency dimension" is good.

### 4. Identify index updates

Check whether any discovered connections suggest:
- A target page belongs in an additional `index.md` category it's not currently listed under.
- Two pages from different categories share enough connections to warrant a cross-reference note in the index.

### 5. Propose a connection plan

Present a table to the user before making any changes:

| # | Source page | Target page | Connection type | Link text to insert | Direction |
|---|---|---|---|---|---|
| 1 | `scaling-laws-recsys.md` | `chinchilla-law.md` | contradicts | "contradicts [[chinchilla-law]] — recsys scaling diverges from Chinchilla at large catalog sizes" | bidirectional |
| 2 | `scaling-laws-recsys.md` | `cold-start-problem.md` | extends | "extends [[cold-start-problem]] by showing how scaling affects cold-start severity" | forward |
| 3 | `generative-recommenders.md` | `multi-token-prediction.md` | depends on | "depends on [[multi-token-prediction]] as alignment objective" | forward |

Also show proposed index updates if any.

**Wait for user confirmation.**

### 6. Apply connections

For each approved connection:

- **Forward link:** Add a `- [[target]] — context phrase` entry to the source page's `## Related` section. If the page has no `## Related` section, create one before `## Open questions` (or at the end if no open questions).
- **Bidirectional link:** Also add the reverse entry on the target page. Use the inverse phrasing: if A "extends" B, then B "is extended by" A.
- **Bump `last_updated`** on every touched page.

For contradiction connections, also add a `> [!warning] CONTRADICTION` callout on both pages if one doesn't already exist (consistent with the ingest contradiction sweep).

### 7. Update index and log

- Update `wiki/index.md` if any cross-category additions were approved.
- Append to `wiki/log.md`:
  ```
  ## [YYYY-MM-DD] reflect | N connections added across M pages
  ```

### 8. Propose commit

Run `git status --short docs/02_learning/` and show:

- The list of modified files.
- A proposed commit message:
  ```
  wiki(reflect): add N connections across M pages
  ```
- A staging command the user can copy.

Do not run these commands.

## When to suggest reflect

- After every ingest or reduce: "Want me to run reflect on the new pages to find connections?"
- When lint flags orphan pages (zero inbound links).
- When a query reveals that two obviously related pages aren't linked.

## Anti-patterns

- **Don't force connections.** If two pages aren't meaningfully related, don't link them just to increase link density.
- **Don't create circular-only clusters.** If A→B→C→A with no connections outside the cluster, the cluster is isolated. Flag this and suggest connecting at least one node to a page outside the cluster.
- **Don't modify content.** Reflect adds links and connection annotations. It does not rewrite claims, update source counts, or change page status. Content changes are ingest or reweave operations.
- **Don't exceed the page budget.** Reading 12 candidates per target is the cap. If the wiki is large, prioritize by tag overlap and category neighbors.

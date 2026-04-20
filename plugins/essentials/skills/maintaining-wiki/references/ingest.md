# Ingest

Detailed workflow for taking a raw source and weaving it into the wiki.

## When this runs

Triggered when the user wants to add new material to the knowledge base: a file they dropped into `docs/02_learning/raw/`, a link they pasted, or content they want "filed" / "absorbed" / "saved" / "remembered".

## Preconditions

- `docs/02_learning/README.md` exists and has been read this turn.
- The target source is either:
  - already a file in `docs/02_learning/raw/`, OR
  - about to be saved there (see "Pasted content" below).
- `wiki/` exists. If `wiki/index.md` or `wiki/log.md` is missing, create empty-but-valid versions from `references/templates.md` before the first ingest.

## Pasted content

If the user pastes an article, paper text, or a link without saving it to `raw/` first:

1. Derive a slug from the title (lowercase-hyphens).
2. Fetch the content if a link was given (with WebFetch).
3. Write `docs/02_learning/raw/<slug>.md` using the appropriate raw template variant from `references/templates.md`. Frontmatter must include `title`, `url` (if any), `date` (today), and `ingested_via` set per the rule below.
4. Confirm the save with the user before continuing.
5. Proceed with the normal ingest flow using the new raw file.

### Picking `ingested_via`

`ingested_via` has three values and each changes how the ingest loop runs:

| Value | Meaning | Step 2 behavior |
|---|---|---|
| `paste` | Original content — a full article, paper, or transcript copied verbatim. Needs summarization. | Summarize (inline or sub-agent, see step 2) |
| `summary` | File IS a summary of something that lives at `url:` (LLM summary of a URL, user's own YouTube-transcript digest, etc.). Do not re-summarize. | Skip — file is already the digest |
| `atomic` | Short-form content that is already a single idea (tweet, LinkedIn post, short forum reply). No summarization possible or useful. | Skip — file is already atomic |

Decision rule when the skill is authoring the raw file on the user's behalf:

1. **Explicit prompt signal wins.** Phrases like "this is a summary of", "already digested", "file this tweet", "save this LinkedIn post", "atomic", or "bite-sized" set `ingested_via` directly without asking.
2. **Heuristic second.** If no explicit signal, look at the content:
   - Under ~500 words and shaped like a single post/tweet/reply → propose `atomic` and ask one confirm question ("File as `atomic`, `summary`, or `paste`?").
   - Otherwise default to `paste` (today's behavior).
3. **User-authored frontmatter always wins.** If the raw file already exists on disk with `ingested_via` set, the skill never asks and never overrides.

## The loop

### 1. Read

Read the full source file and `docs/02_learning/README.md`. Re-read the README even if it seems unchanged — it is the schema source of truth and may have been edited since the last session.

### 2. Summarize

Branch on `ingested_via`:

- **`summary` or `atomic`** — skip this step entirely. The raw file is already the digest; pass it straight to step 3 (Extract). Do not run the summarization prompt; summarizing a summary or a tweet loses fidelity and wastes tokens.
- **`paste` (or unset)** — run the "Source summarization" prompt from `references/prompts.md` against the full raw content. This produces a structured digest that preserves all original ideas, quotes, names, and subtle details while reducing verbosity. Two sub-modes:
  - **Single-source ingest** — run the prompt inline in the main thread. Spawn overhead isn't worth it for one doc.
  - **Batch ingest (N > 1 `paste` sources in one turn)** — fan out N parallel sub-agents via the Task tool. Each sub-agent receives the path to one raw file plus the "Source summarization" prompt; its final message is the digest for that source. Main thread awaits all N digests, then proceeds to step 3 with all digests collected. This isolates raw-source bloat from the main context when ingesting many papers at once.
  - **Fallback** — if the Task tool is unavailable in the runtime, degrade to sequential inline summarization and print a one-line warning ("Task tool unavailable; summarizing inline — main context may grow.") to the user.

The summary is a working artifact — it is NOT saved to disk or shown to the user unless they ask. It feeds directly into the next step (Extract) and serves as the reference text when writing wiki page content in step 5 (Apply). When writing claims in wiki pages, always verify against the original raw file (or, for `summary` mode, against the source URL if the user can reach it), but use the digest to ensure nothing is overlooked.

### 3. Extract

Using the digest from step 2 (or the raw file itself for `summary`/`atomic` modes), produce an entity/concept extraction pass. Use the "Entity extraction" prompt in `references/prompts.md`, feeding it `{{raw_content}}` alongside the digest for context. Output a list of slugs with canonical name, category (person / system / concept / metric / dataset / technique / organization), and a one-line definition.

For `atomic` sources, aim for 1–3 candidates, not 15–25. A tweet or a short LinkedIn post is typically one idea; do not force-extract a taxonomy it doesn't contain.

### 4. Propose a touch plan

Read `wiki/index.md` and decide, for each extracted entity, whether it deserves:
- a **new page** (no existing coverage),
- an **update** to an existing page (coverage exists but this source adds a claim, a counter-example, or a date),
- a **mention** only (already well-covered; add backlinks but no page).

**Size the touch plan to the source — judgment rules, not a fixed number.** Rough guidance:

- Full paper or long article (`paste`, ~5k+ words) — aim for ~10 touches. This is Karpathy's ambition level; it forces you to extract real connective tissue rather than writing a single summary page.
- Pre-summarized source (`summary`) — aim for ~3–8 touches. The compression is already done; touches track the ideas the summary emphasizes.
- Atomic source (`atomic`) — aim for 1–3 touches. A tweet is often one claim landing on one page. Do not inflate.

The goal is reinforcing the graph, not hitting a count.

Present the plan to the user as a table before writing anything:

| Path | New/Update | Rationale | Links to add |
|---|---|---|---|
| `wiki/scaling-laws-recsys.md` | new | Source introduces novel recsys scaling dynamics distinct from Chinchilla | → `[[chinchilla-law]]`, `[[generative-recommenders]]` |
| `wiki/chinchilla-law.md` | update | Flag contradiction: Netflix recsys scaling diverges from Chinchilla | → `[[scaling-laws-recsys]]` |
| ... | ... | ... | ... |

**Wait for user confirmation.** Do not write files until the user approves the plan (they may prune, add, or re-scope).

### 5. Apply

For each new page, use the wiki page template from `references/templates.md`. Required elements:

- Full YAML frontmatter (`title`, `created`, `last_updated`, `source_count: 1`, `status: draft`, `tags: [...]`, `aliases: [...]`)
- One-paragraph summary
- `## Key claims` — each claim cited `[Source: <raw-filename>.md]`
- `## Related` — `[[wiki-links]]` to connected pages
- `## Open questions` — `> [!question]` callouts for things the source raised but didn't answer

For updates: preserve existing content, bump `last_updated`, increment `source_count`, append claims rather than rewriting, and cite the new source on every new line.

### 6. Backlinks

For each new page, scan existing wiki pages that should link to it. Use the "Backlink pass" prompt in `references/prompts.md` — it returns a list of (page, exact sentence) tuples for insertion. Apply only after showing the diff to the user.

On a first-ever ingest, there's nothing to backlink to; note this and move on.

### 7. Update index and log

- Update `wiki/index.md`: add each new page under the appropriate category heading. If no category fits, create one.
- Append one entry to `wiki/log.md`:
  ```
  ## [YYYY-MM-DD] ingest | <source-slug> — N pages touched (X new, Y updated)
  ```

### 8. Contradiction sweep

For every page you touched, check whether any claim contradicts an existing wiki claim. When you find one, insert a callout on the affected page:

```markdown
> [!warning] CONTRADICTION
> Old claim: <paraphrase>. Source: `<old-source>.md`.
> New claim: <paraphrase>. Source: `<new-source>.md`.
> Status: unresolved.
```

Never silently overwrite. The user decides which side wins; until then, both stand.

### 9. Propose commit

Run `git status --short docs/02_learning/` and show:

- The list of new and modified files.
- A proposed commit message:
  ```
  wiki(ingest): add <topic-slug> from <source-slug> [N pages touched]
  ```
- A staging command the user can copy:
  ```
  git add docs/02_learning/
  git commit -m "wiki(ingest): ..."
  ```

Do not run these commands. The user runs them when ready.

## Worked example 1: Netflix generative recsys paper (`ingested_via: paste`)

Source: `docs/02_learning/raw/towards_generalizable_recommendation_systems.md`

Frontmatter already present: `title`, `url`, `date: 2026-04-09`.

After summarizing, **candidate entity extraction** yielded (sample, not exhaustive):

| Slug | Canonical name | Category |
|---|---|---|
| `scaling-laws-recsys` | Scaling laws for recommendation systems | concept |
| `generative-recommenders` | Generative recommendation models | technique |
| `cold-start-problem` | Cold-start problem | concept |
| `multi-token-prediction` | Multi-token prediction (alignment objective) | technique |
| `sampled-softmax` | Sampled softmax | technique |
| `compressed-heads` | Compressed output heads | technique |
| `multi-modal-semantic-towers` | Multi-modal semantic item towers | technique |
| `chinchilla-law` | Chinchilla scaling law | concept |
| `netflix-recsys` | Netflix recommendation system | organization/system |
| `serving-latency-distribution-shift` | Serving-latency-induced distribution shift | concept |
| `user-behavior-sequences` | User behavior as token sequences | concept |
| `recsys-catalog-scale` | Recsys catalog-scale challenges | concept |

**Proposed touch plan**: 12 touches — 10 new pages + 2 updates (`chinchilla-law` and a future `netflix` hub page if it exists).

**Contradictions to flag**: the source observes "novel scaling dynamics that differ from established laws such as the Chinchilla law". If a `chinchilla-law` page exists from a prior ingest, add a callout pointing to `scaling-laws-recsys` as the counter-example.

**Log entry**:
```
## [2026-04-09] ingest | towards_generalizable_recommendation_systems — 12 pages touched (10 new, 2 updated)
```

**Commit**:
```
wiki(ingest): add scaling-laws-recsys from netflix-recsys-paper [12 pages touched]
```

## Worked example 2: a Karpathy tweet on dataset quality (`ingested_via: atomic`)

Source: `docs/02_learning/raw/karpathy-dataset-quality-tweet.md`

Frontmatter:
```yaml
---
title: "Karpathy on dataset quality beating architecture choices"
url: "https://twitter.com/karpathy/status/..."
date: 2026-04-20
ingested_via: atomic
---
```

Step 2 is **skipped** — the tweet is ~120 words, already atomic. No summarization runs.

Step 3 extraction yields a single candidate:

| Slug | Canonical name | Category |
|---|---|---|
| `dataset-quality` | Dataset quality | concept |

**Proposed touch plan**: 1 touch — update the existing `wiki/dataset-quality.md` page (if present) or create it. No new hub pages, no forced backlinks.

**Log entry**:
```
## [2026-04-20] ingest | karpathy-dataset-quality-tweet — 1 page touched (0 new, 1 updated)
```

**Commit**:
```
wiki(ingest): reinforce dataset-quality from karpathy-tweet [1 page touched]
```

The value of atomic ingests isn't breadth per source — it's accumulation. Ten tweets reinforcing `dataset-quality` over six months is stronger evidence than one paper citing it once.

## Worked example 3: LLM-summarized URL (`ingested_via: summary`)

Source: `docs/02_learning/raw/chinchilla-optimal-ratios-summary.md`

Frontmatter:
```yaml
---
title: "Chinchilla-optimal training ratios — summary"
url: "https://arxiv.org/abs/2203.15556"
date: 2026-04-20
ingested_via: summary
---
```

Body is a ~900-word LLM-generated digest of the Chinchilla paper. The user ran their own summarization outside the wiki and dropped the digest into `raw/`.

Step 2 is **skipped** — the file already satisfies the digest contract. The ingest loop reads it, extracts entities from it, and builds the touch plan against it. Main thread never sees the full 30-page paper; that's the point of using `summary` mode.

Touch plan sized to the source: ~5 touches. Citations on resulting wiki pages still read `[Source: chinchilla-optimal-ratios-summary.md]` — readers who want the primary source follow the `url:` in the frontmatter.

## Re-ingest

If the source file is already reflected in the wiki (check `wiki/log.md`), this is a re-ingest:

1. Diff the current raw file against the state it was in at last ingest (use git blame on the raw file if helpful).
2. Touch only pages where claims actually changed.
3. Bump `last_updated` on touched pages; do not increment `source_count` (it's still the same source).
4. Log entry uses action `update` instead of `ingest`:
   ```
   ## [YYYY-MM-DD] update | <source-slug> — N pages touched
   ```

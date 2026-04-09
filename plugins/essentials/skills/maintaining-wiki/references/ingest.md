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
3. Write `docs/02_learning/raw/<slug>.md` using the pasted-raw template from `references/templates.md`. Frontmatter must include `title`, `url` (if any), `date` (today), and `ingested_via: paste`.
4. Confirm the save with the user before continuing.
5. Proceed with the normal ingest flow using the new raw file.

## The loop

### 1. Read

Read the full source file and `docs/02_learning/README.md`. Re-read the README even if it seems unchanged — it is the schema source of truth and may have been edited since the last session.

### 2. Summarize

Run the "Source summarization" prompt from `references/prompts.md` against the full raw content. This produces a structured digest that preserves all original ideas, quotes, names, and subtle details while reducing verbosity.

The summary is a working artifact — it is NOT saved to disk or shown to the user unless they ask. It feeds directly into the next step (Extract) and serves as the reference text when writing wiki page content in step 5 (Apply). When writing claims in wiki pages, always verify against the original raw file, but use the summary to ensure nothing is overlooked.

### 3. Extract

Using the summary from step 2, produce an entity/concept extraction pass. Use the "Entity extraction" prompt in `references/prompts.md`, feeding it `{{raw_content}}` alongside the summary for context. Output a list of slugs with canonical name, category (person / system / concept / metric / dataset / technique / organization), and a one-line definition.

### 4. Propose a touch plan

Read `wiki/index.md` and decide, for each extracted entity, whether it deserves:
- a **new page** (no existing coverage),
- an **update** to an existing page (coverage exists but this source adds a claim, a counter-example, or a date),
- a **mention** only (already well-covered; add backlinks but no page).

Target **10–15 page touches** per source. This is Karpathy's ambition-level — it forces you to extract real connective tissue from the source, not just a single summary page.

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

## Worked example: Netflix generative recsys paper

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

## Re-ingest

If the source file is already reflected in the wiki (check `wiki/log.md`), this is a re-ingest:

1. Diff the current raw file against the state it was in at last ingest (use git blame on the raw file if helpful).
2. Touch only pages where claims actually changed.
3. Bump `last_updated` on touched pages; do not increment `source_count` (it's still the same source).
4. Log entry uses action `update` instead of `ingest`:
   ```
   ## [YYYY-MM-DD] update | <source-slug> — N pages touched
   ```

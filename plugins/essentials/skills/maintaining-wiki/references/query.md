# Query

Detailed workflow for answering a question from the wiki.

## When this runs

Triggered when the user asks something like "what does my wiki say about X", "according to my notes", "search my knowledge base", or any factual question posed in the context of `docs/02_learning/`.

## Preconditions

- `docs/02_learning/wiki/index.md` exists. If missing, run `status` first — the wiki is empty or the index drifted, and query can't reliably answer anything until that's fixed.
- `docs/02_learning/README.md` has been read this turn.

## The loop

### 1. Read the index

Always read `wiki/index.md` first, before any page. The index is a content-oriented catalog: titles, one-line summaries, categories. It lets you pick candidates without loading the entire wiki into context.

If the index looks stale (the question is about a topic that obviously should be in the wiki but isn't listed), consider running `lint` afterward. Don't silently fix it during a query.

### 2. Pick candidates

Candidate-selection heuristic, in order of preference:

1. **Exact title match** in a page's frontmatter.
2. **Tag match** — pages whose `tags:` include a term from the question.
3. **Alias match** — pages whose `aliases:` include an acronym or synonym from the question.
4. **Slug fuzzy match** against the filename.
5. **Fulltext grep** across `wiki/` as a last resort.

Budget: **read at most 8 pages** before you start synthesizing. If you genuinely need more, tell the user the question is too broad and ask them to narrow it.

### 3. Read the candidates

Read every candidate page end-to-end. Pay attention to:

- `> [!warning] CONTRADICTION` callouts — they mean the wiki holds two positions on a claim. Report both.
- `> [!question] Open question` callouts — the wiki flagged this as unresolved. Don't pretend otherwise.
- `status: draft` frontmatter — flag that the page hasn't been reviewed.

### 4. Synthesize

Compose a new answer. Do not concatenate page summaries.

**Rules**:

- Every factual sentence ends with a citation: `[Source: page-name.md]`.
- If a claim comes from a raw source (cited inside a wiki page as `[Source: raw-file.md]`), you may pass it through as `[Source: raw-file.md]` or attribute to the wiki page — pick whichever gives the reader a faster path to verification. Prefer wiki pages.
- Quotes are sparing. Paraphrase.
- If the wiki has nothing on the topic, say so explicitly. Do not improvise.
- If the wiki is contradictory, present both sides and name the sources.
- If the wiki is thin (one page, one claim), say "the wiki has limited coverage on this" before answering.

### 5. Offer to save

After the answer, offer to save it to `outputs/YYYY-MM-DD_<slug>.md` using the output template from `references/templates.md`. Save only if the user confirms. The output file's frontmatter records `question`, `answered_on`, and `source_pages: [...]`, and includes a "Wiki gaps surfaced" section listing any missing/weak coverage you noticed.

### 6. Log

Append to `wiki/log.md` regardless of whether the output was saved:

```
## [YYYY-MM-DD] query | <question truncated to 80 chars>
```

### 7. Offer to file gaps

If the query revealed a gap — a concept referenced nowhere, an open question that matters to the user, a contradiction that needs resolving — explicitly offer to file an ingest or follow-up task. Do not create pages unilaterally; that's always an ingest operation.

## Anti-patterns

Don't:

- **Invent pages.** Cite only pages you actually read. If a citation turns out to point to a non-existent file, that's a high-severity lint finding — surface it instead of hiding it.
- **Synthesize across uncited gaps.** If two pages don't connect, don't paper over it with "these concepts relate because..." unless the wiki itself makes that link.
- **Auto-promote the answer into the wiki.** Queries can surface gaps; filling them is an ingest operation that needs the full extract/propose/apply loop.
- **Trust the index blindly.** If you read a page and its claims contradict what the index summary said, trust the page and flag the index drift.
- **Answer from raw/ directly.** Raw sources are the past; the wiki is the compiled present. If the answer isn't in the wiki, the right response is "the wiki doesn't cover this; want me to ingest `<raw-file>`?"

## Citation format reference

- `[Source: page-name.md]` — attributing to a wiki page.
- `[Source: raw/filename.md]` — attributing to a raw source directly (only when a wiki page itself cites it that way).
- No bare URLs. If a raw source has a URL in its frontmatter, the wiki page captures it; the citation points to the wiki page.

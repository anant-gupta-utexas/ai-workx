# Prompt library

Reusable prompt templates the skill uses internally during ingest, query, lint, and status. These are the spiritual successor to the old `docs/02_learning/temp_prompts.md` — curated, living with the skill, version-controlled.

Each prompt is self-contained. Paste or adapt into your own reasoning; don't show these raw to the user unless they ask.

## Source summarization

Used in ingest step 2 (between Read and Extract).

**When to run:**

- **Skip** this prompt when `ingested_via` is `summary` or `atomic` — the raw file is already the digest. Passing it through this prompt wastes tokens and loses fidelity.
- **Run inline** for single-source `paste` ingests.
- **Dispatch inside a Task sub-agent per source** for batch ingests (>1 `paste` source in one turn). Await all sub-agent digests before proceeding to Extract. Fallback to sequential inline with a warning if the Task tool is unavailable.

> Summarize the source below into a structured, high-fidelity digest.
>
> Rules:
> - Preserve all original ideas while making the content shorter and clearer.
> - Organize the summary by chapters, themes, or bullet points — mirror the source's own structure where possible.
> - Match the tone of the original (e.g., raw, formal, motivational, technical).
> - Retain specific quotes, names, numbers, dates, and subtle details — fidelity over brevity.
> - After a first pass, revise to restore any omitted quotes, proper nouns, or nuanced points, aiming for near-100% fidelity.
> - Produce a holistic summary: the reader should be able to understand the full argument without consulting the original.
>
> Output format:
> 1. **Title**: the source's title
> 2. **Core thesis** (1-2 sentences)
> 3. **Structured summary** (organized by chapters/themes/bullet points)
> 4. **Key quotes** (verbatim, with context)
> 5. **Names and entities** (people, orgs, systems mentioned)
> 6. **Open threads** (questions the source raises but doesn't resolve)
>
> ---
> SOURCE:
> {{raw_content}}

## Entity extraction

Used in ingest step 3.

**Sizing:** for `atomic` sources, aim for 1–3 candidates, not 15–25. A tweet or short post is typically one idea; don't force-extract a taxonomy it doesn't contain.

> From the source below, list every proper noun, technique name, metric, dataset, organization, and system component that deserves its own wiki page or a mention.
>
> For each, output one row:
>
> `slug | canonical_name | category | one_line_definition`
>
> Categories: `person | organization | system | concept | technique | metric | dataset`.
>
> Slugs are lowercase-hyphens, ≤ 40 chars, stable (avoid version numbers).
>
> Err on the side of completeness — the next step prunes. Aim for 15–25 candidates for a typical paper.
>
> ---
> SOURCE:
> {{raw_content}}

## New-page proposal

Used in ingest step 4.

> You have these extracted entities:
>
> {{entity_table}}
>
> And the current wiki index:
>
> {{index_md}}
>
> For each entity, decide:
> - **new** — no existing coverage; create a page.
> - **update** — existing page needs new claims.
> - **mention** — already well-covered; add backlinks only.
>
> Target 10–15 total touches (new + update). If the source is thin, fewer is fine; explain why.
>
> Output a table: `path | new/update/mention | rationale | links to add`.
>
> Prefer updates to new pages where possible — reinforcing the graph matters more than inflating page count.

## Contradiction hunt

Used in ingest step 8.

> New claim from `{{source}}`:
>
> > {{new_claim}}
>
> Existing wiki claim on the same topic (from `{{existing_page}}`):
>
> > {{existing_claim}}
>
> Are these compatible, complementary, or contradictory?
>
> - **Compatible** — same position, different phrasing. No action.
> - **Complementary** — different aspects of the same truth. Merge into existing page.
> - **Contradictory** — the claims disagree on a fact. Emit a `> [!warning] CONTRADICTION` callout body with both sides and both sources named.
>
> Do not resolve the contradiction. Flag it.

## Query synthesis

Used in query step 4.

> Question: {{question}}
>
> You may use only these wiki pages (attached below). Do not invent other pages or cite anything not in this list.
>
> Write a direct answer. Every sentence carrying a factual claim ends with a citation in the form `[Source: page-name.md]`. Paraphrase; quote sparingly.
>
> If the wiki doesn't cover the question, say so explicitly and list which pages you checked.
>
> If the wiki contradicts itself, present both sides and name both sources.
>
> ---
> PAGES:
> {{candidate_pages}}

## Backlink pass

Used in ingest step 6.

> A new wiki page was just created:
>
> - Slug: `{{new_slug}}`
> - Summary: {{summary}}
>
> Scan these existing wiki pages and identify which should link to the new one:
>
> {{existing_pages}}
>
> For each match, output: `page | exact sentence where [[{{new_slug}}]] should be inserted`.
>
> Only suggest insertions where the link is contextually meaningful — no forced references.

## Status summary

Used in status operation.

> Wiki counts:
>
> - Raw sources: {{raw_count}}
> - Wiki pages: {{wiki_count}} ({{by_status}})
> - Orphans: {{orphan_count}}
> - Unresolved contradictions: {{contradiction_count}}
> - Open questions: {{question_count}}
>
> Recent activity (last 5 log entries):
>
> {{recent_log}}
>
> Last ingest: {{last_ingest}}. Days since last lint: {{days_since_lint}}.
>
> Write a 5-bullet status report. Emphasize:
> 1. What's well-covered (topics with multiple sources, reviewed status)
> 2. What's stale (draft > 30 days, status != reviewed with old sources)
> 3. What's unresolved (contradictions, open questions)
> 4. Recent momentum (ingests this week/month)
> 5. The most useful next action (specific: "ingest X" or "resolve contradiction on Y")

## Lint triage

Used in lint step 5.

> Lint findings:
>
> {{findings}}
>
> Group by fix cost:
>
> - **Cheap** — mechanical fixes: missing frontmatter fields, broken links to renamed files, index entries for existing pages. Safe to batch.
> - **Medium** — judgment-requiring fixes: resolving contradictions, writing definitions for undefined concepts, splitting tag sprawl.
> - **Expensive** — structural changes: reorganizing categories, merging duplicate pages, re-ingesting a source that broke many claims.
>
> Within each group, order by severity then by number of pages affected. Output a numbered fix plan the user can approve piecemeal.

## Atomic claim extraction

Used in reduce step 2.

> Page to decompose:
>
> {{page_content}}
>
> Extract every distinct claim from this page. For each claim, output one row:
>
> `claim_text | category | composability_verdict | notes`
>
> Categories: `core_claim | pattern | tension | enrichment | anti_pattern`.
>
> Composability test — for each claim, assess:
> 1. **Standalone sense** — does it make sense without reading the parent page? (pass/fail)
> 2. **Specificity** — could someone meaningfully disagree? (pass/fail)
> 3. **Clean linking** — would linking to this claim from another page drag in unrelated content? (pass/fail)
>
> `composability_verdict` = pass (all three pass) | partial (1-2 fail, note which) | fail (all fail, skip).
>
> Target 3–10 claims. If fewer than 3, the page is already atomic — say so. If more than 10, extract all but flag the excess.
>
> For `enrichment` category: also name the existing wiki page the claim should enrich rather than becoming its own page.
>
> ---
> EXISTING WIKI INDEX (for duplicate detection):
> {{index_md}}

## Connection discovery

Used in reflect step 3.

> Target page:
>
> {{target_page_content}}
>
> Candidate pages (potential connections):
>
> {{candidate_pages}}
>
> For each candidate, determine whether a meaningful connection exists with the target page. Only report genuine connections — "related to" is never sufficient.
>
> For each connection found, output one row:
>
> `candidate_slug | connection_type | link_text | direction`
>
> Connection types:
> - **extends** — candidate adds depth to target (or vice versa)
> - **contradicts** — pages disagree on a claim
> - **exemplifies** — one is a concrete case of the other's abstract claim
> - **depends_on** — understanding one requires the other
> - **complements** — different angles on the same topic
>
> `link_text` must articulate *why* the pages relate. Pattern: "extends [[slug]] by adding the X dimension" or "contradicts [[slug]] — this claims X while that claims Y".
>
> `direction`: `forward` (target → candidate), `backward` (candidate → target), or `bidirectional`.
>
> If no meaningful connection exists with a candidate, omit it entirely. Quality over quantity.

## Backward enrichment scan

Used in reweave step 2–3.

> Recently ingested pages (new knowledge):
>
> {{recent_pages}}
>
> Older wiki pages (candidates for backward update):
>
> {{older_pages}}
>
> For each older page, check whether any claim from the recent pages should update it. Only flag genuine updates — the new claim must be directly relevant to the older page's topic.
>
> For each update found, output one row:
>
> `old_page_slug | new_claim | new_claim_source | relationship | proposed_change`
>
> Relationships:
> - **enrichment** — new claim adds depth. Proposed change: append to Key claims.
> - **contradiction** — new claim conflicts. Proposed change: add CONTRADICTION callout.
> - **supersession** — new claim replaces outdated claim. Proposed change: strikethrough old + add new.
> - **extension** — new claim extends a pattern. Proposed change: append to Key claims or Related.
>
> If an older page has no relevant updates from the recent pages, omit it entirely.
>
> Do NOT flag tangential connections. "Transformers exist" does not enrich a page about cold-start problems just because transformers are used in recommenders.

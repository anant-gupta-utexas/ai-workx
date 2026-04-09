# Prompt library

Reusable prompt templates the skill uses internally during ingest, query, lint, and status. These are the spiritual successor to the old `docs/02_learning/temp_prompts.md` — curated, living with the skill, version-controlled.

Each prompt is self-contained. Paste or adapt into your own reasoning; don't show these raw to the user unless they ask.

## Source summarization

Used in ingest step 2 (between Read and Extract).

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

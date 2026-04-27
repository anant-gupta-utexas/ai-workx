# Templates

Copy-paste skeletons for every file the skill creates. All placeholders are in `{{braces}}`.

## 1. New wiki topic page

Path: `docs/02_learning/wiki/{{slug}}.md`

```markdown
---
title: {{Canonical Topic Name}}
created: {{YYYY-MM-DD}}
last_updated: {{YYYY-MM-DD}}
source_count: 1
status: draft
tags: [{{tag1}}, {{tag2}}]
aliases: ["{{Synonym}}", "{{Acronym}}"]
---

{{One-paragraph summary of the topic in plain prose. No citations needed here — the summary is a gloss, not a claim.}}

> [!note] Definition
> {{One-sentence canonical definition of the topic.}}

## Key claims

- {{Claim sentence one.}} [Source: {{raw-filename}}.md]
- {{Claim sentence two.}} [Source: {{raw-filename}}.md]
- {{Claim sentence three.}} [Source: {{raw-filename}}.md]

## Related

- [[{{related-slug-1}}]] — {{one-line why}}
- [[{{related-slug-2}}]] — {{one-line why}}

## Open questions

> [!question] {{Question the source raised but didn't answer.}}

<!-- Section skeletons above are the minimum. Add sections as content demands:
     Background, Techniques, Counterexamples, Timeline, Comparisons. -->
```

## 2. `wiki/index.md`

Path: `docs/02_learning/wiki/index.md`

```markdown
---
title: Wiki Index
last_updated: {{YYYY-MM-DD}}
---

# Wiki Index

Categorized catalog of every page in this wiki. One line per page: `[[slug]] — one-line description`.

## Concepts

- [[{{slug}}]] — {{one-line description}}

## Techniques

- [[{{slug}}]] — {{one-line description}}

## Systems and organizations

- [[{{slug}}]] — {{one-line description}}

## Metrics and datasets

- [[{{slug}}]] — {{one-line description}}

## People

- [[{{slug}}]] — {{one-line description}}

<!-- Add categories as they emerge. Don't pre-create empty sections. -->
```

## 3. `wiki/log.md`

Path: `docs/02_learning/wiki/log.md`

```markdown
---
title: Wiki Log
---

# Wiki Log

Append-only chronological record of every action taken against this wiki.
Format: `## [YYYY-MM-DD] action | description`
Actions: `ingest | update | query | lint | reduce | reflect | reweave`

## [{{YYYY-MM-DD}}] ingest | {{source-slug}} — N pages touched (X new, Y updated)

## [{{YYYY-MM-DD}}] query | {{question truncated to 80 chars}}

## [{{YYYY-MM-DD}}] lint | N findings (H high / M medium / L low) | score: NN/100

## [{{YYYY-MM-DD}}] update | {{source-slug}} — N pages touched

## [{{YYYY-MM-DD}}] reduce | {{parent-slug}} — N claims extracted (X new pages, Y enrichments)

## [{{YYYY-MM-DD}}] reflect | N connections added across M pages

## [{{YYYY-MM-DD}}] reweave | N pages updated with context from M recent ingests
```

Append to the **bottom**. Never reorder. Never delete entries.

## 4. Lint report

Path: `docs/02_learning/wiki/lint-report-{{YYYY-MM-DD}}.md`

```markdown
---
title: Lint Report {{YYYY-MM-DD}}
run_on: {{YYYY-MM-DD}}
pages_scanned: {{N}}
---

# Lint Report — {{YYYY-MM-DD}}

## Summary

- **High**: {{H}} findings
- **Medium**: {{M}} findings
- **Low**: {{L}} findings
- **Pages scanned**: {{N}}
- **cleanliness_score**: {{score}}/100 (orphans={{A}}, broken_links={{B}}, contradictions={{C}}, missing_citations={{D}}, missing_frontmatter={{E}}, index_drift={{F}}, stale_pages={{G}})

## High severity

### {{Finding title}}
- **Check**: {{check name from lint.md}}
- **File**: `wiki/{{slug}}.md` (line {{N}})
- **Detail**: {{what's wrong}}
- **Proposed fix**: {{specific action}}

<!-- repeat per finding -->

## Medium severity

<!-- same structure -->

## Low severity

<!-- same structure -->

## Proposed fix plan

Grouped by cost (cheap / medium / expensive).

### Cheap (mechanical, safe to batch)

1. {{fix}}
2. {{fix}}

### Medium (judgment-requiring)

1. {{fix}}

### Expensive (structural)

1. {{fix}}

## Sign-off

Reviewed by: _____________________
Date: _____________________
Next lint due: {{YYYY-MM-DD + 1 month}}
```

## 5. Output file (query answer)

Path: `docs/02_learning/outputs/{{YYYY-MM-DD}}_{{slug}}.md`

```markdown
---
question: "{{original question verbatim}}"
answered_on: {{YYYY-MM-DD}}
source_pages: [{{slug-1}}, {{slug-2}}]
---

# {{Question as a heading}}

## Answer

{{Synthesized answer with [Source: page.md] citations on every factual sentence.}}

## Wiki gaps surfaced

- {{Gap noticed while answering — concept mentioned nowhere, contradiction that needs resolving, open question that's now load-bearing.}}

## Pages consulted

- [[{{slug-1}}]]
- [[{{slug-2}}]]
```

## 6. Status report (transient; not always saved)

This is shown in chat, not written to disk by default. If the user asks to save it, write to `outputs/{{YYYY-MM-DD}}_status.md`.

```markdown
# Wiki Status — {{YYYY-MM-DD}}

## Counts

- Raw sources: {{N}}
- Wiki pages: {{N}} ({{A}} draft, {{B}} reviewed, {{C}} needs_update)
- Orphan pages: {{N}}
- Unresolved contradictions: {{N}}
- Open questions: {{N}}

## Activity

- Last ingest: {{YYYY-MM-DD}} — {{source-slug}}
- Days since last lint: {{N}}
- Recent log entries:
  1. {{entry}}
  2. {{entry}}
  3. {{entry}}
  4. {{entry}}
  5. {{entry}}

## Summary

- {{Well-covered bullet}}
- {{Stale bullet}}
- {{Unresolved bullet}}
- {{Momentum bullet}}
- **Next action**: {{specific recommendation}}
```

## 7. Raw file stub (for pasted content)

Three variants, one per `ingested_via` value. Pick per the decision rule in `references/ingest.md` ("Picking `ingested_via`"). Never modify a raw file after it's written — if the source is updated, create a new raw file with a version suffix (`{{slug}}-v2.md`) rather than overwriting.

### 7a. `ingested_via: paste` — original content, needs summarization

Path: `docs/02_learning/raw/{{slug}}.md`

```markdown
---
title: "{{Full title from source}}"
url: "{{source url if any}}"
date: {{YYYY-MM-DD}}
ingested_via: paste
---

{{pasted content verbatim}}
```

### 7b. `ingested_via: summary` — file IS a summary of content at `url:`

Use when the user already summarized a longer source (LLM summary of a URL, their own YouTube-transcript digest, etc.) and doesn't want the raw original stored. The `url:` field is the provenance pointer — a reader who wants the primary source follows the link. `url:` is required for this variant.

Path: `docs/02_learning/raw/{{slug}}.md`

```markdown
---
title: "{{Full title — add ' — summary' suffix if helpful}}"
url: "{{source url — REQUIRED for summary variant}}"
date: {{YYYY-MM-DD}}
ingested_via: summary
---

<!-- This file is a summary. Original content lives at the url above. -->

{{summary content}}
```

### 7c. `ingested_via: atomic` — short-form, already one idea

Use for tweets, LinkedIn posts, short forum replies, Slack snippets — anything under ~500 words that represents a single thought. No summarization; ingest reads the body verbatim as the digest. `url:` is optional but recommended when the source is public.

Path: `docs/02_learning/raw/{{slug}}.md`

```markdown
---
title: "{{Author on topic — one-line framing}}"
url: "{{source url if public, else omit}}"
date: {{YYYY-MM-DD}}
ingested_via: atomic
---

{{full atomic content verbatim}}
```

# Obsidian compatibility

Rationale and exhaustive list of Obsidian-compatible extensions the skill uses.

## Why this matters

The user plans to migrate the wiki into an Obsidian vault later. The cheapest migration is "copy the folder" — which only works if the files don't use Obsidian-only syntax that breaks on GitHub today, and don't lack the affordances Obsidian readers expect (tags, aliases, callouts). This file is the contract for that: what to adopt now, what to avoid, and what to leave to the user's future Obsidian plugins.

## Adopt now

### 1. `tags: []` in frontmatter

Add to every new wiki page. Seed tags organically during ingest — don't impose a taxonomy up front. A tag is a slug-style string; spaces become hyphens.

```yaml
tags: [recsys, scaling-laws, netflix]
```

Obsidian indexes these automatically. Plain markdown viewers ignore YAML arrays.

### 2. `aliases: []` in frontmatter

Synonyms, acronyms, plural/singular variants. Makes the query heuristic work and lets Obsidian resolve `[[MRR]]` → `mean-reciprocal-rank.md`.

```yaml
aliases: ["MRR", "Mean Reciprocal Rank"]
```

### 3. Callouts

Obsidian renders these as styled panels. Non-Obsidian renderers show them as nested blockquotes, which is fine.

| Callout | Use |
|---|---|
| `> [!warning] CONTRADICTION` | Two wiki claims disagree. Body names both sides and both sources. |
| `> [!note] Definition` | Canonical definition of a concept. One per page max. |
| `> [!question] Open question` | Something the source raised but didn't answer. |
| `> [!info]` | Source context, caveats, scope. |

Example:

```markdown
> [!warning] CONTRADICTION
> Old claim: Chinchilla scaling applies universally. Source: `early-llm-paper.md`.
> New claim: Recsys scaling diverges from Chinchilla. Source: `towards_generalizable_recommendation_systems.md`.
> Status: unresolved.
```

The callout syntax is `> [!type]` on the opening line, with the rest of the blockquote as the body. Type is lowercase. Anything else is ignored by Obsidian and by markdown.

### 4. Keep `[[wiki-links]]`

Already in the README schema. Obsidian resolves them natively; GitHub ignores them but the text reads fine. Do not convert them to `[text](path)` — you lose the Obsidian graph.

### 5. Keep `[Source: filename.md]` citations

Plain-text citation. Not Obsidian-specific. Works in both readers.

## Avoid

### Dataview code blocks

```dataview
TABLE file.name FROM #recsys
```

These break on GitHub and require a plugin in Obsidian. If the user installs Dataview later, they can add these themselves.

### `%% Obsidian comments %%`

Obsidian-only comment syntax. Use HTML comments instead — they work everywhere:

```markdown
<!-- This comment works in every markdown renderer -->
```

### Templater `<% %>` syntax

Plugin-specific. Skip entirely.

### Plugin-specific frontmatter

Examples: `cssclass:`, `publish:`, `banner:`, `icon:`. Leave these to the user's future Obsidian setup.

### `![[file#heading]]` embeds

Technically supported in Obsidian but fragile (breaks if the heading is renamed). Prefer explicit `[[page]]` links.

## Schema-divergence flag

As of this file's creation, `docs/02_learning/README.md` defines:

- Required frontmatter: `title`, `created`, `last_updated`, `source_count`, `status`.
- Contradiction format: `> CONTRADICTION: [old claim] vs [new claim] from [source]`.

The skill adds:

- `tags: []` and `aliases: []` to frontmatter.
- `> [!warning] CONTRADICTION` callouts (strictly additive — the old format still parses as a plain blockquote, but new pages use the callout form).

These additions are **extensions**, not replacements. On the first ingest after skill install, propose a README patch that documents them as optional fields:

```markdown
## Optional fields (Obsidian-compatible)

Wiki pages may include these additional frontmatter fields for Obsidian compatibility:
- `tags: []` — slug-style tags.
- `aliases: []` — synonyms and acronyms.

Contradictions may use the callout form `> [!warning] CONTRADICTION` (preferred)
or the legacy form `> CONTRADICTION: ...`. Both render as blockquotes in plain markdown.
```

Wait for the user to approve the patch before landing new pages that use these fields. Never mutate the README silently.

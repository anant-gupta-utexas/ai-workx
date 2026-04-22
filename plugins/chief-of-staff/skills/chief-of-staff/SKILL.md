---
name: chief-of-staff
description: Use when the user wants a repo-native chief-of-staff operation on a markdown-first second-brain vault. Trigger on phrases like "cos daily", "cos weekly", "cos review", "chief of staff", "run chief of staff", "daily review", "weekly review", "monthly review", "quarterly review", "what should I work on", "what's on my plate", "what's overdue", "status of my build", "status of projects", "triage my inbox", "triage my tasks", "sweep my tasks", "what cadences are overdue", "what's in my dashboard", "refresh my dashboard", "where do I stand today", "what needs attention". Also trigger when the user asks the agent to self-advocate (observe patterns) or propose improvements to the vault workflow. The skill owns three operations (daily / weekly / review), reads the vault state from docs/00_ops/meta/state.md, regenerates docs/00_ops/meta/dashboard.md on weekly runs, appends observations to docs/00_ops/meta/cos-suggestions.md, and delegates wiki work to the maintaining-wiki skill. Do NOT trigger for one-off task lookups ("what's on my plate right now?" should pick *daily*, but "add this to active.md" is a plain routing operation governed by CLAUDE.md). Do NOT trigger for wiki operations (ingest, query, lint) — those belong to maintaining-wiki. Do NOT trigger for journal writing — that is a plain file edit, not a CoS operation.
---

# chief-of-staff

## Purpose

Act as an on-demand chief of staff for a personal, markdown-first second-brain
vault. Answer "where do I stand?", "what's overdue?", and "what should I work
on next?" from the files in the repo alone — no external connectors.

The vault schema is defined by the target repo's `AGENTS.md` and `CLAUDE.md`.
Read those first on every invocation. This skill's contract:

1. On-demand only. Never run proactively.
2. Three operations: `daily`, `weekly`, `review`. Pick by user intent.
3. Read-mostly. Only write to `docs/00_ops/meta/`. Everything else is a
   proposal the user approves.
4. Never commit. End with a proposed commit message and stop.
5. Delegate wiki ops to `maintaining-wiki`; do not re-implement them.

## Preconditions

Run this checklist silently on every invocation. If a precondition fails,
surface the failure to the user and offer to fix it before proceeding.

1. Read `AGENTS.md` at the repo root (the "who am I, where am I" file).
2. Read `CLAUDE.md` at the repo root (the routing table).
3. Read `docs/00_ops/meta/state.md` for cadence dates and the `current_focus`
   line.
4. Check `docs/00_ops/` structure exists:
   - `docs/00_ops/inbox/inbox.md`
   - `docs/00_ops/tasks/active.md`
   - `docs/00_ops/meta/{state.md,dashboard.md,cos-suggestions.md}`
5. If any are missing, stop and propose scaffolding them (point at the plan in
   the second-brain repo for the expected shape).

## Operation selection

| User intent signal | Operation |
| --- | --- |
| "cos daily", "daily review", "what should I work on", "what's on my plate today", "where do I stand today" | **daily** |
| "cos weekly", "weekly review", "triage inbox", "sweep tasks", "refresh dashboard" | **weekly** |
| "cos review", "monthly review", "quarterly review", "goals review", "big-picture check" | **review** |
| "what's overdue" | Check `state.md` cadence targets; if multiple overdue, recommend `weekly`. If just today's surface, run `daily`. |
| Ambiguous | Ask one clarifying question before choosing. Default guess: `daily`. |

Progressive disclosure: after picking the operation, load its reference file
only.

| Operation | Reference file |
| --- | --- |
| daily | `references/daily.md` |
| weekly | `references/weekly.md` |
| review | `references/review.md` |
| (self-advocacy rules — read on weekly + review) | `references/operating-contract.md` |

## Core behavior

Regardless of operation:

- **Never commit.** End with a `git status --short` plus a proposed commit
  message in a fenced block. Wait.
- **Propose, don't mutate (outside `00_ops/meta/`).** To change
  `active.md`, `inbox.md`, a project README, or a goals file, show the diff
  and ask.
- **Delegate, don't duplicate.** For wiki ops call out to `maintaining-wiki`
  (by name in your message — Cursor will route). For per-ticker analysis
  reference `financial-coach`. Do not inline those skills' work here.
- **Surface, don't flood.** Follow the notification policy in
  `references/operating-contract.md` — only speak up about blockers, waiting,
  status changes, decisions, opportunities, and suggested capabilities.
  Routine maintenance goes to the vault quietly.
- **Respect forbidden zones.** Never write to `docs/02_learning/` — that is
  owned by `maintaining-wiki`. Never write to `docs/00_ops/meta/dashboard.md`
  outside a `weekly` or `review` run.

## State writes

Only these files are writable by this skill:

| File | When written |
| --- | --- |
| `docs/00_ops/meta/state.md` | Every operation bumps its own `last_cos_{daily,weekly,monthly,quarterly}` and any cadence it just completed. |
| `docs/00_ops/meta/dashboard.md` | Regenerated on `weekly` and `review`. Rewrite fully — do not append. |
| `docs/00_ops/meta/cos-suggestions.md` | Appended to on `weekly` and `review` when a pattern meets the self-advocacy bar in `operating-contract.md`. Newest entry at top. |

All other changes are *proposals* the user must approve.

## Output shape

Every run produces, in this order:

1. **Header** — operation run, date, target (`<repo>`).
2. **Headlines** — 3–7 bullets, highest-signal items only. Follow notification
   policy.
3. **Details** — operation-specific (see reference files).
4. **Proposed changes** — list of files to edit with short diff summaries, or
   "no user-approvable changes". For each change, state its target repo
   explicitly: `[target: second-brain]` or `[target: ai-workx:<plugin>]`.
   This makes it obvious when a proposed change should leave the current
   repo as a GitHub issue rather than a local edit.
5. **Cross-repo proposals** (weekly and review only) — one `gh issue create`
   block per new `cos-suggestions.md` entry with `Target: ai-workx:*`. See
   `references/weekly.md` step 9.
6. **State write summary** — which `00_ops/meta/` files the skill updated
   (these are done without asking, per the writes table above).
7. **Proposed commit message** — in a fenced block. Suggest
   `cos(daily|weekly|review|suggest): <one-line summary>`.
8. **Next CoS cadence** — when the user should next run `cos daily` or `cos weekly`.

## Commit conventions

The second-brain repo uses `<area>(<op>): <summary>`. This skill's own commits
use the `cos(...)` area **in the second-brain repo only**:

- `cos(daily): snapshot YYYY-MM-DD` — if the user accepts the daily output
  (usually just a state.md bump).
- `cos(weekly): triage + dashboard refresh YYYY-MM-DD`
- `cos(review): Q{N} YYYY reflection`
- `cos(suggest): <short title>` — when the user accepts a new entry in
  `cos-suggestions.md` (including when promoting one: the commit bumps
  `Status:` to `promoted` and records the issue URL).

Commits in `ai-workx` follow that repo's own conventions; the `cos(...)`
prefix does not cross over. When the user accepts a cross-repo proposal,
three things happen in sequence:

1. User runs the `gh issue create` block. A GitHub issue lands in
   `ai-workx`.
2. User edits `docs/00_ops/meta/cos-suggestions.md` in `second-brain` to
   set `GitHub issue: <url>` and `Status: promoted`. Commit prefix:
   `cos(suggest): promote <short title> to ai-workx#NNN`.
3. Any source change in `ai-workx` that resolves the issue is authored
   separately in that repo under its normal commit conventions (no
   `cos(...)` prefix there).

Do not invoke `git commit` yourself. Just propose.

## Obsidian / plain-markdown compatibility

The target vault may be opened in Obsidian. Keep outputs:

- GFM checkboxes (`- [ ]`, `- [x]`).
- Plain relative markdown links (`[text](./relative/path.md)`).
- YAML frontmatter for structured files.
- No MDX, no JSX, no HTML beyond what GFM allows.

## What NOT to do

- Do not invent tasks. Every task you propose must be traceable to an
  existing driver doc, inbox item, journal entry, or cadence miss.
- Do not rewrite the user's principles, goals, or journal entries.
- Do not delegate a wiki op and then duplicate the work inline. Either trust
  `maintaining-wiki` or surface that it's unavailable and stop.
- Do not add new cadence targets without an entry in `cos-suggestions.md`
  proposing it first.
- Do not speak in the first-plural ("we", "our"). Speak to the user directly.
- Do not propose a capability fix without stating which plugin owns it. If
  no existing plugin fits, name it as `ai-workx:new-plugin:<slug>` in the
  `Target:` field so the user sees the scope of the ask. See
  `references/operating-contract.md` for the target-repo rubric.
- Do not run `gh` (or any other tool that mutates a remote repo) yourself.
  Cross-repo proposals are drafted as `gh issue create` blocks the user
  runs explicitly.
- Do not edit files in `ai-workx` from within a `cos ...` run targeting a
  `second-brain` vault. The only cross-repo channel is a drafted issue.

## On failure

If the repo is missing required structure, stop and surface:

```
Chief of staff precondition failed: <what>.
Proposed fix: <one-line>.
See docs/00_ops/README.md in your second-brain repo for the expected layout.
```

Do not attempt to improvise by writing to arbitrary paths.

## References

| File | Purpose |
| --- | --- |
| `references/daily.md` | 2-minute daily snapshot: focus, overdue, tasks due today/tomorrow, git dirty, journal present, inbox count. |
| `references/weekly.md` | 15-minute weekly: inbox triage, tasks sweep, project drift, wiki lint check, dashboard regeneration, state.md bump. |
| `references/review.md` | 45-minute monthly/quarterly: goals vs. actuals, wiki status report, project phase check, ideas prune, principles revisit. |
| `references/operating-contract.md` | Notification policy and self-advocacy rules. Read before appending to `cos-suggestions.md`. |

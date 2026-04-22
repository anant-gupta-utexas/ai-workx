# chief-of-staff

Repo-native chief-of-staff for a markdown-first second-brain. On-demand. Three
operations: `cos daily`, `cos weekly`, `cos review`. No connectors, no cron, no
background heartbeat.

## Installation

```bash
/plugin install chief-of-staff@ai-workx
```

## What it does

The skill is a thin orchestrator that:

- Reads `docs/00_ops/inbox/`, `docs/00_ops/tasks/`, `docs/05_personal/journal/`,
  and each `docs/03_projects/<project>/README.md`.
- Tracks cadence dates in `docs/00_ops/meta/state.md` (last weekly review, last
  wiki lint, etc.).
- Regenerates a rolled-up snapshot in `docs/00_ops/meta/dashboard.md` on
  `cos weekly`. This file is generated — humans do not hand-edit it.
- Appends pattern observations to `docs/00_ops/meta/cos-suggestions.md` when it
  notices the user keeps doing something manually that could be automated or
  restructured.
- Delegates wiki work (ingest, query, lint, status, reduce, reflect, reweave)
  to the `maintaining-wiki` skill shipped in `essentials@ai-workx`.

The skill never commits on its own. It proposes edits, runs `git status` and a
proposed commit message, and waits for user confirmation.

## Operations

| Operation | Time | What it does |
| --- | --- | --- |
| `cos daily` | ~2 min | Snapshot: tasks due today/tomorrow, journal present?, uncommitted changes, inbox count, cadence overdue flags. Read-only except bumping `last_cos_daily` in `state.md`. |
| `cos weekly` | ~15 min | Triage inbox, sweep `active.md` (bump `last_reviewed`), check wiki lint due, check project drift, regenerate `dashboard.md`, log to `state.md`. |
| `cos review` | ~45 min | Monthly/quarterly: goals vs. tasks-completed, wiki status, project phase check, `ideas.md` prune, principles revisit. |

## Trigger phrases

The skill auto-activates when the user says:

- "cos daily", "cos weekly", "cos review"
- "chief of staff", "run chief of staff"
- "daily review", "weekly review", "monthly review", "quarterly review"
- "what should I work on", "what's on my plate", "what's overdue"
- "status of my build", "status of projects"
- "triage my inbox" (combined with CoS weekly)
- "what's my cadence", "what cadences are overdue"

## Contents

### Skills

- **chief-of-staff** — orchestrator with four reference files:
  - `references/daily.md` — daily snapshot step-by-step
  - `references/weekly.md` — weekly triage and dashboard regeneration
  - `references/review.md` — monthly / quarterly reflection
  - `references/operating-contract.md` — notification policy and self-advocacy rules

## Requires

Target repo must have the following structure (this is the `second-brain`
schema; see [`second-brain/AGENTS.md`](https://github.com/anant-gupt-utexas/second-brain/blob/main/AGENTS.md) if extracting the schema):

```
<repo>/
├── AGENTS.md
├── CLAUDE.md
└── docs/
    ├── 00_ops/
    │   ├── inbox/inbox.md
    │   ├── tasks/{active,someday,done}.md
    │   └── meta/{state,dashboard,cos-suggestions}.md
    ├── 02_learning/           # owned by maintaining-wiki
    ├── 03_projects/           # per-project README.md with status frontmatter
    └── 05_personal/journal/
```

If `docs/00_ops/meta/` is missing, the skill's first run will offer to scaffold
it rather than refusing. If the target repo has no `maintaining-wiki` install,
the skill skips wiki delegation gracefully.

## Design principles

- **Thin orchestrator, no absorption.** Delegates wiki ops to
  `essentials@ai-workx::maintaining-wiki`, ticker analysis to
  `financial-coach@ai-workx`. Each plugin stays sharp.
- **Read-mostly.** Only writes to `docs/00_ops/meta/`. Everything else is a
  proposal the user approves.
- **On-demand.** No triggers, no cron, no background.
- **Plain markdown only.** Output is markdown the user can grep, edit in
  Obsidian, or render in Cursor.
- **Never commits.** Always ends with a proposed commit message and stops.

## Configuration

The skill assumes `docs/00_ops/` structure. Override paths by editing
`state.md` — the skill reads `config:` block from its frontmatter if present:

```yaml
---
title: Chief-of-staff state
config:
  tasks_path: docs/00_ops/tasks
  inbox_path: docs/00_ops/inbox
  meta_path: docs/00_ops/meta
  journal_path: docs/05_personal/journal
  projects_path: docs/03_projects
---
```

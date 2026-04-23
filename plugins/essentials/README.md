# Essentials Plugin

Skill development tools, wiki maintenance, chief-of-staff second-brain orchestrator, project scaffolding, and web research agent for enhanced development workflow.

## What's Included

### Skills (6)
- **skill-developer** - Meta-skill for creating and managing Claude Code skills
- **maintaining-wiki** - Ingest, query, lint, reduce, reflect, reweave, and manage a personal knowledge base / second-brain wiki under `docs/02_learning/`
- **deep-research** - Structured multi-round investigation pipeline producing source-grounded research briefs with planning, parallel execution, verification, and citation anchoring
- **chief-of-staff** - Repo-native second-brain orchestrator with on-demand `cos daily`, `cos weekly`, `cos review`, and `cos update` operations. Reads inbox, tasks, journal, projects; writes only to `docs/00_ops/meta/`; delegates wiki work to `maintaining-wiki`
- **scaffold-project** - Bootstrap a new repo from one of the maintained templates (python, go, react). Drafts `gh repo create --template` commands; never executes remote mutations itself
- **ideation-loop** - Five-phase pattern for moving from fuzzy intent to locked decisions: reframe, canonical plan, decision sheet, topic split, archive. The load-bearing primitive is a decision-sheet entry format with end-to-end rendered candidates, a single recommendation (no menus), and cost-of-being-wrong calibration. Includes a stop rule that fires when planning cycles outrun shipping.

> **Note:** The consult-experts skill (Product Manager, Tech Lead, System Design, Code Reviewer) has moved to the DEV-ESSENTIALS plugin.

### Agents (1)
- **web-research-specialist** - Research technical issues and solutions online

## Installation

```bash
# From your project directory
/plugin install essentials@ai-workx
```

## Usage Examples

### Using Skills

**Skill Development:**
```bash
"Help me create a new skill for code review"
"How do I write a good skill description?"
```

**Deep Research:**
```bash
"Deep research on transformer scaling laws"
"Investigate thoroughly: Redis vs Memcached for session caching"
"Create a source-grounded research brief on LLM alignment approaches"
```

**Wiki Maintenance:**
```bash
"Ingest this article into my wiki"
"What does my wiki say about transformers?"
"Lint my wiki for contradictions"
"Wiki status report"
"Reduce this page into atomic claims"
"Find connections in my wiki"
"Reweave my wiki — update old pages with new context"
```

**Chief-of-Staff Operations:**
```bash
cos daily                              # 2-min snapshot of today
cos weekly                             # 15-min triage + dashboard refresh
cos review                             # 45-min monthly / quarterly reflection
cos update                             # log completed tasks, notes, status changes
"what's on my plate today?"            # → daily
"triage my inbox" / "sweep my tasks"   # → weekly
"log what I did today: finished X"     # → update
```

**Scaffold a New Project:**
```bash
"scaffold a new python project called foo-service"
"start a new go repo for order-worker"
"bootstrap a react project from template"
```

**Ideation Loop:**
```bash
"help me plan my next build"
"decide between A and B"
"force convergence on my open decisions"
"scope this out — I have N open questions"
"what should I build first"
```

### Using Agents Directly

**Research:**
```bash
"Use the web-research-specialist agent to find best practices for file uploads"
```

## Component Details

### Skills

#### Skill Developer

**Meta-skill for creating skills**

**Topics:** Skill creation, SKILL.md structure, frontmatter, progressive disclosure, description optimization, writing best practices, testing

**Activation keywords:** `create skill`, `skill development`, `SKILL.md`, `skill description`, `progressive disclosure`

#### Maintaining Wiki

**Personal knowledge base / second-brain management under `docs/02_learning/`**

**Operations:** ingest (absorb articles/papers into wiki pages), query (answer questions from notes with citations), lint (audit for contradictions, orphans, broken citations), status (counts and health report), reduce (extract atomic claims from broad pages), reflect (discover cross-connections between pages), reweave (propagate new knowledge backward to older pages)

**Architecture:** Three-layer `raw/` → `wiki/` → `outputs/` with Obsidian-compatible frontmatter, `[[wiki-links]]`, and `[Source:]` citations. Knowledge pipeline (reduce → reflect → reweave) for growing and maintaining the graph.

**Activation keywords:** `ingest into my wiki`, `add to knowledge base`, `absorb this paper`, `what does my wiki say`, `query my notes`, `wiki lint`, `check my wiki for contradictions`, `wiki status`, `add to second brain`, `reduce this page`, `extract atomic claims`, `find connections`, `reflect on my wiki`, `reweave`, `update old pages`, `backward pass`

#### Deep Research

**Structured multi-round investigation pipeline for source-grounded research briefs**

**Pipeline:** Plan (task ledger, slug derivation) -> Scale Decision (complexity-based parallelism) -> Execute (parallel web/paper/repo searches) -> Synthesize (merge findings, flag contradictions) -> Verify (citation anchoring, URL validation, strength sweep) -> Deliver (final brief with inline citations)

**Resources:** 4 guides covering planning protocol, scale decision matrix, source verification, and artifact conventions

**Activation keywords:** `deep research`, `investigate thoroughly`, `multi-source investigation`, `research brief`, `source-grounded research`, `comprehensive research on`

#### Chief-of-Staff

**Repo-native orchestrator for a markdown-first second-brain vault**

**Operations:**

| Operation | Time | What it does |
| --- | --- | --- |
| `cos daily` | ~2 min | Snapshot: tasks due today/tomorrow, journal present?, uncommitted changes, inbox count, cadence overdue flags. Read-only except bumping `last_cos_daily`. |
| `cos weekly` | ~15 min | Triage inbox, sweep `active.md`, check wiki lint due, check project drift, regenerate `dashboard.md`, log to `state.md`. |
| `cos review` | ~45 min | Monthly/quarterly: goals vs. tasks-completed, wiki status, project phase check, `ideas.md` prune, principles revisit. |
| `cos update` | ~3–5 min | Log completed tasks, notes, or status changes. Proposes edits to `active.md`/`done.md`/project READMEs/journal; waits for approval; bumps `last_cos_update`. |

**Activation keywords:** `cos daily`, `cos weekly`, `cos review`, `cos update`, `chief of staff`, `daily review`, `weekly review`, `monthly review`, `what should I work on`, `what's on my plate`, `what's overdue`, `triage my inbox`, `log what I did`, `record task completion`, `update my docs`

**Required vault structure:**
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

If `docs/00_ops/meta/` is missing, the skill's first run offers to scaffold it rather than refusing. If `maintaining-wiki` is not installed, wiki delegation is skipped gracefully.

**Cross-repo routing:** Every entry the skill writes to `docs/00_ops/meta/cos-suggestions.md` carries a `Target:` field (`second-brain`, `ai-workx:<plugin>`, or `ai-workx:new-plugin:<slug>`). When the target is `ai-workx:*`, the weekly output includes a ready-to-run `gh issue create` block. The skill drafts; the user runs. No auto-creation, no background sync.

#### Scaffold Project

**Bootstrap a new repo from a maintained language template**

**Template registry:**

| Language | Template repo |
| --- | --- |
| `python` | `anant-gupta-utexas/python-scaffolding` |
| `go` | `anant-gupta-utexas/go-scaffolding` |
| `react` | `anant-gupta-utexas/react-scaffolding` |

**Activation keywords:** `scaffold a new project`, `start a new python/go/react repo`, `bootstrap from template`, `spin up a repo for <name>`, `new project from template`, `initialize a <lang> project`

The skill drafts a `gh repo create --template <registry-entry> --clone` command for the chosen language. The user runs it; the skill never mutates remote state itself. A web-UI fallback (`/generate` URL) is provided when `gh` is unavailable.

#### Ideation Loop

**Five-phase pattern for moving from fuzzy intent to locked decisions in under 72 hours**

**Phases:**

| Phase | Artifact | Purpose |
| --- | --- | --- |
| 1. Reframe | `prioritization.md` | Collapse N workstreams into the smallest true set |
| 2. Canonical plan | `{project}-plan.md` | One doc owns phase schedule + gating |
| 3. Decision sheet | `decisions-week{N}.md` | Force convergence with end-to-end rendered candidates |
| 4. Topic split | Per-topic owner docs | Once plan is locked, each major topic gets its own doc |
| 5. Archive + memory | `archive/README.md` | Audit trail of superseded docs and what shifted |

**Load-bearing primitive:** The decision-sheet entry renders candidates end-to-end (repo path, README line 1, imports, public hook) rather than as abstract option lists. One recommendation leads — no balanced menus. Cost-of-being-wrong calibration gates time spent (low / medium / high).

**Stop rule:** Surfaces drift when planning cycles outrun shipping. No third decision sheet before the first build-phase commit.

**Activation keywords:** `help me plan`, `decide between`, `force convergence`, `scope this out`, `too many open decisions`, `what should I build first`, `help me plan X`, `choose between A and B`

**References:**
- `references/decision-sheet-template.md` — blank fillable template
- `references/phase-checklist.md` — per-phase checklist for what artifact to produce next

### Agents

#### Web Research Specialist
Technical solutions research, best practices, GitHub issues, library comparisons.

## Perfect For

- Technical research and best practices discovery
- Creating custom skills
- Learning skill development patterns
- Managing a personal knowledge base / second-brain wiki
- Growing and maintaining a knowledge graph with reduce/reflect/reweave pipeline
- Deep, multi-source investigations with formal cited deliverables
- Running a private, markdown-first second-brain (Obsidian-compatible) with on-demand daily / weekly / review / update cadences
- Bootstrapping new repos from maintained language templates (python, go, react)

## Not Designed For

- Code execution or compilation
- Deployment automation
- Infrastructure management
- Database administration

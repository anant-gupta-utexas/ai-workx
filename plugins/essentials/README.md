# Essentials Plugin

Skill development tools, wiki maintenance, chief-of-staff second-brain orchestrator, project scaffolding, brainstorming, pressure-testing, expert consultation (PRD → TRD → TRS), backend task specs with self-updating task docs, working-style capture into a personal `-mode` skill, and planning, documentation, refactoring, and research agents.

## What's Included

### Skills (10)
- **skill-developer** - Meta-skill for creating and managing Claude Code skills
- **maintaining-wiki** - Ingest, query, lint, reduce, reflect, reweave, and manage a personal knowledge base / second-brain wiki under `docs/02_learning/`. Ingest extracts open problems (top-3 by buildability) from each source to `docs/00_ops/inbox/inbox.md` for downstream triage; lint writes cadence + cleanliness score back to `docs/00_ops/meta/state.md`.
- **deep-research** - Structured multi-round investigation pipeline producing source-grounded research briefs with planning, parallel execution, verification, and citation anchoring
- **chief-of-staff** - Repo-native second-brain orchestrator with on-demand `cos daily`, `cos weekly`, `cos review`, and `cos update` operations. Reads inbox, tasks, journal, projects; writes only to `docs/00_ops/meta/`; delegates wiki work to `maintaining-wiki`
- **scaffold-project** - Generate a new Python project from the `python-scaffolding` Copier template in one of three flavors (`library_cli`, `service`, `datascience`). Runs a non-interactive `uvx copier copy` the user approves, then offers the quality gate, first commit, planning-doc copy, GitHub repo creation, and hub registration as separate confirmed steps
- **brainstorm** - Structured brainstorming that diagnoses whether you're stuck, sprawling, or torn, then runs the right mode: Diverge (one of 5 thinking personas — Contrarian, Hacker, Simplifier, Researcher, Architect), Reframe (collapse many workstreams into the smallest true set), or Converge (candidates rendered as concrete artifacts, one recommendation, cost-of-being-wrong calibration). Includes a stop rule when brainstorming outruns action.
- **pressure-test** - Adversarial pressure-test for a claim, decision, or research conclusion. Forces evidence-tier classification, walks a five-mode failure scan (tier mismatch, selection bias, eval-aware target, domain drift, verification/termination failure), demands a falsifier in `Because-X-then-not-Y` shape, and resolves to a verdict carrying the evidence tier. Invoked at `brainstorm` convergence for medium-high-stakes entries and at `deep-research` Verify for load-bearing conclusions.
- **consult-experts** - Routes requests to expert personas — Product Manager (PRDs with release plans and deferred features), Tech Lead (TRDs with development phases mapped to PRD releases), System Design Specialist (SDDs), and Code Reviewer — under a shared Release / Phase / Task nomenclature.
- **dev-docs** - Details one TRD phase into a per-phase Task Specification (TRS) with a flat task list under `dev/active/[feature]-phase-N/`, then keeps those docs current: the generated tasks file carries an update protocol so any agent ticks tasks and updates context after each completed task, plus a full handoff update before compaction or session end. Replaces the `/dev-docs-be` and `/dev-docs-update` commands.
- **automate-tasks** - Captures a user's working style into a personal `<handle>-mode` skill that agents follow. Mines recent agent transcripts for the current workspace with parallel subagents, asks a few structured questions, clusters the signals (response style, autonomy, subagents, verification, process), then authors or updates the mode skill via `skill-developer`. The mode skill is explicit-invocation-only by default.

> **Note:** In v3.0.0, `ideation-loop` (essentials) and `lateral-thinking` (DEV-ESSENTIALS) were merged into `brainstorm`. In v3.1.0, essentials absorbed DEV-ESSENTIALS' `consult-experts` skill, its 3 agents, and `/dev-docs-be` + `/dev-docs-update` (now the `dev-docs` skill). DEV-ESSENTIALS is superseded — installing both duplicates `consult-experts` and the agents. Install it only if you want its hooks, `/code-review`, `/verify`, or `git-workflow`. In v4.0.0, `scaffold-project` moved from drafting `gh repo create --template` commands for python/go/react to running the Python-only `python-scaffolding` Copier template; Go and React templates are no longer covered.

### Agents (5)
- **business-strategist** - Create in-depth operational business plans from product ideas via interactive inquiry, synthesis, and formal plan generation with cited frameworks and visualization suggestions
- **documentation-architect** - Create comprehensive, developer-focused documentation with context gathering from code and existing docs, plus Maps of Content (MOC) navigation
- **plan-reviewer** - Review development plans before implementation; saves reviews to `dev/active/[task-name]/[task-name]-plan-review.md`
- **refactor-planner** - Create comprehensive refactoring strategies with brownfield-aware convention detection
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
"scaffold a new python service called order-worker"   # → service flavor
"new CLI tool called tidy-logs"                        # → library_cli flavor
"start a data science project for churn analysis"      # → datascience flavor
```

**Brainstorm:**
```bash
"I'm stuck on this caching problem, nothing I try works"   # → Diverge
"I keep going in circles on this auth flow"                # → Diverge
"I have six workstreams and don't know where to start"     # → Reframe
"decide between A and B"                                   # → Converge
"try the contrarian angle"                                 # → named persona
```

**Pressure Test:**
```bash
"pressure-test this decision before I lock it"
"grill this claim"
"stress-test this conclusion"
"what would prove this wrong"
"find the falsifier for this hypothesis"
```

**Consult Experts:**
```bash
"Consult product expert to write the PRD for AI Search"
"Get tech lead advice and a TRD for this PRD"
"Consult system design expert for my distributed system"
"I need a code review from the expert reviewer"
```

**Task Specs (dev-docs):**
```bash
/dev-docs search-feature Phase 1      # Create: TRS + task files for one TRD phase
"break down Phase 2 of the TRD into tasks"
"update dev docs before we compact"      # Update: full handoff
```

**Automate Tasks (working-style capture):**
```bash
"automate me"                            # → new <handle>-mode skill
"capture my working style into a skill"
"update my -mode skill"                  # → mines only history since last edit
```

### Using Agents Directly

**Business Strategy:**
```bash
"Use the business-strategist agent to help me plan my MVP features"
"Use the business-strategist agent to create a business plan for my app idea"
```

**Research:**
```bash
"Use the web-research-specialist agent to find best practices for file uploads"
```

**Documentation, Plan Review, Refactoring:**
```bash
"Use the documentation-architect agent to document my new billing service"
"Use the plan-reviewer agent to review my authentication implementation plan"
"Use the refactor-planner agent to plan breaking down this large service"
```

## Component Details

### Skills

#### Skill Developer

**Meta-skill for creating skills**

**Topics:** Skill creation, SKILL.md structure, frontmatter, progressive disclosure, description optimization, writing best practices, testing

**Activation keywords:** `create skill`, `skill development`, `SKILL.md`, `skill description`, `progressive disclosure`

#### Maintaining Wiki

**Personal knowledge base / second-brain management under `docs/02_learning/`**

**Operations:** ingest (absorb articles/papers into wiki pages; extracts top-3 open problems per source to `docs/00_ops/inbox/inbox.md` for downstream triage), query (answer questions from notes with citations), lint (audit for contradictions, orphans, broken citations; writes `last_wiki_lint` and `last_wiki_lint_score` back to `docs/00_ops/meta/state.md`), status (counts and health report), reduce (extract atomic claims from broad pages), reflect (discover cross-connections between pages), reweave (propagate new knowledge backward to older pages)

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

**Generate a new Python project from the [`python-scaffolding`](https://github.com/anant-gupta-utexas/python-scaffolding) Copier template**

**Flavors:**

| Flavor | What you get |
| --- | --- |
| `library_cli` | `argparse` entry point (`cli.py`, `python -m`, `[project.scripts]`) |
| `service` | FastAPI + Clean Architecture, `pydantic-settings`, Dockerfile, compose, `.env.example` |
| `datascience` | `ingest`/`features`/`models`, gitignored `data/`, `notebooks/` with `nbstripout` |

Every flavor ships `uv` with a `src/` layout, the `scripts/check.sh` quality gate (ruff, `mypy --strict`, size limits, secret scan, pytest with a coverage floor), a GitHub Actions workflow that runs the gate, `AGENTS.md` + `STATUS.md`, the `docs/00_research … 04_testing` tree, and `dev/` planning templates.

**Activation keywords:** `scaffold a new project`, `start a new python repo`, `bootstrap a python service`, `new FastAPI service`, `new data science project`, `new CLI tool`, `spin up a repo for <name>`, `new project from template`

The skill asks for any missing answers (flavor, name, description) and runs a non-interactive `uvx copier copy --trust --defaults --data …` command, which the user approves when prompted. Copier creates a local directory and runs `git init` + `uv sync`; it never commits or creates a remote. After generation, the skill offers, each as a separate approved step:

1. **Run the quality gate and make the first commit** (only on explicit confirmation).
2. **Copy existing planning docs** (PRD, research notes, system design, TRD) onto the generated `docs/` stubs, keeping filenames and adding rows to `docs/README.md`. A sanitization scan with per-line confirmation is offered for repos that will go public.
3. **Create a GitHub repo** with `gh repo create --source . --push` after confirming owner and visibility.
4. **Register the repo in a project hub**, proposing a row in the hub's `CLAUDE.md` repos table and reducing the hub's project folder to a status pointer.
5. **Pull template improvements later** with `uvx copier update --trust`.

Python-only: requests for Go, React, Rust, and other ecosystems are surfaced as out of scope rather than scaffolded.

#### Brainstorm

**Diagnose the state, then diverge or converge — always ending in a concrete next action**

| State | Signals | Mode |
| --- | --- | --- |
| Stuck | No workable option; same approach repeated; fixes undo each other | Diverge — apply one thinking persona |
| Sprawling | Many ideas or workstreams, no order | Reframe — one collapsing move into the smallest true set |
| Torn | Several viable options, no decision | Converge — decision entries with concrete candidates |

**Diverge personas:**

| Persona | Core Question | Best For |
| --- | --- | --- |
| Contrarian | "What if the opposite were true?" | Spinning, assumption lock-in |
| Hacker | "What constraints are actually real?" | Creative workarounds, prototype-first (default) |
| Simplifier | "What's the simplest thing that could work?" | Complexity traps, diminishing returns |
| Researcher | "What evidence actually exists?" | Unknown root cause, opinion-driven debates |
| Architect | "Starting over from scratch, would it be built this way?" | Oscillation, wrong decomposition |

**Converge entry:** each candidate is rendered as a concrete artifact (concrete form, first impression, day-to-day use, one-sentence pitch), followed by one recommendation with at most one conditional alternative and a low / medium / high cost-of-being-wrong rating. High-cost entries hand off to `pressure-test`.

**Stop rule:** a third brainstorming round on the same problem with nothing acted on surfaces the tradeoff once.

**Activation keywords:** `stuck`, `blocked`, `going in circles`, `different perspective`, `brainstorm`, `help me think through`, `decide between`, `too many options`, `what should I do first`, `scope this out`

**References:**
- `references/personas/` — one methodology file per persona
- `references/decision-sheet-template.md` — fillable sheet for several decisions in one sitting

#### Pressure Test

**Adversarial pressure-test for a claim, decision, or research conclusion**

**Output contract** (fixed 5-section):

1. **Claim under test** — restated in precise, measurable terms
2. **Evidence tier** — Tier 1-5 (meta-analysis → A/B → uncontrolled → observational → anecdote/HiPPO)
3. **Failure-mode scan** — five modes, one paragraph each:
   - Tier-5-dressed-as-Tier-2 (confidence/evidence mismatch)
   - Selection bias blind spots (option set itself is biased)
   - Eval-aware target (claim behaves differently when probed than when used)
   - Domain drift (general pattern applied to specialist context without re-grounding)
   - Verification/termination failure (ceremonial verification — probe existed but didn't probe)
4. **Falsifier** — `Because-X-then-not-Y` shape. If none exists, claim is unfalsifiable
5. **Cost-recalibration + Verdict** — `holds | weakened | weakened-but-not-rejected | rejected | needs-evidence | unfalsifiable`, plus one concrete next-step. Verdict carries the evidence tier explicitly.

**Gate:** Only invoke on items with cost-of-being-wrong ≥ medium (the 10× rule — would a 10× wrong call here produce 10× downside?). Skip for low-stakes decisions; over-invocation costs more than it saves.

**Anti-tooling-the-muscle clause:** Requires the user to attempt a failure-mode scan first (one sentence per mode is enough) before invoking. Running the rubric cold short-circuits the formation of the user's own pattern-matching.

**Composition:**
- `brainstorm` invokes at convergence on decision entries with cost-of-being-wrong ≥ medium
- `deep-research` invokes at Verify on load-bearing conclusions
- Direct invocation works for ad-hoc claims and hypotheses

**Activation keywords:** `pressure-test`, `grill this`, `stress-test this decision`, `what could go wrong`, `challenge this claim`, `find the falsifier`, `what would prove this wrong`, `red-team this`

**References:**
- `references/failure-modes.md` — five-mode rubric expanded with worked examples, edge cases, and multi-mode firing patterns

#### Consult Experts

**Dispatcher for 4 expert personas:**
- **Product Manager** - PRDs at `/docs/01_product/PRD.md` with semver release plans (`v0.1.0` = MVP) and a Deferred Features section
- **Tech Lead** - TRDs at `/docs/02_architecture/TRD.md` with Development Phases, each tagged to the PRD release(s) it delivers
- **System Design Specialist** - System Design Documents at `/docs/02_architecture/SYSTEM_DESIGN.md`
- **Code Reviewer** - Reviews saved to `dev/active/[task-name]/[task-name]-code-review.md`; waits for approval before implementing fixes

**Shared nomenclature:** Release (PRD-owned) → Phase (TRD-owned) → Task (owned by `dev-docs`).

**Expected `docs/` layout:**
```
docs/
├── 00_research/       # Market, user, and technical research
├── 01_product/        # PRD.md, UI/UX design specification
├── 02_architecture/   # TRD.md, SYSTEM_DESIGN.md, refactor plans
├── 03_guides/         # Developer guides
└── 04_testing/        # Testing strategy
```

**Activation keywords:** `consult product`, `consult tech`, `expert advice`, `write a PRD`, `create a TRD`, `system design`, `code review expert`

#### Dev Docs

**Per-phase TRS with self-updating task docs**

**Create:** reads the PRD and TRD, picks exactly one TRD phase, and writes a TRS (component design, API specs, database design, error handling, security, testing, performance, and a flat task list). Generates in `dev/active/[feature]-phase-N/`:
- `[task-name]-plan.md` - the TRS
- `[task-name]-tasks.md` - checklist with an **update protocol header** that any agent working from the list follows
- `[task-name]-context.md` - current state, decisions, files changed, deviations, blockers, next step

**Update:**
- *After each completed task* — tick it, update the progress line and context file, record deviations from the plan
- *Before compaction, handoff, or session end* — full update, plus handoff notes in `dev/README.md` and an entry in `dev/session-log.md`

**Size limit:** every markdown file stays at 800 lines or fewer. Oversized plans split heavy sections into `[task-name]-plan-<section>.md` companions; the session log condenses old entries.

**Activation keywords:** `/dev-docs`, `create a TRS`, `break down Phase N`, `plan the tasks for this phase`, `update dev docs`, `save progress`, `handoff notes`

#### Automate Tasks

**Turn a user's working conventions into one `<handle>-mode` skill**

**Flow:**
0. **Check for an existing mode skill** under `.claude/skills/` or `~/.claude/skills/`. If found, run in update mode: mine only history since the last edit, ask what changed, and edit in place.
1. **Mine history.** Parallel subagents read slices of the current workspace's transcripts only, never other projects. A signal must show up in 2+ slices to count.
2. **Ask directly.** One or two multi-select questions, then one free-form question.
3. **Cluster** into only the sections that apply: response style, autonomy, understand-first, subagents, prose/code discipline, review and verify, process, skills.
4. **Draft** with `skill-developer` at `.claude/skills/<handle>-mode/SKILL.md` (or `~/.claude/skills/` for a personal skill), with `disable-model-invocation: true` by default.
5. **Iterate** on the prose with the user: explain the why, keep it lean, generalize.
6. **Land it.** Personal skills are just saved; project skills follow the repo's git conventions.

**Guardrails:** don't overfit to one conversation, reference other skills rather than inlining them, keep sections minimal, and never copy secrets, credentials, internal URLs, or other people's names out of transcripts.

**When not to use:** task-specific skills or one narrow workflow. Use `skill-developer` directly for those.

**Activation keywords:** `automate me`, `automate my tasks`, `capture my working style`, `turn my preferences into a skill`, `create my -mode skill`, `update my -mode skill`

### Agents

#### Business Strategist
In-depth operational business planning from product ideas. Runs an interactive process — first gathering market, financial, and risk inputs, then generating a formal structured plan with cited frameworks (e.g., TELOS, P&L) and embedded data visualization suggestions. Output covers executive summary, market analysis, business case, feasibility study, constraints, and open questions.

#### Web Research Specialist
Technical solutions research, best practices, GitHub issues, library comparisons.

#### Documentation Architect
Comprehensive developer-focused documentation with context gathering, API docs, README files, data flow diagrams, and Maps of Content (MOC) navigation. Generates Hub, Domain, and Topic MOCs that explain *why* documents relate and suggest reading order for new developers.

#### Plan Reviewer
Architecture review, implementation plan analysis, risk assessment, best practices validation.

#### Refactor Planner
Refactoring strategies, tech debt analysis, SOLID violations detection, safe code restructuring. Includes brownfield-aware convention detection — scans for existing project conventions, config files, and established abstractions before recommending changes.

## Perfect For

- Product planning and business strategy from raw idea to formal plan
- Technical research and best practices discovery
- Creating custom skills
- Learning skill development patterns
- Managing a personal knowledge base / second-brain wiki
- Growing and maintaining a knowledge graph with reduce/reflect/reweave pipeline
- Deep, multi-source investigations with formal cited deliverables
- Running a private, markdown-first second-brain (Obsidian-compatible) with on-demand daily / weekly / review / update cadences
- Generating new Python projects (library/CLI, FastAPI service, data science) from a maintained Copier template
- Getting unstuck and converging on decisions with structured brainstorming
- Expert consultation from PRD to TRD to per-phase task specs, with task docs that stay current during implementation
- Development plan review, refactoring plans, and developer documentation
- Pressure-testing claims, decisions, and research conclusions with explicit evidence-tier classification and a named falsifier
- Capturing a user's working style into a personal mode skill so agents work the way they do

## Not Designed For

- Code execution or compilation
- Deployment automation
- Infrastructure management
- Database administration

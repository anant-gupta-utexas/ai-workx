# AI WorkX Marketplace

Production-tested Claude Code plugins for development workflows, research, learning, financial analysis, and data analysis: skills, agents, commands, and hooks for planning, documentation, verification, and second-brain operations.

## 🎯 Available Plugins

### Core Plugins (Recommended)

#### [essentials](./plugins/essentials/)
Skill development tools, wiki maintenance with knowledge pipeline (reduce, reflect, reweave), deep-research investigation pipeline, chief-of-staff second-brain orchestrator, project scaffolding, brainstorming, pressure-testing, expert consultation, backend task specs with self-updating task docs, working-style capture into a personal mode skill, live app verification skills, and planning, documentation, refactoring, and research agents.

**Includes:**
- 12 Skills (skill-developer, maintaining-wiki with 7 operations: ingest, query, lint, status, reduce, reflect, reweave, deep-research with plan-execute-verify pipeline, chief-of-staff with 4 operations: daily, weekly, review, update, scaffold-project for generating Python projects from a Copier template in 3 flavors (library_cli, service, datascience), brainstorm for getting unstuck and converging on decisions, pressure-test for adversarial review of claims and decisions, consult-experts for PRD/TRD/SDD/code-review personas, dev-docs for per-phase task specs that stay updated during implementation, automate-tasks for capturing a user's working style into a personal `<handle>-mode` skill, create-verification-skill and maintain-verification-skill for generating and auditing a project-local skill that drives the real app and captures evidence)
- 5 Agents (business-strategist, documentation-architect with MOC generation, plan-reviewer, refactor-planner, web-research-specialist)

**Perfect for:** Business strategy and product planning, brainstorming and decision-making, expert consultation from PRD to task list, plan review, refactoring, technical research, deep multi-source investigations, creating custom skills, managing and growing a personal knowledge graph, running a markdown-first second-brain vault with on-demand cadences, bootstrapping new Python projects from a Copier template, proving app behavior end to end with a project-local verification skill, teaching agents a personal working style

#### [visual-skills](./plugins/visual-skills/)
Source-backed Mermaid diagrams with clean SVG by default and separately installed, optional hand-drawn PNG for flat states. Independent of essentials.

**Includes:**
- 1 Skill (`diagram`), a pele-only clean renderer, optional art backend, project style policy and a clean-only dependency isolation release test.

**Perfect for:** Architecture flowcharts, actor sequences, ER relationships and state diagrams with editable Mermaid sources.

#### [learning-coach](./plugins/learning-coach/)
Personal learning and system design coach grounded in cognitive science, with comprehensive coverage of general learning methods and system design for SWE & MLE interviews.

**Includes:**
- 2 Skills:
  - learning_methods — Three science-backed learning modes: personalized learning plans (3-phase diagnostic assessment), Feynman Technique (analogy, simplification, teach-back), and Socratic tutoring (guided discovery, no direct answers)
  - technical_coach — 3 integrated modes: general learning, SWE system design (20 LLD + 15 HLD problems), ML system design (10 MLE interview problems with 9-step framework)

**Perfect for:**
- Learning new topics and complex concepts with structured methods
- SWE system design interviews (LLD & HLD)
- MLE system design interviews (recommendations, visual search, content moderation)
- Interview preparation with Socratic coaching

#### [financial-coach](./plugins/financial-coach/)
Personal financial coach with comprehensive company valuation analysis and YouTube video analysis for investment research and financial education.

**Includes:**
- 2 Skills (company-valuation, yt-financial-summary)

**Perfect for:**
- Evaluating whether a company is a good investment
- Comprehensive stock analysis with moat assessment and valuation metrics
- Analyzing financial YouTube videos with structured summaries
- Investment research from video content
- Learning personal finance and valuation concepts

#### [autoresearch](./plugins/autoresearch/)
Autonomous ML research plugin covering the full spectrum from single-agent experiment loops to the AI Scientist's multi-phase research pipeline with parallel GPU scaling and queue-based orchestration with fresh context per phase.

**Includes:**
- 1 Skill (ml-research-guidelines with 12 resource guides)
- 4 Agents (research-orchestrator, ml-researcher, experiment-reviewer, paper-writer)
- 7 Commands (experiment, sweep, research-report, research-pipeline, tree-search, review-paper, orchestrate)
- 3 Hooks (experiment-budget-guard, result-regression-check, sky-auto-auth)

**Perfect for:**
- Autonomous ML experimentation (Karpathy's autoresearch pattern)
- Parallel hyperparameter sweeps across GPU clusters (SkyPilot)
- Full research pipeline: ideation, experimentation, manuscript, peer review (AI Scientist)
- Tree-based experiment exploration with 4-stage progress management
- Long-running pipelines with fresh-context orchestration to prevent attention degradation

#### [data-analyst](./plugins/data-analyst/)
Data analysis lifecycle skills covering question framing, metric design, feasibility assessment, data quality profiling, analytical peer review, and stakeholder-ready reporting. Every skill opens with a gate that refuses to proceed on a guessed-at goal, and all data access is read-only.

**Includes:**
- 7 Skills (analytics-guidelines, frame-analysis, metric-design, feasibility-check, data-profile, analyst-peer-review, present-analysis)

**Perfect for:**
- Turning a vague stakeholder ask into a locked question and analysis plan
- Defining metrics that survive being optimized against (with a gaming/sensitivity stress test)
- Estimating whether an analytics feature is feasible before promising a timeline
- Checking a table or file is fit for purpose before building on it, without ever writing to it
- Getting a devil's-advocate review of SQL, Python, or notebook analysis before sharing results
- Turning a finished analysis into a stakeholder-ready Markdown report

---

## 🚀 Quick Start

### 1. Add This Marketplace

```bash
/plugin marketplace add anant-gupta-utexas/ai-workx
```

### 2. Browse Available Plugins

```bash
/plugin
```

This opens an interactive UI showing all available plugins from this marketplace.

### 3. Install Plugins

**Recommended installation order:**

```bash
# Core plugins
/plugin install essentials@ai-workx
/plugin install visual-skills@ai-workx   # Diagrams; clean SVG by default, optional art
/plugin install learning-coach@ai-workx
/plugin install financial-coach@ai-workx

# ML research plugin (if you're doing autonomous ML experimentation)
/plugin install autoresearch@ai-workx

# Data analysis plugin (if you're framing, profiling, or reviewing analytics work)
/plugin install data-analyst@ai-workx
```

> **Note:** The `chief-of-staff` skill (second-brain orchestrator with `cos daily`/`weekly`/`review`/`update` operations) now ships as part of `essentials@ai-workx` — no separate install.

### 4. Test Installation

```bash
"Use the business-strategist agent to help with my product roadmap"
"Consult expert for architecture decisions"
```

---

## 📦 Plugin Details

### essentials Plugin (Core: Skills, Wiki, Chief-of-Staff, Scaffolding, Brainstorming, Expert Consultation, Verification & Research)

**Why install:** Provides skill development tools, wiki maintenance with a full knowledge pipeline, chief-of-staff second-brain orchestrator, Python project scaffolding from a Copier template, structured brainstorming and pressure-testing, expert consultation from PRD to per-phase task specs, live app verification, planning/documentation/refactoring agents, and web research capabilities.

**Skills:**
- **skill-developer** - Meta-skill for creating and managing Claude Code skills
- **maintaining-wiki** - 7 operations for managing a personal knowledge base under `docs/02_learning/`: ingest, query, lint, status, reduce (extract atomic claims), reflect (discover connections), reweave (propagate new knowledge backward). Obsidian-compatible output.
- **deep-research** - Structured multi-round investigation pipeline: plan (task ledger, slug derivation) -> scale decision (complexity-based parallelism) -> execute (parallel searches) -> synthesize -> verify (citation anchoring, URL validation) -> deliver (source-grounded brief). 4 resource guides.
- **chief-of-staff** - Repo-native second-brain orchestrator with four operations (`cos daily`, `cos weekly`, `cos review`, `cos update`). Reads inbox, tasks, journal, and project folders; writes only to `docs/00_ops/meta/`; delegates wiki ops to `maintaining-wiki`. Draft-only cross-repo routing via `gh issue create`.
- **scaffold-project** - Generates a new Python project from the [`python-scaffolding`](https://github.com/anant-gupta-utexas/python-scaffolding) Copier template in one of three flavors (`library_cli`, `service`, `datascience`), each with `uv`, a `scripts/check.sh` quality gate, CI, and the numbered `docs/` and `dev/` trees. Runs a non-interactive `uvx copier copy` the user approves, then offers the gate, first commit, planning-doc copy (with a sanitization scan for public repos), `gh repo create`, hub registration, and later `copier update` as separate confirmed steps. Python-only.
- **brainstorm** - Diagnoses whether you're stuck, sprawling, or torn, then diverges (one of 5 thinking personas: Contrarian, Hacker, Simplifier, Researcher, Architect), reframes (collapse to the smallest true set), or converges (candidates rendered as concrete artifacts, one recommendation, cost-of-being-wrong rating). Stop rule fires when brainstorming outruns action.
- **pressure-test** - Adversarial pressure-test for a claim, decision, or conclusion: evidence-tier classification, five-mode failure scan, a required falsifier, and a verdict with a concrete next step.
- **consult-experts** - Expert personas (Product Manager, Tech Lead, System Design Specialist, Code Reviewer) with a shared Release / Phase / Task nomenclature: PRDs ship with release plans (v0.1.0 MVP, v0.2.0, …) and deferred features; TRDs break work into Development Phases tagged to PRD releases
- **dev-docs** - Details one TRD phase into a per-phase TRS with a flat task list under `dev/active/`, keeping every doc at 800 lines or fewer. The generated tasks file carries an update protocol, so any agent ticks tasks and updates context after each completed task; a full handoff update runs before compaction or session end.
- **automate-tasks** - Captures a user's working style into a personal `<handle>-mode` skill. Mines the current workspace's agent transcripts with parallel subagents, asks a few structured questions, clusters the recurring signals, and authors or updates the mode skill via `skill-developer` (explicit-invocation-only by default; never copies secrets or other people's names from transcripts).
- **create-verification-skill** - Generates a project-local `verify-<app>` skill that launches the real app (web UI, CLI/TUI, service, desktop), health-checks it, drives features the way a user does, captures evidence, and cleans up without deleting the proof. Seeds a per-feature map and runs the generated skill end to end once before handing it over. Explicit invocation only.
- **maintain-verification-skill** - Periodic audit of a `verify-<app>` skill: parallel read-only subagents check each feature file against source, one live pass drives every feature, and proven doc or harness corrections ship as one change. Product regressions are reported, never papered over in docs. Explicit invocation only.

> **Note:** The chief-of-staff skill was folded into essentials in v2.4.0. In v3.0.0, `ideation-loop` and `lateral-thinking` were merged into `brainstorm`. In v3.1.0, essentials took in `consult-experts`, the documentation-architect / plan-reviewer / refactor-planner agents, and the `dev-docs` skill. In v4.0.0, `scaffold-project` became a Python-only Copier flow. In v4.1.0, essentials added the `create-verification-skill` and `maintain-verification-skill` pair.

**Agents:**
- **business-strategist** - Create in-depth operational business plans from product ideas via interactive inquiry, synthesis, and formal plan generation
- **documentation-architect** - Create comprehensive, developer-focused documentation with context gathering and Maps of Content (MOC) navigation
- **plan-reviewer** - Review development plans before implementation
- **refactor-planner** - Create comprehensive refactoring strategies with brownfield-aware convention detection
- **web-research-specialist** - Research technical issues and solutions online

[View Details →](./plugins/essentials/README.md)

---

### learning-coach Plugin (Learning & Interview Prep)

**Why install:** Comprehensive learning and system design coach grounded in cognitive science (System 2 engagement, Zone of Proximal Development, retrieval practice) with structured learning methods and system design interview preparation.

**Skills:**
- **learning_methods** — Three science-backed learning modes:
  - **Learning Plan** — 3-phase diagnostic assessment (foundational + applied questions) followed by a personalized 5–7 task roadmap
  - **Feynman Technique** — Deep understanding through analogy, simplification, refinement cycles, and teach-back
  - **Socratic Method** — Guided discovery through carefully sequenced questions (no direct answers)
- **technical_coach** — Unified system design skill with automatic mode detection:
  - General learning for any topic
  - SWE System Design (20 LLD + 15 HLD problems)
  - ML System Design (10 MLE interview problems with 9-step framework)

**How to Use:**
```
"Help me learn CSS Flexbox — I'm a beginner"          # Learning Plan
"Explain database indexing using the Feynman method"   # Feynman Technique
"Quiz me on distributed consensus"                     # Socratic Method
"Help me understand distributed systems"               # General Learning
"Practice LRU Cache LLD problem"                       # SWE LLD
"Design Netflix architecture"                          # SWE HLD
"Design a video recommendation system"                 # ML System Design
```

**Perfect For:**
- Learning new concepts with structured, science-backed methods
- SWE system design interviews (35 LLD + HLD problems)
- MLE system design interviews (10 ML problems with 9-step framework)
- Interview preparation with interactive Socratic coaching

[View Details →](./plugins/learning-coach/README.md)

---

### financial-coach Plugin (Financial Education & Investment Analysis)

**Why install:** Comprehensive investment analysis tools including company valuation framework and YouTube video analysis for investment research.

**Skills:**
- **company-valuation** - Multi-phase investment analysis with moat assessment, sector-appropriate valuation metrics, and reverse DCF reality checks
- **yt-financial-summary** - Fetches YouTube transcripts and generates detailed financial analysis

**What company-valuation provides:**
- Business fundamentals breakdown (revenue streams, customers, geography)
- Moat assessment (switching costs, network effects, cost advantage, intangibles)
- Market sentiment classification (Trash Bin to Cult Status tiers)
- Sector-specific valuation metrics with 2024-2025 benchmarks
- Financial health and capital efficiency analysis (ROIC, Rule of 40, Clean FCF)
- Reverse DCF implied growth expectations
- Risk assessment matrix
- Final investment verdict with bull/bear cases

**What yt-financial-summary analyzes:**
- Key companies with ticker symbols
- Fundamental analysis (revenue, ratios, growth metrics, competitive advantages)
- Technical analysis (price patterns, support/resistance, indicators)
- Investment thesis (bull/bear case, price targets, timeframe)
- Credibility assessment (speaker background, data support, biases)

**How to use:**
```
Should I invest in Apple?
Analyze NVDA as an investment
Is Microsoft a good buy right now?
Analyze this financial video: https://www.youtube.com/watch?v=VIDEO_ID
```

**Requirements for YouTube analysis:**
```bash
pip install youtube-transcript-api
```

[View Details →](./plugins/financial-coach/README.md)

---

### autoresearch Plugin (ML Research)

**Why install:** Enables autonomous ML experimentation with structured workflows covering everything from single-experiment loops to full research pipelines that generate manuscripts and automated peer reviews.

**Skill:**
- **ml-research-guidelines** - Comprehensive ML research workflow covering experiment protocols, hyperparameter tuning, architecture search, optimizer tuning, parallel GPU execution, literature search, manuscript writing, tree search, peer review, queue-based orchestration, and lab notebook session continuity

**Agents:**
- **research-orchestrator** - Coordinates the 4-phase pipeline (ideation, experiment, manuscript, review) via file-based state
- **ml-researcher** - Core experiment loop: hypothesize, edit, run, evaluate, decide
- **experiment-reviewer** - Validates results, detects anomalies, selects best nodes in tree search
- **paper-writer** - Generates LaTeX manuscripts with figures and citations

**Commands:**
- **/experiment** - Run a single training experiment and compare to baseline
- **/sweep** - Hyperparameter sweep with optional parallel execution
- **/research-report** - Generate summary of all experiments and findings
- **/research-pipeline** - Full 4-phase AI Scientist pipeline (ideation, experiment, manuscript, review)
- **/tree-search** - Parallelized experiment tree search with 4 stages
- **/review-paper** - Ensemble peer review (5 independent reviews + meta-review)
- **/orchestrate** - Queue-based orchestrator with fresh context per phase for long-running pipelines

**Hooks (3):** Experiment budget guard, result regression check, SkyPilot auto-authorization

**How to Use:**
```
/experiment baseline                    # Establish baseline
/sweep WEIGHT_DECAY=0.04,0.08 --parallel  # Parallel sweep
/research-pipeline improving attention   # Full pipeline
/review-paper --format workshop          # Review a paper
/orchestrate 4                           # Run 4 phases with fresh context each
```

**Requirements:** Python 3.10+, NVIDIA GPU, optional SkyPilot for parallel execution

[View Details →](./plugins/autoresearch/README.md)

---

### data-analyst Plugin (Data Analysis Lifecycle)

**Why install:** Covers the full lifecycle of an analytics question, from turning a vague ask into a locked question through to a stakeholder-ready report, with every skill refusing to proceed on a guessed-at goal and every data check read-only.

**Skills:**
- **analytics-guidelines** - Shared lifecycle map and reference library (analytics traps, SQL pitfalls, stats pitfalls, report voice) that the other six skills link into instead of duplicating
- **frame-analysis** - Turns a vague ask into a locked question, a hypotheses table (including the null hypothesis), defined metrics, and a plan
- **metric-design** - Defines a metric tree with spec cards and a Goodhart/sensitivity/mix-shift stress test per metric
- **feasibility-check** - Traces the real system a change would plug into and returns a verdict with a breakdown table, never a confident estimate over an open unknown
- **data-profile** - Read-only grain, freshness, null, cardinality, sentinel-value, outlier, and join-integrity check on a table or file before it's used
- **analyst-peer-review** - Devil's-advocate review of SQL/Python/notebook analysis: code mechanics first, then whether the analysis actually serves its purpose
- **present-analysis** - Turns a finished analysis into a three-depth Markdown report (takeaways, recommendations, chart-backed analysis) saved to a file

**How to use:**
```
Help me frame this: marketing wants to know why signups dropped last month
Build a metric tree for whether our support team is actually helping customers
Is it feasible to show daily watch-time by traffic source for every video?
Profile the user_events table before I build weekly active users on it
Review my week-over-week active user query before I send it out
Write this up for the exec team: should we invest more in mobile onboarding?
```

[View Details →](./plugins/data-analyst/README.md)

---

## 🎨 What's a Plugin?

A Claude Code plugin is a package of:

- **Skills** - Domain knowledge and best practices that auto-activate
- **Agents** - Specialized AI assistants for complex tasks
- **Hooks** - Auto-activation and automation for enhanced workflows
- **Commands** - Slash commands for common workflows

Together, they create an intelligent development environment tailored to your needs.

---

## 📖 How to Use Installed Plugins

### Skills Auto-Activate

After installation, skills automatically activate when:
- You use specific keywords in your prompts
- You edit files matching configured patterns
- You mention relevant technologies

**Best Practice:** Use explicit trigger phrases:
- "Brainstorm this, I'm stuck on the caching design"
- "Pressure-test this decision before I lock it"
- "Consult expert for architecture decisions"
- "Automate me" (captures your working style into a `<handle>-mode` skill)

### Using Agents

Invoke agents for complex tasks:

```bash
# essentials agents
"Use the documentation-architect agent to document my REST API"
"Use the plan-reviewer agent to review my authentication implementation plan"
"Use the business-strategist agent to help me plan my product strategy"
"Use the web-research-specialist agent to find best practices for WebSockets"

# ML research agents (if autoresearch installed)
"Use the ml-researcher agent to optimize my training script"
"Use the research-orchestrator to run the full research pipeline"
```

### Slash Commands

Use commands for workflows:

```bash
# Backend TRS (essentials dev-docs skill)
/dev-docs build authentication system with JWT
/dev-docs implement order processing microservice
"update dev docs before we compact"

# Live verification (essentials)
/create-verification-skill
/maintain-verification-skill

# ML research commands (if autoresearch installed)
/experiment baseline
/sweep WEIGHT_DECAY=0.04,0.08,0.12 --parallel
/research-pipeline improving transformer efficiency
/research-report full
```

---

## 🔧 Managing Plugins

### List Installed Plugins

```bash
/plugin list
```

### Update Plugins

```bash
/plugin update essentials
/plugin update data-analyst
```

### Remove Plugins

```bash
/plugin uninstall essentials
/plugin uninstall data-analyst
```

### List All Marketplaces

```bash
/plugin marketplace list
```

---

## 💡 Recommended Plugin Combinations

### For Software Development

```bash
/plugin install essentials@ai-workx
```

**You get:** PRD → TRD → per-phase task specs (`consult-experts`, `dev-docs`) with task docs that stay current during implementation, Python project scaffolding from a Copier template, live end-to-end verification skills generated for the repo, plan review, refactoring plans, and developer documentation.

### For Product Planning & Documentation

```bash
/plugin install essentials@ai-workx
/plugin install learning-coach@ai-workx
```

**You get:** Business strategy, expert consultation, brainstorming, planning, documentation architect, context management, learning coach, and essential utilities without tech-specific development patterns.

### For ML Research & Experimentation

```bash
/plugin install essentials@ai-workx
/plugin install autoresearch@ai-workx
```

**You get:** Autonomous ML experimentation with single-agent loops, parallel GPU sweeps via SkyPilot, 4-stage tree search, manuscript generation, and automated peer review. Includes experiment budget guards and SkyPilot auto-authorization hooks.

### For Data Analysis

```bash
/plugin install essentials@ai-workx
/plugin install data-analyst@ai-workx
```

**You get:** The full analytics lifecycle — framing a vague ask into a locked question, defining metrics that resist gaming, checking feasibility before promising a timeline, profiling data quality read-only, peer-reviewing analysis code, and producing stakeholder-ready reports.

### For Learning & Knowledge Acquisition

```bash
/plugin install learning-coach@ai-workx
```

**You get:** Personal learning coach for mastering complex topics with structured guidance, examples, and real-world applications.

### For a Markdown-First Second Brain / Personal OS

```bash
/plugin install essentials@ai-workx          # maintaining-wiki + chief-of-staff + scaffold-project
/plugin install financial-coach@ai-workx     # optional: delegated ticker analysis
/plugin install learning-coach@ai-workx      # optional: study mode
```

**You get:** A complete private second-brain toolkit. `maintaining-wiki` owns the knowledge base layer (raw → wiki → outputs). `chief-of-staff` orchestrates on-demand daily / weekly / review / update cadences over the whole vault. `scaffold-project` generates a new Python project from a Copier template when an idea is ready to code. `financial-coach` and `learning-coach` stay available for topic-specific deep-dives. No external connectors, no background automation, plain markdown only.

---

## 🎓 Learn More

### Official Claude Code Docs
- [Plugin Documentation](https://code.claude.com/docs/en/plugins)
- [Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)
- [Creating Skills](https://code.claude.com/docs/en/skills)

### Plugin READMEs
- [essentials Plugin →](./plugins/essentials/README.md)
- [learning-coach Plugin →](./plugins/learning-coach/README.md)
- [financial-coach Plugin →](./plugins/financial-coach/README.md)
- [autoresearch Plugin →](./plugins/autoresearch/README.md)
- [data-analyst Plugin →](./plugins/data-analyst/README.md)
- [visual-skills Plugin →](./plugins/visual-skills/README.md)

---

## 🤝 Contributing

Want to contribute to these plugins?

1. Fork this repository
2. Create a feature branch
3. Submit a pull request

### Creating Your Own Plugins

You can create custom plugins following the same structure:

```
my-plugin/
├── plugin.json          # Plugin manifest (metadata only, components auto-discovered)
├── README.md           # Documentation
├── skills/             # Skill directories (SKILL.md + resources/)
├── agents/             # Agent markdown files
├── hooks/              # hooks.json config + Python hook scripts
│   ├── hooks.json      # Record format: { "hooks": { "PreToolUse": [...], "PostToolUse": [...] } }
│   └── *.py            # Python scripts (stdlib only, use python3 + ${CLAUDE_PLUGIN_ROOT})
└── commands/           # Command markdown files
```

Then add to `.claude-plugin/marketplace.json`.

---

## 📄 License

MIT License - Use freely in your projects.

---

## 🆘 Support

**Issues or questions?**
- Check the relevant plugin README
- Review troubleshooting sections
- Open an issue on GitHub

---

## 🌟 What You Get

After installing these plugins, you get:

- **Intelligent skill activation** - Skills suggest themselves when relevant
- **Specialized agents** - AI assistants for business strategy, documentation, planning, refactoring, research, and ML experimentation
- **Expert guidance** - Business strategist, documentation architect, and 4 expert consultation personas (Product Manager, Tech Lead, System Design, Code Reviewer)
- **Structured brainstorming** - 5 thinking personas to break through blocks (Contrarian, Hacker, Simplifier, Researcher, Architect), plus convergence on decisions and adversarial pressure-testing
- **Per-phase task specs** - Technical Requirement Specifications that keep their task docs updated after every completed task
- **Live verification** - Project-local skills that launch the real app, drive it the way a user does, and keep evidence
- **Project scaffolding** - New Python projects with `uv`, a quality gate, CI, and docs/dev planning trees
- **Second-brain operations** - Wiki maintenance and on-demand daily / weekly / review cadences
- **Modular installation** - Install only what you need

**Build better products faster!**

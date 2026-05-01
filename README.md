# AI WorkX Marketplace

Production-tested Claude Code plugins for modern development workflows with specialized tools for backend, frontend, and essential utilities including documentation, planning, and research.

## 🎯 Available Plugins

### Core Plugins (Recommended)

#### [DEV-ESSENTIALS](./plugins/DEV-ESSENTIALS/)
Development essentials with specialized agents for planning, documentation (with Maps of Content navigation), and refactoring, git workflow, lateral thinking, and expert consultation skills, code review and verification commands, backend TRS documentation, and 8 development quality hooks.

**Includes:**
- 3 Skills (git-workflow, lateral-thinking, consult-experts)
- 3 Agents (documentation-architect with MOC generation, plan-reviewer, refactor-planner)
- 4 Commands (dev-docs-update, dev-docs-be, code-review, verify)
- 8 Hooks (security scan, commit quality, file size guard, debug statement warnings, and more)

**Perfect for:** Expert consultation, lateral thinking, refactoring, documentation with navigational Maps of Content, git workflow, code review, pre-commit verification, context management

#### [essentials](./plugins/essentials/)
Skill development tools, wiki maintenance with knowledge pipeline (reduce, reflect, reweave), deep-research investigation pipeline, chief-of-staff second-brain orchestrator, project scaffolding, and web research agent for enhanced development workflow.

**Includes:**
- 6 Skills (skill-developer, maintaining-wiki with 7 operations: ingest, query, lint, status, reduce, reflect, reweave, deep-research with plan-execute-verify pipeline, chief-of-staff with 4 operations: daily, weekly, review, update, scaffold-project for bootstrapping repos from templates, ideation-loop for moving from fuzzy intent to locked decisions)
- 2 Agents (business-strategist, web-research-specialist)

**Perfect for:** Business strategy and product planning, technical research, deep multi-source investigations, creating custom skills, managing and growing a personal knowledge graph, running a markdown-first second-brain vault with on-demand cadences, bootstrapping new repos from templates

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

---

### Specialized Plugins (Install Based on Your Stack)

#### [DEV-BE-PYTHON](./plugins/DEV-BE-PYTHON/) - Backend Development (Python)
Python/FastAPI Clean Architecture backend development guidelines with comprehensive patterns for building scalable, maintainable backend applications.

**Includes:**
- 1 Skill (backend-dev-guidelines)

**Tech Stack:**
- Python 3.13+
- FastAPI
- Pydantic 2.8.0+
- Clean Architecture

**Perfect for:** Python/FastAPI backend projects following Clean Architecture

#### [DEV-BE-GO](./plugins/DEV-BE-GO/) - Backend Development (Go)
Go/Chi Clean Architecture backend development guidelines with DDD patterns, sqlc + pgx database access, and gRPC support.

**Includes:**
- 1 Skill (backend-dev-guidelines)

**Tech Stack:**
- Go 1.24+
- Chi router
- sqlc + pgx
- koanf, slog + OpenTelemetry
- Clean Architecture / DDD

**Perfect for:** Go backend projects, Clean Architecture in Go, gRPC services

#### [DEV-FE](./plugins/DEV-FE/) - Frontend Development
TanStack Start/React/TypeScript frontend development guidelines with modern SSR-ready patterns and comprehensive technical requirement specification command.

**Includes:**
- 1 Skill (frontend-dev-guidelines)
- 2 Agents (frontend-error-fixer, uiux-specialist)
- 1 Command (dev-docs-fe)

**Tech Stack:**
- TanStack Start
- React 18+
- TypeScript
- TanStack Query/Router/Form
- shadcn/ui
- Tailwind CSS

**Perfect for:** TanStack Start/React/TypeScript frontend projects, creating frontend TRS documents

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
# Core plugins (install DEV-ESSENTIALS first)
/plugin install DEV-ESSENTIALS@ai-workx
/plugin install essentials@ai-workx
/plugin install learning-coach@ai-workx
/plugin install financial-coach@ai-workx

# Backend plugin (if you have a Python/FastAPI backend)
/plugin install DEV-BE-PYTHON@ai-workx

# Backend plugin (if you have a Go backend)
/plugin install DEV-BE-GO@ai-workx

# Frontend plugin (if you have a TanStack Start/React/TypeScript frontend)
/plugin install DEV-FE@ai-workx

# ML research plugin (if you're doing autonomous ML experimentation)
/plugin install autoresearch@ai-workx
```

> **Note:** The `chief-of-staff` skill (second-brain orchestrator with `cos daily`/`weekly`/`review`/`update` operations) now ships as part of `essentials@ai-workx` — no separate install.

### 4. Test Installation

```bash
"Use the business-strategist agent to help with my product roadmap"
"Consult expert for architecture decisions"
```

---

## 📦 Plugin Details

### DEV-ESSENTIALS Plugin (Core)

**Why install:** Provides fundamental development utilities including git workflow patterns, lateral thinking for breaking through blocks, expert consultation, code review, verification, backend TRS documentation, 8 quality hooks, and planning agents.

**Skills:**
- **git-workflow** - Branching strategies, conventional commits, PR workflow, merge vs rebase, conflict resolution, release management
- **lateral-thinking** - 5 thinking personas (Contrarian, Hacker, Simplifier, Researcher, Architect) that diagnose stagnation patterns and reframe problems
- **consult-experts** - Access specialized expert personas (Product Manager, Tech Lead, System Design Specialist, Code Reviewer)

**Agents:**
- **documentation-architect** - Create comprehensive, developer-focused documentation with context gathering and Maps of Content (MOC) navigation
- **plan-reviewer** - Review development plans before implementation
- **refactor-planner** - Create comprehensive refactoring strategies with brownfield-aware convention detection

**Commands:**
- **/dev-docs-update** - Update dev documentation before context compaction for seamless continuation
- **/dev-docs-be** - Create comprehensive Technical Requirement Specifications (TRS) for backend features
- **/code-review** - Run security and quality review of uncommitted changes before committing
- **/verify** - Run comprehensive verification (build, types, lint, tests, secrets, debug statements)

**Hooks (8):** Pre-commit security scan, commit quality validation, block --no-verify, suggest compact, large file blocker, doc file warning, console.log warning, test file reminder

[View Details →](./plugins/DEV-ESSENTIALS/README.md)

---

### essentials Plugin (Skills, Wiki, Chief-of-Staff, Scaffolding & Research)

**Why install:** Provides skill development tools, wiki maintenance with a full knowledge pipeline, chief-of-staff second-brain orchestrator, project scaffolding from language templates, and web research capabilities.

**Skills:**
- **skill-developer** - Meta-skill for creating and managing Claude Code skills
- **maintaining-wiki** - 7 operations for managing a personal knowledge base under `docs/02_learning/`: ingest, query, lint, status, reduce (extract atomic claims), reflect (discover connections), reweave (propagate new knowledge backward). Obsidian-compatible output.
- **deep-research** - Structured multi-round investigation pipeline: plan (task ledger, slug derivation) -> scale decision (complexity-based parallelism) -> execute (parallel searches) -> synthesize -> verify (citation anchoring, URL validation) -> deliver (source-grounded brief). 4 resource guides.
- **chief-of-staff** - Repo-native second-brain orchestrator with four operations (`cos daily`, `cos weekly`, `cos review`, `cos update`). Reads inbox, tasks, journal, and project folders; writes only to `docs/00_ops/meta/`; delegates wiki ops to `maintaining-wiki`. Draft-only cross-repo routing via `gh issue create`.
- **scaffold-project** - Bootstrap a new repo from one of the maintained templates (`python-scaffolding`, `go-scaffolding`, `react-scaffolding`). Drafts `gh repo create --template --clone` commands; user executes. Web-UI fallback when `gh` is unavailable.

> **Note:** The consult-experts skill has moved to the DEV-ESSENTIALS plugin. The chief-of-staff skill previously lived in its own plugin; it was folded into essentials in v2.4.0.

**Agents:**
- **business-strategist** - Create in-depth operational business plans from product ideas via interactive inquiry, synthesis, and formal plan generation
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

### DEV-BE-PYTHON Plugin (Python Backend Specialization)

**When to install:** You're working on Python/FastAPI backend projects following Clean Architecture.

**Skill:**
- **backend-dev-guidelines** - Python/FastAPI Clean Architecture with domain entities, use cases, repository patterns

**Key Topics:**
- Domain layer (entities, value objects)
- Application layer (use cases, DTOs)
- Repository pattern and data access
- FastAPI endpoint structure
- Validation, error handling, testing

**Resources:** 12 comprehensive guides on Clean Architecture patterns

> For backend TRS documentation, use the `/dev-docs-be` command from the DEV-ESSENTIALS plugin.

[View Details →](./plugins/DEV-BE-PYTHON/README.md)

---

### DEV-BE-GO Plugin (Go Backend Specialization)

**When to install:** You're working on Go backend projects following Clean Architecture with DDD patterns.

**Skill:**
- **backend-dev-guidelines** - Go/Chi Clean Architecture with domain entities, services, repository patterns (sqlc + pgx)

**Key Topics:**
- Domain layer (unexported fields, constructors, value objects)
- Application layer (services, DTOs, CQRS as advanced pattern)
- Repository pattern with sqlc + pgx
- Chi router and HTTP handlers
- Configuration with koanf
- Error handling and observability (slog + OpenTelemetry)
- gRPC with buf and connect-go
- Testing with testify, mockery, and testcontainers-go

**Resources:** 13 comprehensive guides on Go Clean Architecture patterns

[View Details →](./plugins/DEV-BE-GO/README.md)

---

### DEV-FE Plugin (Frontend Specialization)

**When to install:** You're working on TanStack Start/React/TypeScript projects with modern SSR-ready patterns.

**Skill:**
- **frontend-dev-guidelines** - TanStack Start/React/TypeScript patterns with Suspense, lazy loading, shadcn/ui, and SSR-ready architecture

**Agents:**
- **frontend-error-fixer** - Debug and fix frontend errors (build and runtime)
- **uiux-specialist** - UI/UX design and specialist guidance

**Commands:**
- **/dev-docs-fe** - Create comprehensive Technical Requirement Specifications (TRS) for frontend features with UI component design, API integration, state management, and implementation phases

**Key Topics:**
- Component patterns (Suspense, lazy loading)
- TanStack Start/Query/Router/Form
- shadcn/ui components and Tailwind CSS
- SSR-ready architecture
- Performance optimization
- TypeScript standards

**Resources:** 11 comprehensive guides on TanStack Start/React best practices

[View Details →](./plugins/DEV-FE/README.md)

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
- "Following backend guidelines, create an endpoint"
- "Using react best practices, create a component"
- "Consult expert for architecture decisions"

### Using Agents

Invoke agents for complex tasks:

```bash
# DEV-ESSENTIALS agents
"Use the documentation-architect agent to document my REST API"
"Use the plan-reviewer agent to review my authentication implementation plan"
"Consult product expert for help with my roadmap"

# essentials agents
"Use the business-strategist agent to help me plan my product strategy"
"Use the web-research-specialist agent to find best practices for WebSockets"

# Frontend agents (if DEV-FE installed)
"Use the frontend-error-fixer agent to debug this console error"
"Use the uiux-specialist agent to review my dashboard design"

# ML research agents (if autoresearch installed)
"Use the ml-researcher agent to optimize my training script"
"Use the research-orchestrator to run the full research pipeline"
```

### Slash Commands

Use commands for workflows:

```bash
# DEV-ESSENTIALS commands
/dev-docs-update
/dev-docs-update authentication system changes and middleware

# Code review and verification
/code-review
/verify
/verify pre-pr

# Backend TRS commands
/dev-docs-be build authentication system with JWT
/dev-docs-be implement order processing microservice

# Frontend commands (if DEV-FE installed)
/dev-docs-fe create user dashboard with real-time metrics
/dev-docs-fe implement checkout flow with payment integration

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
/plugin update DEV-ESSENTIALS
/plugin update essentials
/plugin update DEV-BE-PYTHON
/plugin update DEV-BE-GO
/plugin update DEV-FE
```

### Remove Plugins

```bash
/plugin uninstall DEV-ESSENTIALS
/plugin uninstall essentials
/plugin uninstall DEV-BE-PYTHON
/plugin uninstall DEV-BE-GO
/plugin uninstall DEV-FE
```

### List All Marketplaces

```bash
/plugin marketplace list
```

---

## 💡 Recommended Plugin Combinations

### For Fullstack Projects (Backend + Frontend)

```bash
/plugin install DEV-ESSENTIALS@ai-workx
/plugin install essentials@ai-workx
/plugin install learning-coach@ai-workx
/plugin install DEV-BE-PYTHON@ai-workx    # Python/FastAPI
# OR
/plugin install DEV-BE-GO@ai-workx        # Go/Chi
/plugin install DEV-FE@ai-workx
```

**You get:** Complete development workflow with backend/frontend patterns, TRS documentation commands, code review, verification hooks, planning agents, documentation tools, learning coach, and git workflow patterns.

### For Backend-Only Projects (Python)

```bash
/plugin install DEV-ESSENTIALS@ai-workx
/plugin install essentials@ai-workx
/plugin install learning-coach@ai-workx
/plugin install DEV-BE-PYTHON@ai-workx
```

**You get:** Python/FastAPI Clean Architecture patterns, planning agents, documentation tools, learning coach, and essential utilities.

### For Backend-Only Projects (Go)

```bash
/plugin install DEV-ESSENTIALS@ai-workx
/plugin install essentials@ai-workx
/plugin install learning-coach@ai-workx
/plugin install DEV-BE-GO@ai-workx
```

**You get:** Go/Chi Clean Architecture patterns with sqlc + pgx, gRPC support, planning agents, code review, verification hooks, documentation tools, learning coach, and essential utilities.

### For Frontend-Only Projects

```bash
/plugin install DEV-ESSENTIALS@ai-workx
/plugin install essentials@ai-workx
/plugin install learning-coach@ai-workx
/plugin install DEV-FE@ai-workx
```

**You get:** TanStack Start/React patterns, frontend TRS command, UI/UX specialist, error fixing, planning agents, learning coach, and documentation tools.

### For Product Planning & Documentation

```bash
/plugin install DEV-ESSENTIALS@ai-workx
/plugin install essentials@ai-workx
/plugin install learning-coach@ai-workx
```

**You get:** Business strategy, expert consultation, lateral thinking, planning, documentation architect, context management, learning coach, and essential utilities without tech-specific development patterns.

### For ML Research & Experimentation

```bash
/plugin install DEV-ESSENTIALS@ai-workx
/plugin install essentials@ai-workx
/plugin install autoresearch@ai-workx
```

**You get:** Autonomous ML experimentation with single-agent loops, parallel GPU sweeps via SkyPilot, 4-stage tree search, manuscript generation, and automated peer review. Includes experiment budget guards and SkyPilot auto-authorization hooks.

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

**You get:** A complete private second-brain toolkit. `maintaining-wiki` owns the knowledge base layer (raw → wiki → outputs). `chief-of-staff` orchestrates on-demand daily / weekly / review / update cadences over the whole vault. `scaffold-project` bootstraps new repos from templates when an idea is ready to code. `financial-coach` and `learning-coach` stay available for topic-specific deep-dives. No external connectors, no background automation, plain markdown only.

---

## 🎓 Learn More

### Official Claude Code Docs
- [Plugin Documentation](https://code.claude.com/docs/en/plugins)
- [Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)
- [Creating Skills](https://code.claude.com/docs/en/skills)

### Plugin READMEs
- [DEV-ESSENTIALS Plugin →](./plugins/DEV-ESSENTIALS/README.md)
- [essentials Plugin →](./plugins/essentials/README.md)
- [learning-coach Plugin →](./plugins/learning-coach/README.md)
- [financial-coach Plugin →](./plugins/financial-coach/README.md)
- [DEV-BE-PYTHON Plugin (Python) →](./plugins/DEV-BE-PYTHON/README.md)
- [DEV-BE-GO Plugin (Go) →](./plugins/DEV-BE-GO/README.md)
- [DEV-FE Plugin →](./plugins/DEV-FE/README.md)
- [autoresearch Plugin →](./plugins/autoresearch/README.md)

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
- **Specialized agents** - AI assistants for business strategy, documentation, planning, UI/UX, research, and error fixing
- **Expert guidance** - Access to business strategist, documentation architect, tech lead, UI/UX specialist, and 4 expert consultation personas
- **Lateral thinking** - 5 thinking personas to break through development blocks (Contrarian, Hacker, Simplifier, Researcher, Architect)
- **Git workflow patterns** - Branching strategies, conventional commits, PR workflow, conflict resolution
- **Code review and verification** - Pre-commit quality gates and comprehensive PR-readiness checks
- **8 development hooks** - Automated security scanning, commit quality, file size guards, debug statement detection
- **TRS documentation commands** - Create comprehensive Technical Requirement Specifications for backend and frontend features
- **Context management** - Update dev docs before context reset for seamless continuation
- **Production patterns** - Best practices from real-world projects (Python/FastAPI, Go/Chi, TanStack Start/React)
- **Modern tech stacks** - SSR-ready React patterns, Clean Architecture backends (Python + Go), shadcn/ui, TanStack ecosystem
- **Modular installation** - Install only what you need for your project

**Build better products faster!**

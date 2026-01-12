# Claude Workspace Plugins Marketplace

Production-tested Claude Code plugins for modern development workflows with specialized tools for backend, frontend, and essential utilities including documentation, planning, and research.

## 🎯 Available Plugins

### Core Plugins (Recommended)

#### [essentials](./plugins/essentials/)
Essential utilities with specialized agents, expert consultation, documentation tools, skill development, and intelligent hooks.

**Includes:**
- 2 Skills (consult-experts, skill-developer)
- 5 Agents (business-strategist, documentation-architect, plan-reviewer, refactor-planner, web-research-specialist)
- 1 Command (dev-docs-update)
- 3 Hooks (skill activation, file tracking, error handling reminders)

**Perfect for:** Planning, research, refactoring, expert consultation, documentation, context management

#### [learning-coach](./plugins/learning-coach/)
Personal learning and system design coach with comprehensive coverage of general learning, SWE system design (LLD & HLD), and ML system design for MLE interviews.

**Includes:**
- 1 Skill (technical_coach) with 3 integrated modes:
  - General Learning for any topic
  - SWE System Design (20 LLD + 15 HLD problems)
  - ML System Design (10 MLE interview problems with 9-step framework)

**Perfect for:**
- Learning new topics and complex concepts
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

---

### Specialized Plugins (Install Based on Your Stack)

#### [021BE](./plugins/021BE/) - Backend Development
Python/FastAPI Clean Architecture backend development guidelines with comprehensive technical requirement specification command.

**Includes:**
- 1 Skill (backend-dev-guidelines)
- 1 Command (dev-docs-be)

**Tech Stack:**
- Python 3.13+
- FastAPI
- Pydantic 2.8.0+
- Clean Architecture

**Perfect for:** Python/FastAPI backend projects, creating backend TRS documents

#### [021FE](./plugins/021FE/) - Frontend Development
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
/plugin marketplace add anant-gupta-utexas/claude-workspace-plugins
```

### 2. Browse Available Plugins

```bash
/plugin
```

This opens an interactive UI showing all available plugins from this marketplace.

### 3. Install Plugins

**Recommended installation order:**

```bash
# Core plugins (install essentials first)
/plugin install essentials@claude-workspace-plugins
/plugin install learning-coach@claude-workspace-plugins
/plugin install financial-coach@claude-workspace-plugins

# Backend plugin (if you have a Python/FastAPI backend)
/plugin install 021BE@claude-workspace-plugins

# Frontend plugin (if you have a TanStack Start/React/TypeScript frontend)
/plugin install 021FE@claude-workspace-plugins
```

### 4. Post-Installation Setup

**For essentials plugin (required):**
```bash
cd ~/.claude/plugins/marketplaces/claude-workspace-plugins/plugins/essentials/hooks && npm install
```

Test skill activation:
```bash
"Use the business-strategist agent to help with my product roadmap"
"Consult expert for architecture decisions"
```

---

## 📦 Plugin Details

### essentials Plugin (Core)

**Why install:** Provides fundamental utilities that enhance all development workflows regardless of tech stack, including documentation, planning, research, and context management.

**Skills:**
- **consult-experts** - Access specialized expert agents (Product Manager, Tech Lead, Code Reviewer)
- **skill-developer** - Meta-skill for creating and managing Claude Code skills

**Agents:**
- **business-strategist** - Business strategy and product guidance for new products
- **documentation-architect** - Create comprehensive, developer-focused documentation with context gathering
- **plan-reviewer** - Review development plans before implementation
- **refactor-planner** - Create comprehensive refactoring strategies
- **web-research-specialist** - Research technical issues and solutions online

**Commands:**
- **/dev-docs-update** - Update dev documentation before context compaction for seamless continuation

**Hooks:**
- **skill-activation-prompt** - Auto-suggests relevant skills based on your work
- **post-tool-use-tracker** - Tracks file changes for context management
- **error-handling-reminder** - Reminds about error handling best practices

[View Details →](./plugins/essentials/README.md)

---

### learning-coach Plugin (Learning & Interview Prep)

**Why install:** Comprehensive learning and system design coach with three integrated modes - general learning, SWE system design (LLD & HLD), and ML system design for MLE interviews.

**Skill:**
- **technical_coach** - Unified skill with automatic mode detection based on your request

**Three Modes:**

**1. General Learning Mode:**
- Request any topic and get step-by-step guidance
- Examples, analogies, and real-world applications
- Comprehensive summaries to reinforce understanding

**2. SWE System Design Mode:**
- **LLD (20 problems):** LRU Cache, Parking Lot, Elevator, Chess, ATM, and more
- **HLD (15 problems):** Netflix, Uber, Instagram, Airbnb, Amazon, and more
- Socratic approach with checkpoints and hints

**3. ML System Design Mode (9-step framework):**
- Problem Formulation → Metrics → Architecture → Data → Features → Model → Serving → Testing → Monitoring
- **10 MLE problems:** Visual Search, Video Recommendations, Harmful Content Detection, Ad Click Prediction, News Feed, People You May Know, and more

**How to Use:**
```
"Help me understand distributed systems"          # General Learning
"Practice LRU Cache LLD problem"                  # SWE LLD
"Design Netflix architecture"                     # SWE HLD
"Design a video recommendation system"            # ML System Design
"Practice harmful content detection for MLE"      # ML System Design
```

**Perfect For:**
- Learning new concepts, frameworks, and technologies
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

### 021BE Plugin (Backend Specialization)

**When to install:** You're working on Python/FastAPI backend projects following Clean Architecture.

**Skill:**
- **backend-dev-guidelines** - Python/FastAPI Clean Architecture with domain entities, use cases, repository patterns

**Commands:**
- **/dev-docs-be** - Create comprehensive Technical Requirement Specifications (TRS) for backend features with structured implementation phases, database design, API specs, and task breakdown

**Key Topics:**
- Domain layer (entities, value objects)
- Application layer (use cases, DTOs)
- Repository pattern and data access
- FastAPI endpoint structure
- Validation, error handling, testing

**Resources:** 12 comprehensive guides on Clean Architecture patterns

[View Details →](./plugins/021BE/README.md)

---

### 021FE Plugin (Frontend Specialization)

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

[View Details →](./plugins/021FE/README.md)

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
# Essential agents
"Use the business-strategist agent to help me plan my product strategy"
"Use the documentation-architect agent to document my REST API"
"Use the plan-reviewer agent to review my authentication implementation plan"
"Use the web-research-specialist agent to find best practices for WebSockets"

# Frontend agents (if 021FE installed)
"Use the frontend-error-fixer agent to debug this console error"
"Use the uiux-specialist agent to review my dashboard design"
```

### Slash Commands

Use commands for workflows:

```bash
# Essential commands
/dev-docs-update
/dev-docs-update authentication system changes and middleware

# Backend commands (if 021BE installed)
/dev-docs-be build authentication system with JWT
/dev-docs-be implement order processing microservice

# Frontend commands (if 021FE installed)
/dev-docs-fe create user dashboard with real-time metrics
/dev-docs-fe implement checkout flow with payment integration
```

---

## ⚙️ Customization

### Adjusting Path Patterns

The essentials plugin includes `skill-rules.json` that configures when skills activate. This file references all skills (backend and frontend) for comprehensive activation logic.

**Important Note:** If you only install specialized plugins for your project type (e.g., only frontend), the skill activation hook will still check for keywords related to uninstalled skills. This doesn't cause errors - it simply won't find matches for those skills.

Edit `.claude/skills/skill-rules.json` to customize activation patterns:

**Monorepo Example:**
```json
{
  "skills": {
    "backend-dev-guidelines": {
      "fileTriggers": {
        "pathPatterns": [
          "services/*/src/**/*.py",
          "packages/backend/**/*.ts"
        ]
      }
    },
    "frontend-dev-guidelines": {
      "fileTriggers": {
        "pathPatterns": [
          "apps/web/src/**/*.tsx",
          "packages/ui/src/**/*.tsx"
        ]
      }
    }
  }
}
```

**Frontend-Only Project:**
```json
{
  "skills": {
    "frontend-dev-guidelines": {
      "fileTriggers": {
        "pathPatterns": [
          "src/**/*.tsx",
          "components/**/*.tsx"
        ]
      },
      "promptTriggers": {
        "keywords": [
          "react",
          "frontend guidelines",
          "mui patterns"
        ]
      }
    }
  }
}
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
/plugin update 021BE
/plugin update 021FE
```

### Remove Plugins

```bash
/plugin uninstall essentials
/plugin uninstall 021BE
/plugin uninstall 021FE
```

### List All Marketplaces

```bash
/plugin marketplace list
```

---

## 💡 Recommended Plugin Combinations

### For Fullstack Projects (Backend + Frontend)

```bash
/plugin install essentials@claude-workspace-plugins
/plugin install learning-coach@claude-workspace-plugins
/plugin install 021BE@claude-workspace-plugins
/plugin install 021FE@claude-workspace-plugins
```

**You get:** Complete development workflow with backend/frontend patterns, TRS documentation commands, planning agents, documentation tools, learning coach, and intelligent hooks.

### For Backend-Only Projects

```bash
/plugin install essentials@claude-workspace-plugins
/plugin install learning-coach@claude-workspace-plugins
/plugin install 021BE@claude-workspace-plugins
```

**You get:** Backend Clean Architecture patterns, backend TRS command, planning agents, documentation tools, learning coach, and essential utilities.

### For Frontend-Only Projects

```bash
/plugin install essentials@claude-workspace-plugins
/plugin install learning-coach@claude-workspace-plugins
/plugin install 021FE@claude-workspace-plugins
```

**You get:** TanStack Start/React patterns, frontend TRS command, UI/UX specialist, error fixing, planning agents, learning coach, and documentation tools.

### For Product Planning & Documentation

```bash
/plugin install essentials@claude-workspace-plugins
/plugin install learning-coach@claude-workspace-plugins
```

**You get:** Business strategy, planning, documentation architect, context management, learning coach, and essential utilities without tech-specific development patterns.

### For Learning & Knowledge Acquisition

```bash
/plugin install learning-coach@claude-workspace-plugins
```

**You get:** Personal learning coach for mastering complex topics with structured guidance, examples, and real-world applications.

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
- [021BE Plugin →](./plugins/021BE/README.md)
- [021FE Plugin →](./plugins/021FE/README.md)

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
├── plugin.json          # Plugin manifest
├── README.md           # Documentation
├── skills/             # Skill files
├── agents/             # Agent files
├── hooks/              # Hook files
└── commands/           # Command files
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

- ✅ **Intelligent skill activation** - Skills suggest themselves when relevant
- ✅ **Specialized agents** - AI assistants for business strategy, documentation, planning, UI/UX, research, and error fixing
- ✅ **Expert guidance** - Access to business strategist, documentation architect, tech lead, and UI/UX specialist agents
- ✅ **TRS documentation commands** - Create comprehensive Technical Requirement Specifications for backend and frontend features
- ✅ **Context management** - Update dev docs before context reset for seamless continuation
- ✅ **Automated workflows** - Hooks that track and optimize your work
- ✅ **Production patterns** - Best practices from real-world projects (Python/FastAPI, TanStack Start/React)
- ✅ **Modern tech stacks** - SSR-ready React patterns, Clean Architecture backend, shadcn/ui, TanStack ecosystem
- ✅ **Comprehensive documentation** - Everything you need to know
- ✅ **Modular installation** - Install only what you need for your project

**Build better products faster!** 🚀

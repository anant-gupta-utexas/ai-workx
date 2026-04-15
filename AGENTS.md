# Claude Workspace Plugins -- Agent Instructions

Plugin marketplace for modern development workflows. Provides specialized agents, skills, commands, and hooks for backend (Python/FastAPI, Go/Chi), frontend (TanStack Start/React), and general development.

**Version:** 2.0.0

## Available Plugins

| Plugin | Purpose | Key Components |
|--------|---------|----------------|
| DEV-ESSENTIALS | Development essentials | 3 skills, 4 agents, 4 commands, 8 hooks |
| essentials | Skills, wiki, and research | 2 skills, 1 agent |
| DEV-BE-PYTHON | Python/FastAPI Clean Architecture | 1 skill (12 resource guides) |
| DEV-BE-GO | Go/Chi Clean Architecture | 1 skill (13 resource guides) |
| DEV-FE | TanStack Start/React/TypeScript | 1 skill, 2 agents, 1 command |
| learning-coach | Learning and system design coaching | 1 skill (3 modes) |
| financial-coach | Investment analysis and valuation | 2 skills |
| autoresearch | Autonomous ML research pipeline | 1 skill (11 resource guides), 4 agents, 7 commands, 3 hooks |

## Installation

```bash
# Add marketplace
/plugin marketplace add anant-gupta-utexas/claude-workspace-plugins

# Install plugins
/plugin install DEV-ESSENTIALS@claude-workspace-plugins  # Dev essentials
/plugin install essentials@claude-workspace-plugins       # Expert consultation
/plugin install DEV-BE-PYTHON@claude-workspace-plugins    # Python backend
/plugin install DEV-BE-GO@claude-workspace-plugins        # Go backend
/plugin install DEV-FE@claude-workspace-plugins           # Frontend
```

## Available Agents

| Agent | Plugin | Purpose |
|-------|--------|---------|
| business-strategist | DEV-ESSENTIALS | Product strategy, roadmap planning, market analysis |
| documentation-architect | DEV-ESSENTIALS | Developer-focused documentation from code and existing docs |
| plan-reviewer | DEV-ESSENTIALS | Review implementation plans, risk assessment |
| refactor-planner | DEV-ESSENTIALS | Refactoring strategies, tech debt analysis |
| web-research-specialist | essentials | Technical research, best practices, library comparisons |
| frontend-error-fixer | DEV-FE | Debug and fix frontend build/runtime errors |
| uiux-specialist | DEV-FE | UI/UX design and specialist guidance |
| research-orchestrator | autoresearch | Multi-phase research pipeline coordinator |
| ml-researcher | autoresearch | Autonomous ML experimentation loop |
| experiment-reviewer | autoresearch | Experiment result validation and node selection |
| paper-writer | autoresearch | Scientific manuscript generation from experiment logs |

## Available Commands

| Command | Plugin | Purpose |
|---------|--------|---------|
| /dev-docs-update | DEV-ESSENTIALS | Update dev docs before context compaction |
| /dev-docs-be | DEV-ESSENTIALS | Create backend Technical Requirement Specifications |
| /code-review | DEV-ESSENTIALS | Security and quality review of uncommitted changes |
| /verify | DEV-ESSENTIALS | Comprehensive codebase verification (build, types, lint, tests, secrets) |
| /dev-docs-fe | DEV-FE | Create frontend Technical Requirement Specifications |
| /experiment | autoresearch | Run single training experiment and compare to best |
| /sweep | autoresearch | Hyperparameter sweep with optional parallel execution |
| /research-report | autoresearch | Generate summary of all experiments and findings |
| /research-pipeline | autoresearch | Full 4-phase AI Scientist pipeline |
| /tree-search | autoresearch | Parallelized experiment tree search with 4 stages |
| /review-paper | autoresearch | Ensemble peer review (5 reviews + meta-review) |
| /orchestrate | autoresearch | Queue-based orchestrator with fresh context per phase |

## Available Hooks (DEV-ESSENTIALS)

| Hook | Event | Behavior |
|------|-------|----------|
| block-no-verify | PreToolUse | Blocks `git commit --no-verify` |
| pre-commit-security | PreToolUse | Scans staged files for hardcoded secrets |
| commit-quality | PreToolUse | Validates commit format, detects debug statements |
| suggest-compact | PreToolUse | Suggests /compact every ~50 tool calls |
| large-file-blocker | PreToolUse | Blocks files exceeding 800 lines |
| doc-file-warning | PreToolUse | Warns about non-standard doc files |
| console-log-warning | PostToolUse | Warns about debug statements in edited files |
| test-file-reminder | PostToolUse | Reminds to write tests for new source files |

Disable hooks via: `export DISABLED_HOOKS="hook-name,hook-name"`

## Available Hooks (autoresearch)

| Hook | Event | Behavior |
|------|-------|----------|
| experiment-budget-guard | PreToolUse | Blocks training commands exceeding configured time budget |
| result-regression-check | PostToolUse | Reminds to run experiment after editing training scripts |
| sky-auto-auth | PreToolUse | Auto-authorizes SkyPilot commands without manual prompts |

## Core Principles

1. **Clean Architecture** -- Domain has zero external dependencies
2. **Test-Driven** -- Write tests first, 80%+ coverage required
3. **Security-First** -- Validate all inputs, no hardcoded secrets
4. **Immutability** -- Prefer immutable data structures
5. **Plan Before Execute** -- Plan complex features before writing code

## Git Workflow

- **Commit format:** `<type>(<scope>): <description>`
- **Types:** feat, fix, docs, refactor, test, chore, perf, ci
- **PR workflow:** Analyze full commit history, draft comprehensive summary, include test plan
- **Branch naming:** feature/name, fix/name, hotfix/name, release/version

## Security Guidelines

Before any commit:
- No hardcoded secrets (API keys, passwords, tokens)
- All user inputs validated
- SQL injection prevention (parameterized queries)
- Authentication/authorization verified
- Error messages don't leak internal details

## Testing Requirements

- 80% minimum test coverage
- TDD workflow: RED (failing test) -> GREEN (minimal impl) -> REFACTOR
- Unit + Integration + E2E tests required
- 100% coverage for auth, payment, and security-critical code

## Contributing

Follow the formats in `CLAUDE.md` for component types and the 7-file update checklist when moving or adding components.

# Essentials Plugin

Essential utilities for enhanced development workflow including specialized agents, expert consultation, git workflow patterns, code review and verification commands, backend TRS documentation, 8 development quality hooks, and skill development tools.

## What's Included

### Skills (3)
- **consult-experts** - Access specialized expert agents for business strategy, tech leadership, system design, and code review
- **skill-developer** - Meta-skill for creating and managing Claude Code skills
- **git-workflow** - Git workflow patterns including branching strategies, conventional commits, PR workflow, merge vs rebase, conflict resolution, and release management

### Agents (5)
- **business-strategist** - Business strategy and product guidance for building products from 0 to 1
- **documentation-architect** - Create comprehensive, developer-focused documentation with context gathering from code and existing docs
- **plan-reviewer** - Review development plans before implementation
- **refactor-planner** - Create comprehensive refactoring strategies
- **web-research-specialist** - Research technical issues and solutions online

### Commands (4)
- **dev-docs-update** - Update dev documentation before context compaction for seamless continuation
- **dev-docs-be** - Create comprehensive Technical Requirement Specifications (TRS) for backend features
- **code-review** - Run a security and quality review of uncommitted changes before committing
- **verify** - Run comprehensive verification (build, types, lint, tests, secrets, debug statements)

### Hooks (8)
- **block-no-verify** - Blocks `git commit --no-verify` (PreToolUse, Bash)
- **pre-commit-security** - Scans staged files for hardcoded secrets before commits (PreToolUse, Bash)
- **commit-quality** - Validates conventional commit format, detects debugger/console.log in staged files (PreToolUse, Bash)
- **suggest-compact** - Suggests `/compact` every ~50 tool calls to manage context window (PreToolUse, Edit|Write)
- **large-file-blocker** - Blocks creation of files exceeding 800 lines (PreToolUse, Write)
- **doc-file-warning** - Warns about non-standard doc files outside recognized locations (PreToolUse, Write)
- **console-log-warning** - Warns about debug statements in edited files (PostToolUse, Edit)
- **test-file-reminder** - Reminds to write tests when creating new source files (PostToolUse, Write)

## Installation

```bash
# From your project directory
/plugin install essentials@claude-workspace-plugins
```

## Usage Examples

### Using Skills

**Consult Experts:**
```bash
"Consult product expert for help with my roadmap"
"Get tech lead advice on my system architecture"
```

**Git Workflow:**
```bash
"Help me set up a branching strategy for my project"
"What's the conventional commit format?"
"How should I resolve this merge conflict?"
"Create a PR description for my changes"
```

**Skill Development:**
```bash
"Help me create a new skill for code review"
"How do I configure skill triggers?"
```

### Using Agents Directly

**Business Strategy:**
```bash
"Use the business-strategist agent to help me plan my MVP features"
```

**Documentation:**
```bash
"Use the documentation-architect agent to document my new billing service"
```

**Plan Review:**
```bash
"Use the plan-reviewer agent to review my authentication implementation plan"
```

**Refactoring:**
```bash
"Use the refactor-planner agent to plan breaking down this large service"
```

**Research:**
```bash
"Use the web-research-specialist agent to find best practices for file uploads"
```

### Using Commands

**Code Review (before committing):**
```bash
/code-review
```
Reviews uncommitted changes for security vulnerabilities, code quality issues, and best practice violations. Produces a severity report with verdict (Approve/Warning/Block).

**Verification (before PRs):**
```bash
/verify              # Full check (default)
/verify quick        # Build + types only
/verify pre-commit   # Build + types + lint + secrets
/verify pre-pr       # Full + security scan
```

**Backend TRS Documentation:**
```bash
/dev-docs-be refactor authentication system
/dev-docs-be implement order processing microservice
```
Creates comprehensive Technical Requirement Specifications with implementation phases, database design, API specs, and task breakdown.

**Update Documentation:**
```bash
/dev-docs-update
/dev-docs-update authentication system changes and new middleware
```

## Hooks

Hooks are event-driven automations that fire before or after Claude Code tool executions. They enforce code quality, catch mistakes early, and automate repetitive checks.

### How Hooks Work

```
User request -> Claude picks a tool -> PreToolUse hook runs -> Tool executes -> PostToolUse hook runs
```

- **PreToolUse** hooks run before tool execution. They can **block** (exit code 2) or **warn** (stderr).
- **PostToolUse** hooks run after tool completion. They can analyze output but cannot block.

### PreToolUse Hooks

| Hook | Matcher | What it does | Exit code |
|------|---------|-------------|-----------|
| block-no-verify | Bash | Blocks `git commit --no-verify` | 2 (block) |
| pre-commit-security | Bash | Scans staged files for secrets (sk-, ghp_, AKIA, api_key, password) | 2 (block) |
| commit-quality | Bash | Validates commit format, detects debugger/console.log in staged files | 0 (warn) or 2 (block) |
| suggest-compact | Edit, Write | Suggests `/compact` every ~50 tool calls | 0 (warn) |
| large-file-blocker | Write | Blocks files exceeding 800 lines | 2 (block) |
| doc-file-warning | Write | Warns about non-standard doc files | 0 (warn) |

### PostToolUse Hooks

| Hook | Matcher | What it does |
|------|---------|-------------|
| console-log-warning | Edit | Warns about debug statements in edited files |
| test-file-reminder | Write | Reminds to write tests for new source files |

### Disabling Hooks

**Method 1: Environment variable (recommended)**

```bash
# Disable specific hooks (comma-separated hook filenames without .js)
export DISABLED_HOOKS="block-no-verify,suggest-compact,doc-file-warning"
```

**Method 2: Override in ~/.claude/settings.json**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [],
        "description": "Override: disable all Write PreToolUse hooks"
      }
    ]
  }
}
```

**Method 3:** Edit `hooks.json` directly after installing the plugin to remove or comment out specific hook entries.

## Component Details

### Skills

#### Consult Experts

**Provides access to:**
- Product Manager - Product strategy and roadmap planning
- Tech Lead - Technical architecture and system design
- Code Reviewer - Code quality and best practices review (deep architectural review)
- System Design - Scalable system architecture

**Activation keywords:** `consult product`, `consult tech`, `expert advice`, `product strategy`

#### Skill Developer

**Meta-skill for creating skills**

**Topics:** Skill creation and structure, trigger patterns, enforcement levels, hook mechanisms, testing

**Activation keywords:** `skill development`, `create new skill`, `skill triggers`

#### Git Workflow

**Covers:** Branching strategies (GitHub Flow, Trunk-Based, GitFlow), conventional commits, PR workflow, merge vs rebase, conflict resolution, release management, anti-patterns

**Activation keywords:** `git workflow`, `commit convention`, `branching strategy`, `merge conflict`, `PR description`

### Agents

#### Business Strategist
Product roadmap planning, feature prioritization, market analysis, business model design.

#### Documentation Architect
Comprehensive developer-focused documentation with context gathering, API docs, README files, data flow diagrams.

#### Plan Reviewer
Architecture review, implementation plan analysis, risk assessment, best practices validation.

#### Refactor Planner
Refactoring strategies, tech debt analysis, SOLID violations detection, safe code restructuring.

#### Web Research Specialist
Technical solutions research, best practices, GitHub issues, library comparisons.

### Command Details

#### /code-review

Fast pre-commit quality gate. Checks security (CRITICAL), code quality (HIGH), and best practices (MEDIUM). Produces a severity report with verdict.

> For deep architectural reviews, use the consult-experts Code Reviewer persona instead.

#### /verify

Comprehensive codebase verification: build, type check, lint, tests, secret scan, debug statement audit, git status. Supports `quick`, `full`, `pre-commit`, and `pre-pr` modes.

#### /dev-docs-be

Creates comprehensive Technical Requirement Specifications (TRS) for backend features including component design, API specifications, database design, error handling, security considerations, testing strategy, and implementation phases with task breakdown.

**Output files** (in `dev/active/[task-name]/`):
- `[task-name]-plan.md` - Comprehensive technical specification
- `[task-name]-context.md` - Key files, decisions, dependencies
- `[task-name]-tasks.md` - Checklist for tracking progress

#### /dev-docs-update

Updates development documentation before context compaction for seamless continuation. Captures active task state, session context, and handoff notes.

## Perfect For

- Product planning and strategy
- Development plan review
- Refactoring and code modernization
- Technical research
- Creating custom skills
- Git workflow setup and management
- Pre-commit code review and verification
- Backend technical requirement specifications
- Context management across sessions

## Not Designed For

- Code execution or compilation
- Deployment automation
- Infrastructure management
- Database administration

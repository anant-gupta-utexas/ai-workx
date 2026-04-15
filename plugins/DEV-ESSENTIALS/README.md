# DEV-ESSENTIALS - Development Essentials Plugin

Development essentials with specialized agents for planning, documentation, and refactoring, git workflow patterns, code review and verification commands, backend TRS documentation, and 8 development quality hooks.

## What's Included

### Skills (3)
- **git-workflow** - Git workflow patterns including branching strategies, conventional commits, PR workflow, merge vs rebase, conflict resolution, and release management
- **lateral-thinking** - Break through development blocks with 5 thinking personas (Contrarian, Hacker, Simplifier, Researcher, Architect) that diagnose your stagnation pattern and reframe the problem
- **consult-experts** - Access specialized expert personas for product requirements (PRDs), technical requirements (TRDs), system design (SDDs), and code review

### Agents (4)
- **business-strategist** - Business strategy and product guidance for building products from 0 to 1
- **documentation-architect** - Create comprehensive, developer-focused documentation with context gathering from code and existing docs
- **plan-reviewer** - Review development plans before implementation
- **refactor-planner** - Create comprehensive refactoring strategies with brownfield-aware convention detection

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
/plugin install DEV-ESSENTIALS@claude-workspace-plugins
```

## Usage Examples

### Using Skills

**Git Workflow:**
```bash
"Help me set up a branching strategy for my project"
"What's the conventional commit format?"
"How should I resolve this merge conflict?"
"Create a PR description for my changes"
```

**Lateral Thinking (when stuck):**
```bash
"I'm stuck on this caching problem, nothing I try works"
"I keep going in circles on this auth flow"
"I need a different perspective on this architecture"
"Help me think about this from the contrarian angle"
```

**Consult Experts:**
```bash
"Consult product expert for help with my roadmap"
"Get tech lead advice on my system architecture"
"I need a code review from the expert reviewer"
"Consult system design expert for my distributed system"
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

#### Git Workflow

**Covers:** Branching strategies (GitHub Flow, Trunk-Based, GitFlow), conventional commits, PR workflow, merge vs rebase, conflict resolution, release management, anti-patterns

**Activation keywords:** `git workflow`, `commit convention`, `branching strategy`, `merge conflict`, `PR description`

#### Lateral Thinking

**5 thinking personas** that diagnose your stagnation pattern and reframe the problem from a fresh angle:

| Persona | Core Question | Best For |
|---------|--------------|----------|
| Contrarian | "What if the opposite were true?" | Challenging assumptions, inverting requirements |
| Hacker | "What constraints are actually real?" | Creative workarounds, prototype-first solutions |
| Simplifier | "What's the simplest thing that could work?" | Reducing complexity, removing unnecessary layers |
| Researcher | "What evidence do we actually have?" | Gathering facts, investigating root causes |
| Architect | "If we started over, would we build it this way?" | Structural problems, wrong decomposition |

**Activation keywords:** `stuck`, `blocked`, `can't figure out`, `lateral thinking`, `different perspective`, `unstuck`, `going in circles`

#### Consult Experts

**Provides access to 4 expert personas:**
- **Product Manager** - Product strategy, PRDs, user stories, success metrics
- **Tech Lead** - Technical requirements (TRDs), technical guidance, architecture decisions
- **System Design Specialist** - System architecture, SDDs, scalability, component design
- **Code Reviewer** - Code quality analysis, design decisions, system integration review

**Activation keywords:** `consult product`, `consult tech`, `expert advice`, `product strategy`, `code review expert`

### Agents

#### Business Strategist
Product roadmap planning, feature prioritization, market analysis, business model design.

#### Documentation Architect
Comprehensive developer-focused documentation with context gathering, API docs, README files, data flow diagrams.

#### Plan Reviewer
Architecture review, implementation plan analysis, risk assessment, best practices validation.

#### Refactor Planner
Refactoring strategies, tech debt analysis, SOLID violations detection, safe code restructuring. Includes brownfield-aware convention detection — scans for existing project conventions, config files, and established abstractions before recommending changes.

### Command Details

#### /code-review

Fast pre-commit quality gate. Checks security (CRITICAL), code quality (HIGH), and best practices (MEDIUM). Produces a severity report with verdict.

> For deep architectural reviews, use the consult-experts Code Reviewer persona.

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
- Expert consultation (Product Manager, Tech Lead, System Design, Code Reviewer)
- Development plan review
- Breaking through development blocks with lateral thinking
- Refactoring and code modernization
- Git workflow setup and management
- Pre-commit code review and verification
- Backend technical requirement specifications
- Context management across sessions

## Not Designed For

- Code execution or compilation
- Deployment automation
- Infrastructure management
- Database administration

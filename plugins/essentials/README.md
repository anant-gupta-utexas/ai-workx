# Essentials Plugin

Essential utilities for enhanced development workflow including specialized agents for planning and research, expert consultation skills, skill development tools, and intelligent hooks.

## What's Included

### Skills (2)
- **consult-experts** - Access specialized expert agents for business strategy, tech leadership, and UI/UX design
- **skill-developer** - Meta-skill for creating and managing Claude Code skills

### Agents (5)
- **business-strategist** - Business strategy and product guidance for building products from 0 to 1
- **documentation-architect** - Create comprehensive, developer-focused documentation with context gathering from code and existing docs
- **plan-reviewer** - Review development plans before implementation
- **refactor-planner** - Create comprehensive refactoring strategies
- **web-research-specialist** - Research technical issues and solutions online

### Commands (1)
- **dev-docs-update** - Update dev documentation before context compaction for seamless continuation

### Hooks (3)
- **skill-activation-prompt** - Auto-suggests relevant skills based on your work
- **post-tool-use-tracker** - Tracks file changes for context management
- **error-handling-reminder** - Reminds about error handling best practices

## Installation

```bash
# From your project directory
/plugin install essentials@claude-workspace-plugins
```

## Post-Installation Setup

### Install Hook Dependencies

```bash
cd ~/.claude/plugins/marketplaces/claude-workspace-plugins/plugins/essentials/hooks && npm install
```

## Usage Examples

### Using Skills

**Consult Experts:**
```bash
"Consult product expert for help with my roadmap"
"Get tech lead advice on my system architecture"
```

**Skill Development:**
```bash
"Help me create a new skill for code review"
"How do I configure skill triggers in skill-rules.json?"
"Show me how to add keywords to my skill"
```

### Using Agents Directly

**Business Strategy:**
```bash
"Use the business-strategist agent to help me plan my MVP features"
"Use the business-strategist agent to analyze my product roadmap"
```

**Documentation:**
```bash
"Use the documentation-architect agent to document my new billing service"
"Use the documentation-architect agent to create API docs for my endpoints"
```

**Plan Review:**
```bash
"Use the plan-reviewer agent to review my authentication implementation plan"
"Use the plan-reviewer agent to check my database migration strategy"
```

**Refactoring:**
```bash
"Use the refactor-planner agent to plan breaking down this large service"
"Use the refactor-planner agent to create a migration plan for Clean Architecture"
```

**Research:**
```bash
"Use the web-research-specialist agent to find best practices for file uploads"
"Use the web-research-specialist agent to research WebSocket implementation patterns"
```

### Using Commands

**Update Documentation:**
```bash
# Before context compaction/reset
/dev-docs-update

# With specific focus
/dev-docs-update authentication system changes and new middleware
```

The command will update:
1. Active task documentation in `/dev/active/`
2. Context files with current implementation state
3. Task files with completed/pending status
4. Capture session context and decisions

## Component Details

### Skills

#### Consult Experts

**Provides access to:**
- Product Manager - Product strategy and roadmap planning
- Tech Lead - Technical architecture and system design
- Code Reviewer - Code quality and best practices review
- System Design - Scalable system architecture

**Activation keywords:**
- `consult product`, `consult tech`, `consult code reviewer`
- `expert advice`, `product strategy`, `tech leadership`

#### Skill Developer

**Meta-skill for creating skills**

**Topics:**
- Skill creation and structure
- Trigger patterns (keywords, intents, file paths)
- Enforcement levels (block, suggest, warn)
- Hook mechanisms
- Testing and troubleshooting

**Activation keywords:**
- `skill development`, `skill-rules.json`
- `create new skill`, `skill triggers`, `configure skill`

**Resources:** 7 comprehensive guides on skill development

### Agents

#### Business Strategist

**Specializes in:**
- Product roadmap planning
- Feature prioritization
- Market analysis
- Business model design
- Go-to-market strategy
- New product planning and strategy

**When to use:**
- Planning new products or features
- Need help with product strategy
- Feature prioritization decisions
- Market analysis and validation

#### Documentation Architect

**Specializes in:**
- Comprehensive developer-focused documentation
- Context gathering from code and existing docs
- API documentation with examples
- README files following best practices
- Data flow diagrams and architecture overviews
- Testing documentation

**Methodology:**
1. **Discovery Phase** - Queries memory MCP, scans `/docs/` and `/dev/`, identifies source files
2. **Analysis Phase** - Understands implementation, identifies key concepts, recognizes patterns
3. **Documentation Phase** - Structures content logically, includes code examples, adds diagrams
4. **Quality Assurance** - Verifies accuracy, checks references, ensures consistency

**When to use:**
- Documenting new features or services
- Creating API documentation
- Updating existing documentation
- Building comprehensive developer guides
- Need architectural overviews
- Onboarding documentation

**Output includes:**
- Developer guides with clear explanations
- README files with setup and usage instructions
- API docs with endpoints, parameters, examples
- Data flow diagrams
- Testing documentation

#### Plan Reviewer

**Specializes in:**
- Architecture review
- Implementation plan analysis
- Risk assessment
- Identifying potential issues
- Suggesting improvements
- Best practices validation

**When to use:**
- Before starting major implementations
- Review complex system designs
- Validate database migration plans
- Check security and performance considerations

#### Refactor Planner

**Specializes in:**
- Creating comprehensive refactoring strategies
- Analyzing tech debt
- SOLID violations detection
- Mapping file dependencies
- Safe code restructuring
- Migration planning

**When to use:**
- Planning large-scale refactoring
- Migrating to new architecture patterns
- Breaking down large files/classes
- Modernizing legacy code

#### Web Research Specialist

**Specializes in:**
- Researching technical solutions
- Finding best practices
- GitHub issues and discussions
- Stack Overflow solutions
- Community knowledge
- Library comparisons

**When to use:**
- Debugging unusual errors
- Researching implementation approaches
- Finding solutions to technical problems
- Comparing libraries or frameworks

## Command Details

### dev-docs-update

**Purpose:** Update development documentation before context compaction to ensure seamless continuation after context reset

**What it updates:**

1. **Active Task Documentation** (`/dev/active/[task-name]/`)
   - `[task-name]-context.md` - Current state, decisions, files modified, blockers, next steps
   - `[task-name]-tasks.md` - Mark completed tasks, add new tasks, update priorities

2. **Session Context Capture**
   - Complex problems solved
   - Architectural decisions made
   - Bugs found and fixed
   - Integration points discovered
   - Testing approaches
   - Performance optimizations

3. **Memory Updates** (if applicable)
   - New patterns or solutions
   - Entity relationships
   - System behavior observations

4. **Unfinished Work Documentation**
   - Current work state when context limit approached
   - Partially completed features
   - Commands to run on restart
   - Temporary workarounds

5. **Handoff Notes**
   - Exact file and line being edited
   - Goal of current changes
   - Uncommitted changes
   - Test commands

**Usage:**
```bash
/dev-docs-update
/dev-docs-update <optional focus area>
```

**Example:**
```bash
/dev-docs-update authentication system changes and middleware implementation
```

**When to use:**
- Approaching context limits
- Before taking a break from complex work
- After major implementation milestones
- When switching between different features

### Hooks

#### Skill Activation Prompt Hook

**Purpose:** Auto-suggests relevant skills based on your work

**How it works:**
- Analyzes your prompts and file changes
- Suggests relevant skills automatically
- Loads skill resources when needed

**Benefits:**
- Skills activate at the right time
- No manual triggering needed
- Context-aware suggestions

#### Post Tool Use Tracker Hook

**Purpose:** Tracks file changes for context management

**How it works:**
- Monitors tool usage and file modifications
- Tracks which files have been changed
- Helps manage context and affected files

**Benefits:**
- Better context awareness
- Tracks implementation progress
- Useful for large changes across multiple files

#### Error Handling Reminder Hook

**Purpose:** Reminds about error handling best practices

**How it works:**
- Triggers when adding new API endpoints or functions
- Provides error handling reminders
- Encourages defensive programming

**Benefits:**
- Reduces bugs from missing error handling
- Promotes best practices
- Improves code quality

## Perfect For

- ✅ Product planning and strategy
- ✅ Development plan review
- ✅ Refactoring and code modernization
- ✅ Technical research
- ✅ Creating custom skills
- ✅ Enhanced development workflow
- ✅ New product development and planning
- ✅ Documentation creation and maintenance
- ✅ Context management across sessions

## Not Designed For

- ❌ Code execution or compilation
- ❌ Deployment automation
- ❌ Infrastructure management
- ❌ Database administration

## Hook Configuration

### Customizing Skill Activation

Edit `.claude/skills/skill-rules.json` to customize when skills activate:

```json
{
  "skills": {
    "consult-experts": {
      "promptTriggers": {
        "keywords": [
          "consult product",
          "expert advice",
          "product strategy"
        ]
      }
    },
    "skill-developer": {
      "promptTriggers": {
        "keywords": [
          "skill development",
          "create skill",
          "skill-rules.json"
        ]
      }
    }
  }
}
```

## Troubleshooting

### Hooks not working?

**Check:**
1. Hook dependencies installed: `cd hooks && npm install`
2. Hooks are configured in `.claude/hooks/`
3. Node.js and npx available in PATH

**Test manually:**
```bash
echo '{"session_id":"test","prompt":"your test prompt"}' | \
  npx tsx hooks/skill-activation-prompt.ts
```

### Skills not activating?

**Check:**
1. Using trigger keywords in prompts
2. `skill-rules.json` exists in `.claude/skills/`
3. Keywords match your prompts

### Agents not working?

**Verify:**
1. Using correct agent names
2. Asking Claude to "Use the [agent-name] agent"
3. Agent files exist in `.claude/agents/`

## License

MIT

---

**Essential tools for better development!** ⚡

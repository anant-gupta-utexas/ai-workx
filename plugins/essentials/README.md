# Essentials Plugin

Expert consultation skills, skill development tools, and web research agent for enhanced development workflow.

## What's Included

### Skills (2)
- **consult-experts** - Access specialized expert agents for business strategy, tech leadership, system design, and code review
- **skill-developer** - Meta-skill for creating and managing Claude Code skills

### Agents (1)
- **web-research-specialist** - Research technical issues and solutions online

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

**Skill Development:**
```bash
"Help me create a new skill for code review"
"How do I configure skill triggers?"
```

### Using Agents Directly

**Research:**
```bash
"Use the web-research-specialist agent to find best practices for file uploads"
```

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

### Agents

#### Web Research Specialist
Technical solutions research, best practices, GitHub issues, library comparisons.

## Perfect For

- Expert consultation and technical guidance
- Technical research and best practices discovery
- Creating custom skills
- Learning skill development patterns

## Not Designed For

- Code execution or compilation
- Deployment automation
- Infrastructure management
- Database administration

# Essentials Plugin

Skill development tools, wiki maintenance, and web research agent for enhanced development workflow.

## What's Included

### Skills (2)
- **skill-developer** - Meta-skill for creating and managing Claude Code skills
- **maintaining-wiki** - Ingest, query, lint, reduce, reflect, reweave, and manage a personal knowledge base / second-brain wiki under `docs/02_learning/`

> **Note:** The consult-experts skill (Product Manager, Tech Lead, System Design, Code Reviewer) has moved to the DEV-ESSENTIALS plugin.

### Agents (1)
- **web-research-specialist** - Research technical issues and solutions online

## Installation

```bash
# From your project directory
/plugin install essentials@claude-workspace-plugins
```

## Usage Examples

### Using Skills

**Skill Development:**
```bash
"Help me create a new skill for code review"
"How do I write a good skill description?"
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

### Agents

#### Web Research Specialist
Technical solutions research, best practices, GitHub issues, library comparisons.

## Perfect For

- Technical research and best practices discovery
- Creating custom skills
- Learning skill development patterns
- Managing a personal knowledge base / second-brain wiki
- Growing and maintaining a knowledge graph with reduce/reflect/reweave pipeline

## Not Designed For

- Code execution or compilation
- Deployment automation
- Infrastructure management
- Database administration

---
name: skill-developer
description: Create, improve, and optimize Claude Code skills. Use when building a new skill, editing an existing skill, structuring a SKILL.md, writing skill descriptions for better triggering, organizing reference files, understanding progressive disclosure, or optimizing skill performance. Also use when asking about skill anatomy, frontmatter fields, the 500-line rule, bundled resources, or how skills trigger in Claude Code.
---

# Skill Developer Guide

Guide for creating and improving skills in Claude Code, following Anthropic's best practices.

## Skill Anatomy

```
skill-name/
├── SKILL.md              (required — frontmatter + instructions)
└── Bundled Resources      (optional)
    ├── scripts/           Executable code for deterministic/repetitive tasks
    ├── references/        Docs loaded into context as needed
    └── assets/            Templates, icons, fonts used in output
```

### Progressive Disclosure

Skills use a three-tier loading system to manage context efficiently:

1. **Metadata** (name + description) — Always in context (~100 words). This is the primary trigger mechanism.
2. **SKILL.md body** — Loaded when skill activates. Keep under 500 lines.
3. **Bundled resources** — Loaded on demand. Unlimited size. Scripts can execute without being loaded into context.

Keep SKILL.md under 500 lines. When approaching this limit, move detailed content into `references/` with clear pointers about when to read each file. For large reference files (>300 lines), include a table of contents.

**Multi-domain organization** — when a skill supports multiple frameworks or variants, organize by domain so only the relevant reference is loaded:

```
cloud-deploy/
├── SKILL.md              (workflow + selection logic)
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```

---

## Creating a Skill

### Step 1: Capture Intent

Start by understanding what the skill should do. If the conversation already contains a workflow to capture, extract answers from context first.

1. What should this skill enable Claude to do?
2. When should it trigger? (what user phrases/contexts)
3. What's the expected output format?
4. Should we set up test cases? Skills with objectively verifiable outputs (file transforms, data extraction, code generation) benefit from test cases. Subjective skills (writing style, design) often don't.

Proactively ask about edge cases, input/output formats, example files, and dependencies before writing the skill.

### Step 2: Write the SKILL.md

**Frontmatter** (required fields):

```yaml
---
name: my-skill
description: What it does and when to trigger. Include specific contexts and phrases.
---
```

**Optional frontmatter fields** (Claude Code 2.1.0+):

| Field | Description |
|-------|-------------|
| `context: fork` | Run in isolated forked sub-agent |
| `agent: agent-name` | Specify which agent executes this skill |
| `once: true` | Execute only once per session |
| `allowed-tools` | YAML list of permitted tools |

**Body** — the actual instructions. Use imperative form. Structure with clear headings, lists, and code blocks.

### Step 3: Test and Iterate

Come up with 2-3 realistic test prompts — the kind of thing a real user would say, not sanitized one-liners. Share them with the user for confirmation, then run them.

After reviewing results:
- Improve the skill based on feedback
- Rerun test cases
- Repeat until the user is satisfied or feedback is empty

### Step 4: Optimize the Description

The `description` field is the primary mechanism that determines whether Claude invokes a skill. Claude tends to "undertrigger" — to not use skills when they'd be useful. Combat this by making descriptions slightly pushy:

**Weak:** "How to build dashboards to display data."

**Strong:** "How to build dashboards to display data. Use this skill whenever the user mentions dashboards, data visualization, internal metrics, or wants to display any kind of data, even if they don't explicitly ask for a 'dashboard.'"

Include both what the skill does AND specific contexts for when to use it. All "when to use" info belongs in the description, not in the body.

---

## Writing Guide

### Explain the Why

Today's LLMs are smart. They respond better to understanding intent than to rigid instructions. If you find yourself writing ALWAYS or NEVER in all caps, reframe it — explain the reasoning so the model understands why something matters. That's more effective than heavy-handed directives.

### Keep It Lean

Remove instructions that aren't pulling their weight. Read transcripts from test runs — if the skill makes the model waste time on unproductive steps, cut those parts.

### Generalize, Don't Overfit

When iterating on test cases, resist making fiddly changes that only fix specific examples. Skills are used across many prompts. If there's a stubborn issue, try different metaphors or recommend different working patterns rather than adding narrow constraints.

### Bundle Repeated Work

Read transcripts from test runs. If multiple runs independently create similar helper scripts or take the same multi-step approach, that's a signal to bundle the script in `scripts/` and tell the skill to use it.

### Output Format Pattern

```markdown
## Report structure
ALWAYS use this exact template:
# [Title]
## Executive summary
## Key findings
## Recommendations
```

### Examples Pattern

```markdown
## Commit message format
**Example 1:**
Input: Added user authentication with JWT tokens
Output: feat(auth): implement JWT-based authentication
```

---

## Frontmatter Reference

### Required Fields

| Field | Rules |
|-------|-------|
| `name` | Lowercase, hyphens. Prefer gerund form (e.g., `processing-pdfs`) |
| `description` | Max 1024 chars. Include all trigger keywords/phrases. Be pushy about when to trigger |

### Optional Fields (Claude Code 2.1.0+)

| Field | Type | Description |
|-------|------|-------------|
| `context` | `fork` | Run skill in isolated forked sub-agent context |
| `agent` | string | Specify which agent type executes the skill |
| `once` | boolean | Execute only once per session |
| `allowed-tools` | YAML list | Restrict which tools the skill can use |

### Platform Notes

- **Hot-reload**: Skills in `~/.claude/skills` or `.claude/skills` auto-reload when modified. No restart needed.
- **Merged model**: Slash commands and skills are conceptually merged (auto-discovered from their directories).
- **Hooks**: Hook execution timeout is 10 minutes, allowing complex analysis hooks.

---

## Templates

### Basic Skill

```markdown
---
name: my-skill
description: What this skill does. Use when the user mentions X, Y, or Z, or when working with A or B files, even if they don't explicitly ask for this skill.
---

# My Skill

## Purpose
What this skill helps accomplish and why it exists.

## Instructions
Step-by-step guidance in imperative form.

## Examples
Real code examples showing expected inputs and outputs.
```

### Skill with Optional Fields

```markdown
---
name: my-skill
description: What this skill does with trigger contexts.
context: fork
agent: specialist-agent
once: true
allowed-tools:
  - Read
  - Grep
  - Glob
---
```

### Multi-Domain Skill

```markdown
---
name: cloud-deploy
description: Deploy applications to cloud providers. Use when deploying to AWS, GCP, or Azure, setting up infrastructure, or configuring cloud services.
---

# Cloud Deploy

## Provider Selection
Determine which cloud provider the user needs, then read the appropriate reference:
- AWS: Read `references/aws.md`
- GCP: Read `references/gcp.md`
- Azure: Read `references/azure.md`

## Common Steps
Steps that apply regardless of provider.
```

---

## Checklist

When creating or reviewing a skill, verify:

- [ ] `SKILL.md` exists with proper frontmatter (`name` + `description`)
- [ ] Description is pushy — includes trigger phrases and contexts (max 1024 chars)
- [ ] SKILL.md body is under 500 lines
- [ ] Instructions use imperative form and explain "why" over rigid rules
- [ ] Reference files created for overflow content, with table of contents if >300 lines
- [ ] Real code examples included where appropriate
- [ ] Tested with 2-3 realistic user prompts
- [ ] No overfitting to specific test cases
- [ ] Repeated helper scripts bundled in `scripts/` if applicable
- [ ] Naming uses lowercase-hyphens, gerund form preferred

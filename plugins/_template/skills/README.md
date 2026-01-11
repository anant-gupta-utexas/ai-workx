# Skills

Place skill files in subdirectories: `skills/skill-name/SKILL.md`

## Skill Structure

Each skill requires:
1. A subdirectory with the skill name
2. A `SKILL.md` file with YAML frontmatter
3. Optional reference files for detailed documentation

Example: `skills/python-testing/SKILL.md`
```markdown
---
name: python-testing
description: Guidance for writing Python tests using pytest. Covers test structure, fixtures, mocking, and best practices.
---

# Python Testing

## Purpose
Provide comprehensive guidance for writing Python tests.

## When to Use
- Writing new test files
- Debugging failing tests
- Setting up test fixtures

## Key Practices
...
```

## Frontmatter Fields

### Required Fields
| Field | Description |
|-------|-------------|
| `name` | Skill identifier (kebab-case) |
| `description` | Comprehensive description with trigger keywords (max 1024 chars) |

### Optional Fields (Claude Code 2.1.0+)
| Field | Description | Example |
|-------|-------------|---------|
| `context` | Execution context | `context: fork` - Run in forked sub-agent |
| `agent` | Specify executing agent | `agent: code-reviewer` |
| `once` | Execute only once per session | `once: true` |
| `allowed-tools` | YAML-style tool list | See example below |

**Example with optional fields:**
```markdown
---
name: code-review
description: Automated code review skill
context: fork
agent: code-reviewer
once: true
allowed-tools:
  - Read
  - Grep
  - Glob
---
```

## Best Practices (from Anthropic)

✅ Keep SKILL.md under 500 lines
✅ Use progressive disclosure with reference files
✅ Include trigger keywords in description (max 1024 chars)
✅ Use gerund naming (e.g., "processing-data", "handling-errors")
✅ Add table of contents to reference files > 100 lines

## Auto-Activation

Skills can auto-activate based on:
- Keywords in user prompts
- File paths being edited
- Content patterns in files
- Intent patterns

Configure in `.claude/skills/skill-rules.json` if using skills outside plugins.

## Hot-Reload (Claude Code 2.1.0+)

Skills in `~/.claude/skills` or `.claude/skills` are automatically hot-reloaded when modified. No session restart required.

# Claude Workspace Plugins - Development Guide

Guide for moving skills, agents, commands, and hooks between plugins.

## Quick Reference

### Files to Update (7 files minimum)

1. Physical files (move)
2. Source `plugin.json` (remove entry)
3. Source `README.md` (remove docs)
4. Target `plugin.json` (add entry)
5. Target `README.md` (add docs)
6. `.claude-plugin/marketplace.json` (update both plugins)
7. Root `README.md` (update summaries)

### Component Types

| Type | File Extension | Location Pattern | Frontmatter Fields |
|------|---------------|------------------|--------------------|
| Skill | Directory with `SKILL.md` | `plugins/{plugin}/skills/{skill-name}/` | `name`, `description` |
| Agent | `.md` | `plugins/{plugin}/agents/{agent-name}.md` | `name`, `description`, `color` |
| Command | `.md` | `plugins/{plugin}/commands/{command-name}.md` | `description`, `argument-hint` |
| Hook | `.ts` or `.json` | `plugins/{plugin}/hooks/{hook-name}.ts` | N/A (TypeScript/JSON) |

## Moving Components

**Skills are directories** (contain `SKILL.md` + optional `resources/`), others are files.

```bash
# Move component
mv plugins/source/{type}/{component} plugins/target/{type}/{component}

# Update 7 files (see checklist above)
```

---

## Update Checklist

### Source Plugin
- [ ] `plugin.json` - No changes needed (Claude Code auto-discovers components)
- [ ] `README.md` - Remove from "What's Included", descriptions, examples, update counts

### Target Plugin
- [ ] `plugin.json` - No changes needed (Claude Code auto-discovers components)
- [ ] `README.md` - Add to "What's Included", descriptions, examples, update counts

### Marketplace & Root
- [ ] `.claude-plugin/marketplace.json` - Update both plugin descriptions and keywords
- [ ] `README.md` - Update all plugin sections

---

## plugin.json Manifest Schema

Claude Code auto-discovers skills, agents, commands, and hooks from the directory structure. The `plugin.json` is a simple manifest file:

```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "Brief plugin description",
  "author": {
    "name": "Author Name",
    "email": "author@example.com",
    "url": "https://github.com/author"
  },
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"]
}
```

### Supported Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | Yes | Unique identifier in kebab-case |
| `version` | string | No | Semantic versioning |
| `description` | string | No | Brief plugin description |
| `author` | object | No | Author info (name, email, url all optional) |
| `license` | string | No | License identifier (e.g., "MIT") |
| `keywords` | array | No | Search/discovery keywords |

**Important:** Do NOT include `category`, `components`, `post_install`, `tags`, or `dependencies` - Claude Code auto-discovers these.

---


## Troubleshooting

**Plugin installation fails with manifest validation errors:**
- Ensure `author` is an object: `"author": { "name": "Your Name" }`
- Remove unsupported fields: `category`, `components`, `post_install`, `tags`, `dependencies`
- Valid fields: `name`, `version`, `description`, `author`, `license`, `keywords`

**Skill not activating:**
- Ensure `SKILL.md` exists in the skill directory with frontmatter: `name` and `description`
- Check that the skill directory is in `plugins/{plugin}/skills/{skill-name}/`
- Claude Code auto-discovers skills—no `plugin.json` entries needed

**JSON validation:**
```bash
jq empty plugins/*/plugin.json && echo "✓ All plugins valid"
jq empty .claude-plugin/marketplace.json && echo "✓ Marketplace valid"
```

---

## Best Practices

- Move one component at a time
- Physical moves automatically discover components—no `plugin.json` updates needed
- Validate JSON after changes: `jq empty plugins/*/plugin.json`
- Keep descriptions consistent across all files (README.md and marketplace.json)
- Commit physical moves and doc updates together

## Frontmatter Templates

### Command
```markdown
---
description: Brief description
argument-hint: Example arguments
---
```

### Agent
```markdown
---
name: agent-name
description: Agent description
color: blue|green|red|purple|orange|white
---
```

### Skill (SKILL.md)
```markdown
---
name: skill-name
description: Comprehensive description with trigger conditions
---
```

**Note:** Skills are directories with `SKILL.md` + optional `resources/` folder.

---

## Useful Commands

```bash
# Find all components
find plugins -name "*.md" -path "*/agents/*"
find plugins -name "*.md" -path "*/commands/*"
find plugins -type d -path "*/skills/*" -depth 2

# Validate JSON
for f in plugins/*/plugin.json; do jq empty "$f" && echo "✓ $f"; done

# Search references
grep -r "component-name" plugins/ .claude-plugin/ README.md
```

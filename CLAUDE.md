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
| Skill | Directory with `SKILL.md` | `plugins/{plugin}/skills/{skill-name}/` | `name`, `description` + optional: `context`, `agent`, `once`, `allowed-tools` |
| Agent | `.md` | `plugins/{plugin}/agents/{agent-name}.md` | `name`, `description`, `color` |
| Command | `.md` | `plugins/{plugin}/commands/{command-name}.md` | `description`, `argument-hint` |
| Hook | `.py` + `hooks.json` | `plugins/{plugin}/hooks/{hook-name}.py` | N/A (Python scripts + JSON config) |

> **Note (Claude Code 2.1.3+):** Slash commands and skills are now conceptually merged. Both are auto-discovered from their respective directories.

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

**Hooks not loading (schema error):**
- `hooks.json` must use the **record format** with PascalCase event keys, not an array:
  ```json
  {
    "hooks": {
      "PreToolUse": [{ "matcher": "Bash", "hooks": [{ "type": "command", "command": "..." }] }],
      "PostToolUse": [...]
    }
  }
  ```
- Common mistake: `"hooks": [...]` (array) instead of `"hooks": {...}` (record/object)

**Hooks not found at runtime (path error):**
- Hook commands run with CWD set to the **user's project**, not the plugin directory
- Always use `${CLAUDE_PLUGIN_ROOT}` to reference scripts within the plugin:
  ```json
  { "type": "command", "command": "python3 ${CLAUDE_PLUGIN_ROOT}/hooks/my-hook.py" }
  ```
- Note: `CLAUDE_PLUGIN_ROOT` has a known bug where it's sometimes unset. If hit, use a fallback: `${CLAUDE_PLUGIN_ROOT:-$HOME/.claude/plugins/cache/...}`

**Hook command "node not found":**
- `/bin/sh` doesn't inherit nvm/fnm/volta PATH. Use `python3` instead of `node` for hook scripts — `python3` is available at `/usr/bin/python3` on macOS and most Linux systems
- All hook scripts in this repo use Python (stdlib only, no dependencies)

**JSON validation:**
```bash
jq empty plugins/*/plugin.json && echo "✓ All plugins valid"
jq empty .claude-plugin/marketplace.json && echo "✓ Marketplace valid"
jq empty plugins/*/hooks/hooks.json 2>/dev/null && echo "✓ All hooks.json valid"
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

**Required fields:**
```markdown
---
name: skill-name
description: Comprehensive description with trigger conditions
---
```

**With optional fields (Claude Code 2.1.0+):**
```markdown
---
name: skill-name
description: Comprehensive description with trigger conditions
context: fork        # Run in forked sub-agent context
agent: agent-name    # Specify which agent executes
once: true           # Execute only once per session
allowed-tools:       # YAML-style tool list
  - Read
  - Grep
  - Glob
---
```

| Optional Field | Description |
|----------------|-------------|
| `context: fork` | Run skill in isolated forked sub-agent |
| `agent` | Specify which agent type executes the skill |
| `once: true` | Hook/skill executes only once per session |
| `allowed-tools` | YAML-style list of allowed tools |

**Note:** Skills are directories with `SKILL.md` + optional `resources/` folder. Skills hot-reload automatically when modified (no restart needed).

### Hook (hooks.json + Python scripts)

Hooks are configured via `plugins/{plugin}/hooks/hooks.json` and executed as Python scripts. Claude Code auto-discovers `hooks.json` from the hooks directory.

**hooks.json format (record-based, PascalCase keys):**
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "python3 ${CLAUDE_PLUGIN_ROOT}/hooks/my-hook.py" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          { "type": "command", "command": "python3 ${CLAUDE_PLUGIN_ROOT}/hooks/another-hook.py" }
        ]
      }
    ]
  }
}
```

**Hook script protocol (stdin/stdout/stderr + exit code):**
- Reads JSON from **stdin** (tool invocation context)
- Writes to **stderr** for warnings/errors shown to user
- Echoes input back to **stdout** (or writes custom JSON for permission decisions)
- Exit **0** to allow, exit **2** to block

**Hook script template:**
```python
#!/usr/bin/env python3
import json, os, sys

def main():
    data = sys.stdin.read(1024 * 1024)
    try:
        disabled = os.environ.get("DISABLED_HOOKS", "").split(",")
        if "my-hook" in disabled:
            sys.stdout.write(data)
            return
        inp = json.loads(data)
        # ... inspection logic ...
        sys.stdout.write(data)
    except Exception as err:
        print(f"[Hook] my-hook error: {err}", file=sys.stderr)
        sys.stdout.write(data)

if __name__ == "__main__":
    main()
```

**Important conventions:**
- Use `python3` (not `node`) — available at `/usr/bin/python3` without PATH issues
- Use `${CLAUDE_PLUGIN_ROOT}` for all script paths (hooks run with CWD = user's project)
- Use only Python stdlib (no pip dependencies) for portability
- Support `DISABLED_HOOKS` env var for per-hook opt-out
- Supported event types: `PreToolUse`, `PostToolUse`, `SessionStart`, `SessionEnd`, `Stop`, `Notification`, `SubagentStart`, `SubagentStop`, `PreCompact`, `PostCompact`, `UserPromptSubmit`

---

## Useful Commands

```bash
# Find all components
find plugins -name "*.md" -path "*/agents/*"
find plugins -name "*.md" -path "*/commands/*"
find plugins -type d -path "*/skills/*" -depth 2
find plugins -name "*.py" -path "*/hooks/*"

# Validate JSON
for f in plugins/*/plugin.json; do jq empty "$f" && echo "✓ $f"; done
for f in plugins/*/hooks/hooks.json; do jq empty "$f" 2>/dev/null && echo "✓ $f"; done

# Search references
grep -r "component-name" plugins/ .claude-plugin/ README.md
```

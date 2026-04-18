# Plugin Creation Guide

Comprehensive guide for creating Claude Code plugins in this marketplace.

## Table of Contents

1. [Plugin Basics](#plugin-basics)
2. [Directory Structure](#directory-structure)
3. [Plugin Configuration](#plugin-configuration)
4. [Creating Agents](#creating-agents)
5. [Creating Commands](#creating-commands)
6. [Creating Skills](#creating-skills)
7. [Creating Hooks](#creating-hooks)
8. [Testing Plugins](#testing-plugins)
9. [Publishing Updates](#publishing-updates)

## Plugin Basics

A plugin is a collection of agents, commands, skills, and/or hooks packaged together. Each plugin:
- Lives in its own directory under `plugins/`
- Has a `plugin.json` manifest at the plugin root (not in `.claude-plugin/`)
- Can contain any combination of agents, commands, skills, and hooks
- Is registered in the marketplace's `.claude-plugin/marketplace.json`
- Components are **auto-discovered** from the directory structure — no need to list them in `plugin.json`

## Directory Structure

### Standard Plugin Layout

```
plugins/my-plugin/
├── plugin.json                # Required: Plugin metadata (at root, NOT in .claude-plugin/)
├── agents/                    # Optional: Agent definitions
│   ├── agent-one.md
│   └── agent-two.md
├── commands/                  # Optional: Slash commands
│   ├── command-one.md
│   └── command-two.md
├── hooks/                     # Optional: Hook scripts + config
│   ├── hooks.json             # Hook configuration (record format)
│   ├── my-pre-hook.py         # Python hook scripts
│   └── my-post-hook.py
├── skills/                    # Optional: Skills
│   ├── skill-one/
│   │   ├── SKILL.md
│   │   └── reference.md
│   └── skill-two/
│       └── SKILL.md
└── README.md                  # Recommended: Plugin documentation
```

### File Naming Conventions

- **Directories**: lowercase with hyphens (`my-plugin-name`)
- **Agents**: descriptive names (`python-expert.md`, `api-architect.md`)
- **Commands**: command names (`run-tests.md`, `deploy-staging.md`)
- **Skills**: subdirectories with `SKILL.md` (`error-handling/SKILL.md`)

## Plugin Configuration

### plugin.json Schema

The `plugin.json` lives at the **plugin root** (e.g., `plugins/my-plugin/plugin.json`), not inside a `.claude-plugin/` subdirectory. Claude Code auto-discovers all components from the directory structure, so `plugin.json` is purely metadata.

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Brief description of plugin purpose and capabilities",
  "author": {
    "name": "Your Name",
    "email": "email@example.com",
    "url": "https://github.com/username"
  },
  "license": "MIT",
  "keywords": ["python", "testing", "development"]
}
```

**Required Fields:**
- `name`: Unique plugin identifier (lowercase, hyphens)

**Optional Fields:**
- `version`: Semantic version (MAJOR.MINOR.PATCH)
- `description`: Clear, concise description (1-2 sentences)
- `author`: Object with optional `name`, `email`, `url` fields
- `license`: License identifier (e.g., "MIT")
- `keywords`: Array of search/discovery keywords

**Important:** Do NOT include `category`, `components`, `post_install`, `tags`, or `dependencies` — Claude Code auto-discovers components and these fields cause validation errors.

### Marketplace Registration

Add plugin to `.claude-plugin/marketplace.json`:

```json
{
  "name": "ai-workx",
  "description": "Personal plugin collection",
  "version": "1.0.0",
  "author": "Your Name",
  "plugins": [
    {
      "name": "my-plugin",
      "path": "plugins/my-plugin",
      "description": "Same as plugin.json description",
      "version": "1.0.0",
      "tags": ["python", "testing"],
      "enabled": true
    }
  ]
}
```

## Creating Agents

Agents are specialized AI personalities defined in markdown files.

### Agent File Structure

```markdown
# Senior Python Developer

You are a senior Python developer with expertise in:
- Python 3.10+ features and best practices
- FastAPI and async programming
- pytest and testing strategies
- Type hints and mypy

## Your Approach

When writing Python code, you:
1. Always include type hints
2. Write comprehensive docstrings
3. Follow PEP 8 style guidelines
4. Prefer composition over inheritance
5. Use context managers for resource handling

## Code Style

- Use descriptive variable names
- Keep functions focused and small
- Write self-documenting code
- Include error handling
- Add logging for important operations

## Testing Philosophy

- Write tests first (TDD when appropriate)
- Aim for high coverage on critical paths
- Use fixtures for test setup
- Mock external dependencies
- Test edge cases and error conditions
```

### Best Practices

- **Be Specific**: Define clear expertise areas
- **Provide Guidance**: Include code style preferences
- **Set Tone**: Establish communication style
- **Include Examples**: Show expected patterns
- **Avoid Conflicts**: Don't contradict base Claude behavior

## Creating Commands

Commands are reusable prompt templates that become slash commands.

### Command File Structure

File: `commands/run-tests.md`

```markdown
Run the test suite using pytest. Follow these steps:

1. Run pytest with coverage: `pytest --cov=src --cov-report=term-missing`
2. Report any failing tests with full error details
3. If tests fail, analyze the failures and suggest fixes
4. Verify coverage is above 80% for critical modules
5. Suggest any missing test cases you notice
```

This creates `/run-tests` command that expands to the full prompt.

### Command Best Practices

- **Clear Instructions**: Be explicit about steps
- **Context Aware**: Reference project structure
- **Actionable**: Provide concrete tasks
- **Structured**: Use numbered lists or checklists
- **Focused**: One clear purpose per command

### Command Examples

**Deployment Command** (`commands/deploy.md`):
```markdown
Deploy the application to staging:

1. Run all tests and ensure they pass
2. Build the production bundle
3. Run the deployment script: `npm run deploy:staging`
4. Verify deployment health checks
5. Report deployment status and any issues
```

**Code Review Command** (`commands/review.md`):
```markdown
Perform a thorough code review focusing on:

- Code quality and readability
- Potential bugs or edge cases
- Performance implications
- Security vulnerabilities
- Test coverage
- Documentation completeness

Provide specific feedback with line references.
```

## Creating Skills

Skills are the most sophisticated plugin component, supporting auto-activation and progressive disclosure.

### Skill File Structure

Directory: `skills/python-testing/`

**SKILL.md** (Required):
```markdown
---
name: python-testing
description: Comprehensive guide for Python testing with pytest. Covers fixtures, mocking, parametrization, and best practices. Triggers on pytest, testing, test files.
---

# Python Testing Guide

## Purpose

Provide expert guidance for writing effective Python tests using pytest.

## When to Use

- Creating new test files
- Debugging test failures
- Setting up test fixtures
- Implementing mocks and patches
- Parametrizing test cases

## Key Concepts

### Test Structure

Follow the Arrange-Act-Assert pattern:
```python
def test_user_creation():
    # Arrange
    user_data = {"name": "Alice", "email": "alice@example.com"}

    # Act
    user = create_user(user_data)

    # Assert
    assert user.name == "Alice"
    assert user.email == "alice@example.com"
```

### Fixtures

Use fixtures for test setup:
```python
@pytest.fixture
def database():
    db = Database()
    db.connect()
    yield db
    db.disconnect()

def test_query(database):
    result = database.query("SELECT * FROM users")
    assert len(result) > 0
```

## Best Practices

1. **One assertion per test** (when possible)
2. **Descriptive test names** (`test_user_creation_with_valid_data`)
3. **Independent tests** (no shared state)
4. **Fast tests** (mock external dependencies)
5. **Clear failure messages** (use assert with descriptive messages)

## Common Patterns

See [PATTERNS.md](PATTERNS.md) for detailed examples.
```

**PATTERNS.md** (Reference file):
```markdown
# Python Testing Patterns

## Table of Contents

1. [Parametrized Tests](#parametrized-tests)
2. [Mocking](#mocking)
3. [Async Tests](#async-tests)
4. [Exception Testing](#exception-testing)

## Parametrized Tests

Test multiple scenarios efficiently:
```python
@pytest.mark.parametrize("input,expected", [
    ("hello", "HELLO"),
    ("world", "WORLD"),
    ("", ""),
])
def test_uppercase(input, expected):
    assert uppercase(input) == expected
```

## Mocking

... (detailed examples)
```

### Skill Best Practices (Anthropic Guidelines)

✅ **500-Line Rule**: Keep SKILL.md under 500 lines
✅ **Progressive Disclosure**: Use reference files for details
✅ **Rich Descriptions**: Include trigger keywords in frontmatter
✅ **Table of Contents**: Add to reference files > 100 lines
✅ **Gerund Naming**: Prefer verb+ing (`processing-data`, `handling-errors`)
✅ **Test First**: Build with 3+ real scenarios before documenting

### Skill Auto-Activation

Skills can activate based on:

1. **Keywords**: Explicit terms in user prompts
2. **Intent Patterns**: Regex matching user intentions
3. **File Paths**: Glob patterns for file locations
4. **Content Patterns**: Regex in file contents

**Note**: Auto-activation is driven by the skill's SKILL.md description field. Include trigger keywords in the description for Claude Code to auto-discover and activate skills.

## Creating Hooks

Hooks are Python scripts that run automatically before or after Claude Code tool invocations. They can inspect, warn, or block actions.

### Hook Architecture

Hooks consist of two parts:
1. **`hooks.json`** — Configuration file in `plugins/{plugin}/hooks/` that maps events and tool matchers to scripts
2. **Python scripts** — Executable scripts that implement the hook logic

### hooks.json Format

**Critical:** The `hooks` field must be a **record/object** keyed by PascalCase event type, NOT an array.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "python3 ${CLAUDE_PLUGIN_ROOT}/hooks/my-guard.py" }
        ]
      },
      {
        "matcher": "Write",
        "hooks": [
          { "type": "command", "command": "python3 ${CLAUDE_PLUGIN_ROOT}/hooks/file-check.py" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          { "type": "command", "command": "python3 ${CLAUDE_PLUGIN_ROOT}/hooks/post-edit.py" }
        ]
      }
    ]
  }
}
```

**Key rules:**
- Use `python3` (not `node`) — `/usr/bin/python3` is reliably available from `/bin/sh` on macOS/Linux
- Use `${CLAUDE_PLUGIN_ROOT}` for all script paths — hooks run with CWD = user's project directory
- Matcher supports `|` for multiple tools: `"Edit|Write"`
- Supported event keys: `PreToolUse`, `PostToolUse`, `SessionStart`, `SessionEnd`, `Stop`, `Notification`, `SubagentStart`, `SubagentStop`, `PreCompact`, `PostCompact`, `UserPromptSubmit`

### Hook Script Protocol

Every hook script follows the same stdin/stdout/stderr + exit code protocol:

```python
#!/usr/bin/env python3
"""
PreToolUse Hook: Describe What It Does

Exit codes:
  0 - Allow
  2 - Block
"""

import json
import os
import sys

MAX_STDIN = 1024 * 1024

def main():
    data = sys.stdin.read(MAX_STDIN)

    try:
        # Support per-hook opt-out via DISABLED_HOOKS env var
        disabled = os.environ.get("DISABLED_HOOKS", "").split(",")
        if "my-hook-name" in disabled:
            sys.stdout.write(data)
            return

        inp = json.loads(data)
        command = inp.get("tool_input", {}).get("command", "")

        # Inspection logic here...

        if should_block:
            print("[Hook] BLOCKED: reason", file=sys.stderr)
            sys.stdout.write(data)
            sys.exit(2)

        sys.stdout.write(data)
    except Exception as err:
        print(f"[Hook] my-hook-name error: {err}", file=sys.stderr)
        sys.stdout.write(data)

if __name__ == "__main__":
    main()
```

### Hook Input Fields

The JSON piped to stdin includes:

| Field | Description |
|-------|-------------|
| `tool_name` | Name of the tool (e.g., "Bash", "Write", "Edit") |
| `tool_input` | Tool-specific arguments (e.g., `command`, `file_path`, `content`, `new_string`) |
| `session_id` | Current session identifier |
| `cwd` | Current working directory |

### Hook Best Practices

- **Use only Python stdlib** — no pip dependencies, for maximum portability across user machines
- **Always echo stdin to stdout** — even on error, write the data back so Claude Code can proceed
- **Support `DISABLED_HOOKS`** — let users opt out of individual hooks via environment variable
- **Prefix stderr with `[Hook]`** — makes it clear which messages come from hooks
- **Keep hooks fast** — they run on every matching tool invocation; avoid expensive I/O
- **Use exit code 2 to block, 0 to allow** — other exit codes are treated as errors

### Common Patterns

**Blocking a dangerous command:**
```python
if "git push --force" in command:
    print("[Hook] BLOCKED: force push not allowed", file=sys.stderr)
    sys.stdout.write(data)
    sys.exit(2)
```

**Warning without blocking:**
```python
if "console.log" in new_string:
    print("[Hook] WARNING: debug statement detected", file=sys.stderr)
sys.stdout.write(data)  # exit 0, allow
```

**Auto-approving a permission (PreToolUse):**
```python
auth_response = json.dumps({
    "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "allow",
        "permissionDecisionReason": "Auto-approved by plugin"
    }
})
sys.stdout.write(auth_response)
```

## Testing Plugins

### Local Testing

1. **Add local marketplace**:
   ```bash
   /plugin marketplace add file:///absolute/path/to/ai-workx
   ```

2. **Install plugin**:
   ```bash
   /plugin install my-plugin
   ```

3. **Test components**:
   - **Agents**: Start chat and verify agent behavior
   - **Commands**: Execute `/command-name` and verify output
   - **Skills**: Trigger with relevant prompts

4. **Verify installation**:
   ```bash
   /plugin list
   ```

### Testing Checklist

- [ ] Plugin installs without errors
- [ ] All agents load correctly
- [ ] All commands execute as expected
- [ ] Skills contain valid frontmatter
- [ ] Hooks load without errors (`/reload-plugins` shows no hook errors)
- [ ] Hook scripts work from `/bin/sh`: `/bin/sh -c "python3 hooks/my-hook.py" < test-input.json`
- [ ] `hooks.json` uses record format (object, not array) with PascalCase keys
- [ ] Hook scripts use `${CLAUDE_PLUGIN_ROOT}` paths, not relative paths
- [ ] README.md is clear and helpful
- [ ] `plugin.json` has correct metadata (no `tags`, `dependencies`, or `components` fields)
- [ ] No file path or naming issues

## Publishing Updates

### Version Bumping

Follow semantic versioning:
- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backwards compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

Update version in:
1. `plugins/my-plugin/plugin.json`
2. `.claude-plugin/marketplace.json` (for that plugin entry)

### Git Workflow

```bash
# Make changes
git add .
git commit -m "feat: add new Python testing skill"
git push origin main
```

### Changelog

Keep a CHANGELOG.md for each plugin:

```markdown
# Changelog

## [1.1.0] - 2024-01-15

### Added
- New skill for async testing patterns
- Command for running specific test files

### Fixed
- Fixed fixture example in testing guide

## [1.0.0] - 2024-01-01

### Added
- Initial release with Python testing skill
```

## Tips and Tricks

### Plugin Organization

- **Single-purpose plugins**: Focus on one domain (python-tools, k8s-ops)
- **Related functionality**: Group cohesive features together
- **Clear boundaries**: Avoid overlap between plugins
- **Logical naming**: Use descriptive, searchable names

### Documentation

- **Plugin README**: Installation, usage, examples
- **Component docs**: Explain each agent/command/skill
- **Examples**: Show real-world usage
- **Troubleshooting**: Common issues and solutions

### Maintenance

- **Regular updates**: Keep skills current with best practices
- **Community feedback**: Incorporate user suggestions
- **Dependencies**: Monitor and update dependencies
- **Testing**: Re-test after Claude Code updates

## Examples

### Minimal Plugin

Simple command-only plugin:

```
plugins/quick-deploy/
├── plugin.json
├── commands/
│   ├── deploy-staging.md
│   └── deploy-production.md
└── README.md
```

### Comprehensive Plugin

Full-featured plugin with all component types:

```
plugins/python-development/
├── plugin.json
├── agents/
│   ├── python-expert.md
│   └── testing-specialist.md
├── commands/
│   ├── run-tests.md
│   ├── check-types.md
│   └── lint-code.md
├── hooks/
│   ├── hooks.json
│   ├── block-dangerous-commands.py
│   └── warn-debug-statements.py
├── skills/
│   ├── python-testing/
│   │   ├── SKILL.md
│   │   └── patterns.md
│   └── error-handling/
│       └── SKILL.md
└── README.md
```

## Resources

- [Official Plugin Docs](https://code.claude.com/docs/en/plugins)
- [Skills Documentation](https://code.claude.com/docs/en/skills)
- [Marketplace Example](https://github.com/wshobson/agents)

---

**Last Updated**: 2026-04-15
**Maintainer**: Anant Gupta

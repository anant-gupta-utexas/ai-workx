# Plugin Creation Guide

Comprehensive guide for creating Claude Code plugins in this marketplace.

## Table of Contents

1. [Plugin Basics](#plugin-basics)
2. [Directory Structure](#directory-structure)
3. [Plugin Configuration](#plugin-configuration)
4. [Creating Agents](#creating-agents)
5. [Creating Commands](#creating-commands)
6. [Creating Skills](#creating-skills)
7. [Testing Plugins](#testing-plugins)
8. [Publishing Updates](#publishing-updates)

## Plugin Basics

A plugin is a collection of agents, commands, and/or skills packaged together. Each plugin:
- Lives in its own directory under `plugins/`
- Has a `.claude-plugin/plugin.json` manifest
- Can contain any combination of agents, commands, and skills
- Is registered in the marketplace's `.claude-plugin/marketplace.json`

## Directory Structure

### Standard Plugin Layout

```
plugins/my-plugin/
├── .claude-plugin/
│   └── plugin.json           # Required: Plugin metadata
├── agents/                    # Optional: Agent definitions
│   ├── agent-one.md
│   └── agent-two.md
├── commands/                  # Optional: Slash commands
│   ├── command-one.md
│   └── command-two.md
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

```json
{
  "name": "my-plugin",
  "description": "Brief description of plugin purpose and capabilities",
  "version": "1.0.0",
  "author": "Your Name <email@example.com>",
  "tags": ["python", "testing", "development"],
  "dependencies": [],
  "repository": "https://github.com/username/claude-workspace-plugins",
  "license": "MIT"
}
```

**Required Fields:**
- `name`: Unique plugin identifier (lowercase, hyphens)
- `description`: Clear, concise description (1-2 sentences)
- `version`: Semantic version (MAJOR.MINOR.PATCH)

**Optional Fields:**
- `author`: Your name and/or email
- `tags`: Categorization and discoverability
- `dependencies`: Other plugins this depends on
- `repository`: Link to source
- `license`: License identifier

### Marketplace Registration

Add plugin to `.claude-plugin/marketplace.json`:

```json
{
  "name": "claude-workspace-plugins",
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

## Testing Plugins

### Local Testing

1. **Add local marketplace**:
   ```bash
   /plugin marketplace add file:///absolute/path/to/claude-workspace-plugins
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
- [ ] README.md is clear and helpful
- [ ] plugin.json has correct metadata
- [ ] No file path or naming issues
- [ ] Dependencies are satisfied

## Publishing Updates

### Version Bumping

Follow semantic versioning:
- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backwards compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

Update version in:
1. `plugins/my-plugin/.claude-plugin/plugin.json`
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
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── deploy-staging.md
│   └── deploy-production.md
└── README.md
```

### Comprehensive Plugin

Full-featured plugin:

```
plugins/python-development/
├── .claude-plugin/
│   └── plugin.json
├── agents/
│   ├── python-expert.md
│   └── testing-specialist.md
├── commands/
│   ├── run-tests.md
│   ├── check-types.md
│   └── lint-code.md
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

**Last Updated**: 2024-11-06
**Maintainer**: Your Name

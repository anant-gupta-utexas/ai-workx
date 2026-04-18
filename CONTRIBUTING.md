# Contributing Guidelines

Guidelines for adding and maintaining plugins in this repository.

## Philosophy

This is a personal plugin collection, but organized professionally for easy maintenance and sharing.

## Adding a New Plugin

### Before You Start

1. **Check for duplicates**: Ensure similar functionality doesn't exist
2. **Define scope**: Clear, focused purpose
3. **Plan components**: Which agents/commands/skills do you need?

### Plugin Creation Process

1. **Copy template**
   ```bash
   cp -r plugins/_template plugins/your-plugin-name
   ```

2. **Update metadata**
   - Edit `.claude-plugin/plugin.json`
   - Choose appropriate tags
   - Set version to 1.0.0

3. **Create components**
   - Add agents to `agents/` directory
   - Add commands to `commands/` directory
   - Add skills to `skills/` directory (with subdirectories)

4. **Write documentation**
   - Create comprehensive README.md
   - Include usage examples
   - Document any dependencies

5. **Register plugin**
   - Add entry to `.claude-plugin/marketplace.json`
   - Ensure all fields are filled correctly

6. **Test thoroughly**
   - Install locally using file:// marketplace
   - Test all agents, commands, and skills
   - Verify no errors or conflicts

7. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add your-plugin-name plugin"
   git push
   ```

## Code Standards

### File Naming

- **Directories**: lowercase-with-hyphens
- **Files**: lowercase-with-hyphens.md
- **Skills**: SKILL.md (uppercase, per convention)

### Documentation

- **README.md**: Required for each plugin
- **Clear descriptions**: What, why, and how
- **Examples**: Show real usage
- **Version history**: Maintain CHANGELOG.md

### JSON Formatting

- **Indentation**: 2 spaces
- **Validation**: Use `jq` to validate before committing
  ```bash
  jq . .claude-plugin/marketplace.json
  ```

## Versioning

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes (1.0.0 → 2.0.0)
- **MINOR**: New features, backwards compatible (1.0.0 → 1.1.0)
- **PATCH**: Bug fixes (1.0.0 → 1.0.1)

### When to Bump Versions

**MAJOR (Breaking)**:
- Removing agents, commands, or skills
- Changing command behavior significantly
- Renaming components

**MINOR (Feature)**:
- Adding new agents, commands, or skills
- Enhancing existing functionality
- Adding new reference documentation

**PATCH (Fix)**:
- Fixing errors in documentation
- Correcting skill frontmatter
- Updating examples

## Commit Messages

Use conventional commits:

```
feat: add new Python testing skill
fix: correct agent prompt in backend developer
docs: update README with new commands
chore: update dependencies
refactor: reorganize skill reference files
```

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, whitespace
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

## Quality Checklist

Before committing a new plugin:

- [ ] plugin.json has all required fields
- [ ] Version number is correct
- [ ] Tags are relevant and helpful
- [ ] README.md is comprehensive
- [ ] All commands have clear descriptions
- [ ] Skills follow 500-line rule
- [ ] Skills have proper YAML frontmatter
- [ ] JSON files are valid (checked with jq)
- [ ] No syntax errors in markdown
- [ ] Tested locally before committing
- [ ] Committed with appropriate message
- [ ] marketplace.json updated correctly

## Skill-Specific Guidelines

### SKILL.md Files

✅ **Must Have**:
- YAML frontmatter with name and description
- Clear "Purpose" section
- "When to Use" guidance
- Practical examples

❌ **Avoid**:
- More than 500 lines (use reference files)
- Vague or generic content
- Duplicate information from other skills
- Missing trigger keywords in description

### Reference Files

- Use for detailed information
- Add table of contents if > 100 lines
- Link from SKILL.md
- Keep focused on one aspect

## Plugin Organization

### Single Responsibility

Each plugin should have a clear, focused purpose:

✅ **Good**:
- `python-development` - Python-specific tools
- `kubernetes-ops` - Kubernetes operations
- `api-testing` - API testing workflows

❌ **Too Broad**:
- `development-tools` - Too generic
- `all-my-stuff` - No clear scope

### Component Balance

Aim for 2-8 components per plugin (agents + commands + skills):

- **Too few** (1): Consider if it needs to be a plugin
- **Just right** (2-8): Focused and maintainable
- **Too many** (10+): Consider splitting into multiple plugins

## Maintenance

### Regular Tasks

- **Monthly**: Review and update documentation
- **Quarterly**: Check for outdated practices
- **As needed**: Update for Claude Code changes

### Deprecation

If removing a plugin:

1. Mark as deprecated in marketplace.json
2. Update README with deprecation notice
3. Suggest alternatives
4. Keep for 2-3 releases before removing

## Testing

### Local Testing

Always test locally before pushing:

```bash
# Add local marketplace
/plugin marketplace add file:///absolute/path/to/ai-workx

# Install and test
/plugin install your-plugin-name

# Verify each component works
```

### Test Cases

- [ ] Plugin installs without errors
- [ ] All commands execute correctly
- [ ] Skills load with valid frontmatter
- [ ] Agents provide expected behavior
- [ ] No conflicts with other plugins
- [ ] Documentation is accurate

## File Structure Reference

```
ai-workx/
├── .claude-plugin/
│   └── marketplace.json          # Central registry
├── plugins/
│   ├── _template/                # Template (don't modify)
│   └── your-plugin/
│       ├── .claude-plugin/
│       │   └── plugin.json       # Plugin metadata
│       ├── agents/               # Optional
│       │   └── *.md
│       ├── commands/             # Optional
│       │   └── *.md
│       ├── skills/               # Optional
│       │   └── skill-name/
│       │       ├── SKILL.md
│       │       └── reference.md
│       ├── CHANGELOG.md          # Recommended
│       └── README.md             # Required
├── docs/
│   ├── PLUGIN-CREATION-GUIDE.md
│   └── QUICK-START.md
├── .gitignore
├── CONTRIBUTING.md
└── README.md
```

## Getting Help

Questions or issues:

1. Check existing plugins for examples
2. Review documentation in `docs/`
3. Look at the template in `plugins/_template/`
4. Check [official docs](https://code.claude.com/docs/en/plugins)

---

**Remember**: This is your personal collection. These guidelines help keep it organized, but feel free to adapt to your needs!

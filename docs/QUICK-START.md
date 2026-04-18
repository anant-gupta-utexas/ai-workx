# Quick Start Guide

Get started creating your first plugin in 5 minutes.

## Step 1: Create Your Plugin

```bash
# Copy the template
cp -r plugins/_template plugins/my-first-plugin

# Navigate to the plugin
cd plugins/my-first-plugin
```

## Step 2: Configure Plugin

Edit `.claude-plugin/plugin.json`:

```json
{
  "name": "my-first-plugin",
  "description": "My personal development tools",
  "version": "1.0.0",
  "author": "Your Name",
  "tags": ["personal", "tools"]
}
```

## Step 3: Add a Simple Command

Create `commands/hello.md`:

```markdown
Say hello and show the current date and time. Be friendly and enthusiastic!
```

## Step 4: Register in Marketplace

Edit `.claude-plugin/marketplace.json` and add to the `plugins` array:

```json
{
  "name": "ai-workx",
  "description": "Personal collection of Claude Code plugins, skills, and agents",
  "version": "1.0.0",
  "author": "Your Name",
  "plugins": [
    {
      "name": "my-first-plugin",
      "path": "plugins/my-first-plugin",
      "description": "My personal development tools",
      "version": "1.0.0",
      "tags": ["personal", "tools"],
      "enabled": true
    }
  ]
}
```

## Step 5: Test Locally

```bash
# In Claude Code, add your local marketplace
/plugin marketplace add file:///Users/anant/PersonalProjects/ai-workx

# Install your plugin
/plugin install my-first-plugin

# Try your command
/hello
```

## Step 6: Publish to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Add my first plugin"

# Create a repository on GitHub, then:
git remote add origin git@github.com:yourusername/ai-workx.git
git branch -M main
git push -u origin main
```

## Step 7: Share with Others

Now anyone can use your plugins:

```bash
/plugin marketplace add yourusername/ai-workx
/plugin install my-first-plugin
```

## Next Steps

- **Add an Agent**: See `plugins/_template/agents/README.md`
- **Create a Skill**: See `plugins/_template/skills/README.md`
- **Read the Full Guide**: See `docs/PLUGIN-CREATION-GUIDE.md`
- **Browse Examples**: Check out [wshobson/agents](https://github.com/wshobson/agents)

## Tips

1. **Start Simple**: Begin with commands, then add agents and skills
2. **Test Often**: Use local marketplace for rapid iteration
3. **Document Well**: Clear READMEs help future you
4. **Version Carefully**: Follow semantic versioning
5. **Organize Logically**: Group related functionality

## Common Issues

### Plugin Not Found
- Check marketplace.json syntax (must be valid JSON)
- Verify plugin path is correct
- Ensure plugin.json exists in plugin directory

### Command Not Working
- Verify .md file is in commands/ directory
- Check file name matches command you're trying to use
- Ensure marketplace was refreshed after changes

### Installation Fails
- Check for typos in plugin name
- Verify all required fields in plugin.json
- Look for JSON syntax errors

## Getting Help

- Check the [full documentation](PLUGIN-CREATION-GUIDE.md)
- Review the [template files](../plugins/_template/)
- Look at [example plugins](https://github.com/wshobson/agents)

# Essentials Plugin Hooks

This directory contains hooks that enhance the Claude Code development experience with skill suggestions, file tracking, and error handling reminders.

## Structure

Following Anthropic's official hook pattern:

```
hooks/
├── hooks.json                    # Hook registration manifest
├── hooks-handlers/               # Handler scripts
│   ├── skill-activation-prompt.sh
│   ├── post-tool-use-tracker.sh
│   └── error-handling-reminder.sh
├── skill-activation-prompt.ts    # TypeScript implementation
├── error-handling-reminder.ts    # TypeScript implementation
├── package.json                  # Hook dependencies
└── tsconfig.json                 # TypeScript config
```

## Hook Types

### 1. UserPromptSubmit Hook
**Handler**: `hooks-handlers/skill-activation-prompt.sh`
**Implementation**: `skill-activation-prompt.ts`

Automatically suggests relevant skills based on user prompts by:
- Reading skill rules from `.claude/skills/skill-rules.json`
- Matching user prompts against skill trigger patterns
- Outputting skill activation suggestions

### 2. PostToolUse Hook
**Handler**: `hooks-handlers/post-tool-use-tracker.sh`

Tracks file changes for context management by:
- Detecting which repo/directory was edited
- Logging edited files to `.claude/tsc-cache/`
- Storing build commands for affected repos
- Supporting monorepo structures

### 3. Stop Hook
**Handler**: `hooks-handlers/error-handling-reminder.sh`
**Implementation**: `error-handling-reminder.ts`

Reminds developers about error handling best practices after editing backend/frontend code.

## Key Features

### Uses `${CLAUDE_PLUGIN_ROOT}`
All handlers use `${CLAUDE_PLUGIN_ROOT}` to reference the plugin directory, making them portable and eliminating the need for project-specific copies.

### Zero Project Configuration
Hooks run directly from the plugin directory without requiring:
- Copying files to each project
- Installing dependencies per-project
- Project-specific configuration

### Dependencies
TypeScript handlers require:
- `tsx` - TypeScript execution
- `typescript` - TypeScript compiler
- `@types/node` - Node.js type definitions

Install once in the plugin directory:
```bash
cd hooks && npm install
```

## How It Works

1. **hooks.json** registers hooks with Claude Code
2. Each hook type points to a handler script in `hooks-handlers/`
3. Handlers use `${CLAUDE_PLUGIN_ROOT}` to navigate to the hooks directory
4. TypeScript implementations are executed via `npx tsx`

## Example Hook Registration

```json
{
  "UserPromptSubmit": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "${CLAUDE_PLUGIN_ROOT}/hooks/hooks-handlers/skill-activation-prompt.sh"
        }
      ]
    }
  ]
}
```

## Testing

To test if hooks are working:

1. **UserPromptSubmit**: Type a prompt related to your skills (e.g., "How do I create a controller?")
2. **PostToolUse**: Edit a file and check `.claude/tsc-cache/` for tracking logs
3. **Stop**: Complete a session after editing backend/frontend code

## Troubleshooting

**Hook not executing?**
- Ensure handlers are executable: `chmod +x hooks/hooks-handlers/*.sh`
- Verify npm dependencies installed: `cd hooks && npm install`
- Check `hooks.json` syntax is valid JSON

**TypeScript errors?**
- Ensure dependencies installed: `npm install` in hooks directory
- Verify `tsconfig.json` is present

**Skill activation not working?**
- Ensure `.claude/skills/skill-rules.json` exists in your project
- Check skill trigger patterns match your prompt

## References

Based on Anthropic's official hook pattern:
- [Anthropic Plugin Example](https://github.com/anthropics/anthropic-claude-code-plugin-example)
- Uses `${CLAUDE_PLUGIN_ROOT}` for portability
- Follows hooks.json registration pattern

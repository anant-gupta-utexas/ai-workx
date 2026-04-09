# ECC for Codex CLI

This supplements the root `AGENTS.md` with Codex-specific guidance.

## Key Differences from Claude Code

| Feature | Claude Code | Codex CLI |
|---------|------------|-----------|
| Hooks | 8 event types supported | Not supported |
| Context file | CLAUDE.md + AGENTS.md | AGENTS.md only |
| Skills | Plugin-loaded from skills/ | Instruction-based |
| Commands | /slash commands | Instruction-based |
| Security | Hook-based enforcement | Instruction + sandbox |
| MCP | Full support | Supported via config.toml |

## Security Without Hooks

Since Codex lacks hooks, security enforcement is instruction-based:

1. Always validate inputs at system boundaries
2. Never hardcode secrets -- use environment variables
3. Run `pip audit` / `npm audit` before committing
4. Review `git diff` before every push
5. Use `sandbox_mode = "workspace-write"` in config

## MCP Servers

The project-local `.codex/config.toml` enables GitHub and Context7 MCP servers. Add additional servers in `~/.codex/config.toml` for user-level configuration.

## Available Plugins

See root `AGENTS.md` for the full list of available plugins, agents, skills, and commands. Install plugins via Claude Code first, then reference their skills and patterns via AGENTS.md instructions when using Codex.

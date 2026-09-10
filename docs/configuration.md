# Configuration

Swarm Pack intentionally keeps runtime configuration small.

## Environment Variables

- `OPENCODE_SWARM_NO_WORKTREE=1`: disables per-role worktrees for one OpenCode swarm session.
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`: enables Claude Code's experimental agent-team support outside the installer. Swarm Pack installs subagents and workflow skills but does not enable this flag.

## Command Flags

- `--target <name>`: required target. Supported: `opencode`, `codex`, `copilot`, `claude`.
- `--global`: install into the target's global configuration.
- `--local <project-path>`: install into a specific project. The path must already exist.
- `--team <name>`: install one team and its dependencies. Omit to install all teams.
- `--force`: overwrite existing files that differ from generated output.

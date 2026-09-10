# Permissions Mapping

OpenCode is the source format. Other targets receive the closest safe approximation.

| Role class | OpenCode | Codex | Copilot | Claude Code |
|---|---|---|---|---|
| Coordinator | `edit: allow`, git commit/worktree commands ask | Session sandbox | `read`, `search`, `edit`, `execute`, `agent` | `Agent`, `Read`, `Glob`, `Grep`, `Bash`, `Edit`, `Write`, `TodoWrite`, `Skill` |
| Write subagent | `edit: allow`, no git add/commit allow-list | Session sandbox | `read`, `search`, `edit`, `execute` | `Read`, `Glob`, `Grep`, `Bash`, `Edit`, `Write`, `TodoWrite`, `Skill` |
| Read-only subagent | `edit: deny` | `sandbox_mode = "read-only"` | `read`, `search` | `Read`, `Glob`, `Grep`, `WebFetch`, `Skill`, `permissionMode: plan` |

Role classes are centralized in `src/targets/roles.js`.

# Installation

The installer copies or renders team files into a selected target's global or project-local configuration.

## Recommended npm Installation

Install the package globally:

```sh
npm install -g swarm-pack
```

Then install from any project:

```sh
swarm-pack install --target opencode --local .
swarm-pack install --target opencode --global
swarm-pack install --target codex --local .
swarm-pack install --target codex --global
swarm-pack install --target copilot --local .
swarm-pack install --target copilot --global
swarm-pack install --target claude --local .
swarm-pack install --target claude --global
```

The target is required by design. Swarm Pack does not scan user directories or auto-detect tools; the user explicitly selects the tool to install into.

If `--team` is omitted, all bundled teams are installed.

The npm installer is implemented in Node and does not invoke `install.sh`.

## Legacy Self-Install

The shell installer remains available for manual legacy usage:

```sh
./install.sh --self-install
```

This copies the team definitions to `~/.local/share/opencode-swarm-teams/` and creates `~/.local/bin/opencode-swarm-install`.

## Global Installation

### OpenCode

```sh
swarm-pack install --target opencode --global
```

Files are copied to:

```text
~/.config/opencode/agents/
~/.config/opencode/commands/
~/.config/opencode/skills/
```

Use global installation when you want `/swarm-delivery` and installed swarm commands available in every project.

### Codex

```sh
swarm-pack install --target codex --global
```

Files are rendered or copied to:

```text
~/.codex/AGENTS.md
~/.codex/agents/*.toml
~/.agents/skills/swarm-pack/
```

Use global Codex installation when you want swarm custom agents and the shared skill available across projects. Codex does not install `/swarm-*` slash commands; prompt Codex to run the desired swarm workflow.

### GitHub Copilot

```sh
swarm-pack install --target copilot --global
```

Files are rendered or copied to:

```text
~/.copilot/copilot-instructions.md
~/.copilot/agents/*.agent.md
~/.agents/skills/swarm-pack/
```

Use global Copilot installation when you want swarm custom agents and the shared skill available across projects. Copilot does not install `/swarm-*` slash command files; use `/agent`, explicit prompts, or `/fleet` where safe.

### Claude Code

```sh
swarm-pack install --target claude --global
```

Files are rendered or copied to:

```text
~/.claude/CLAUDE.md
~/.claude/agents/*.md
~/.claude/skills/swarm-pack/
~/.claude/skills/swarm-*/SKILL.md
```

Use global Claude Code installation when you want swarm subagents, shared skills, and `/swarm-*` workflow skills available across projects. Claude Code agent teams are experimental and are not enabled by the installer; when users enable `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`, teams can reuse the installed subagent definitions by name.

## Local Installation

### OpenCode

```sh
swarm-pack install --target opencode --local /path/to/project
```

Files are copied to:

```text
<project>/.opencode/agents/
<project>/.opencode/commands/
<project>/.opencode/skills/
```

Use local installation when a project needs versioned prompts or project-specific swarm behavior.

### Codex

```sh
swarm-pack install --target codex --local /path/to/project
```

Files are rendered or copied to:

```text
<project>/AGENTS.md
<project>/.codex/agents/*.toml
<project>/.agents/skills/swarm-pack/
```

Use local Codex installation when a project needs versioned custom agents or project-specific swarm behavior. Project-local `.codex/` layers load only after the Codex project is trusted.

### GitHub Copilot

```sh
swarm-pack install --target copilot --local /path/to/project
```

Files are rendered or copied to:

```text
<project>/.github/copilot-instructions.md
<project>/.github/agents/*.agent.md
<project>/.agents/skills/swarm-pack/
```

Use local Copilot installation when a project needs versioned custom agents or project-specific swarm behavior.

### Claude Code

```sh
swarm-pack install --target claude --local /path/to/project
```

Files are rendered or copied to:

```text
<project>/CLAUDE.md
<project>/.claude/agents/*.md
<project>/.claude/skills/swarm-pack/
<project>/.claude/skills/swarm-*/SKILL.md
```

Use local Claude Code installation when a project needs versioned subagents, workflow skills, or project-specific swarm behavior.

## Force Reinstall

By default, the installer refuses to overwrite existing files.

Use `--force` to replace files from these teams:

```sh
swarm-pack install --target opencode --global --force
swarm-pack install --target opencode --local . --force
swarm-pack install --target codex --global --force
swarm-pack install --target codex --local . --force
swarm-pack install --target copilot --global --force
swarm-pack install --target copilot --local . --force
swarm-pack install --target claude --global --force
swarm-pack install --target claude --local . --force
```

## Team Selection

The installer installs all bundled teams by default. It also accepts explicit team names:

```sh
swarm-pack install --target opencode --global --team all
swarm-pack install --target opencode --global --team delivery-team
swarm-pack install --target opencode --global --team review-team
swarm-pack install --target opencode --global --team feature-team
swarm-pack install --target opencode --global --team assurance-team
swarm-pack install --target opencode --global --team mission-team
```

Replace `opencode` with `codex`, `copilot`, or `claude` to install the same team selection for another target.

Implemented teams:

- `all`
- `delivery-team`
- `review-team`
- `feature-team`
- `assurance-team`
- `mission-team`

Installing `review-team` or `feature-team` also installs the shared `delivery-team` base files. Installing `assurance-team` installs both `delivery-team` and `feature-team` dependencies. Installing `mission-team` installs only `delivery-team` plus `mission-team`.

## Restart Required

OpenCode loads agents, commands, and skills on startup. Codex and Copilot load custom agents, instructions, and skills at startup. Claude Code watches existing agent and skill directories, but a restart is safest after creating the first `.claude/agents/` or `.claude/skills/` directory. Restart the target tool after installing or updating these teams.

## Manual Uninstall

Remove these files from the selected target:

OpenCode:

```text
agents/swarm-orchestrator.md
agents/swarm-coder.md
agents/swarm-cleaner.md
agents/swarm-mission-*.md
agents/swarm-analyst.md
agents/swarm-gherkin-writer.md
agents/swarm-gherkin-reviewer.md
agents/swarm-qa-procedure-writer.md
agents/swarm-qa-procedure-reviewer.md
agents/swarm-merger.md
commands/swarm-delivery.md
commands/swarm-review.md
commands/swarm-feature.md
commands/swarm-assurance.md
commands/swarm-mission.md
skills/swarm-pack/
```

Codex:

```text
AGENTS.md
.codex/agents/swarm-*.toml
.agents/skills/swarm-pack/
```

GitHub Copilot:

```text
.github/copilot-instructions.md
.github/agents/swarm-*.agent.md
.agents/skills/swarm-pack/
```

Claude Code:

```text
CLAUDE.md
.claude/agents/swarm-*.md
.claude/skills/swarm-pack/
.claude/skills/swarm-*/SKILL.md
```

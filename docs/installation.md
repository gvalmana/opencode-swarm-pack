# Installation

The installer copies team files into either the global OpenCode configuration or a project-local `.opencode` directory.

## Recommended Self-Install

Run this once from the downloaded repository directory:

```sh
./install.sh --self-install
```

This copies the team definitions to:

```text
~/.local/share/opencode-swarm-teams/
```

It also creates a wrapper command:

```text
~/.local/bin/opencode-swarm-install
```

After self-installing, use `opencode-swarm-install` from any project:

```sh
opencode-swarm-install --local .
opencode-swarm-install --global
```

If `~/.local/bin` is not in `PATH`, add it to your shell configuration or invoke the wrapper by absolute path.

## Global Installation

```sh
opencode-swarm-install --global
```

Files are copied to:

```text
~/.config/opencode/agents/
~/.config/opencode/commands/
~/.config/opencode/skills/
```

Use global installation when you want `/swarm-delivery` and installed swarm commands available in every project.

## Local Installation

```sh
opencode-swarm-install --local /path/to/project
```

Files are copied to:

```text
<project>/.opencode/agents/
<project>/.opencode/commands/
<project>/.opencode/skills/
```

Use local installation when a project needs versioned prompts or project-specific swarm behavior.

## Force Reinstall

By default, the installer refuses to overwrite existing files.

Use `--force` to replace files from these teams:

```sh
opencode-swarm-install --global --force
opencode-swarm-install --local . --force
```

## Team Selection

The installer installs `delivery-team` by default. It also accepts explicit team names:

```sh
opencode-swarm-install --global --team delivery-team
opencode-swarm-install --global --team review-team
opencode-swarm-install --global --team feature-team
opencode-swarm-install --global --team assurance-team
opencode-swarm-install --global --team mission-team
```

Implemented teams:

- `delivery-team`
- `review-team`
- `feature-team`
- `assurance-team`
- `mission-team`

Installing `review-team` or `feature-team` also installs the shared `delivery-team` base files. Installing `assurance-team` installs both `delivery-team` and `feature-team` dependencies. Installing `mission-team` installs only `delivery-team` plus `mission-team`.

## Restart Required

OpenCode loads agents, commands, and skills on startup. Restart OpenCode after installing or updating these teams.

## Manual Uninstall

Remove these files from the selected target:

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
skills/opencode-swarm/
```

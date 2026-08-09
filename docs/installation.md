# Installation

The installer copies team files into either the global OpenCode configuration or a project-local `.opencode` directory.

## Recommended npm Installation

Install the package globally:

```sh
npm install -g swarm-pack
```

Then install from any project:

```sh
swarm-pack install --target opencode --local .
swarm-pack install --target opencode --global
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

## Local Installation

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

## Force Reinstall

By default, the installer refuses to overwrite existing files.

Use `--force` to replace files from these teams:

```sh
swarm-pack install --target opencode --global --force
swarm-pack install --target opencode --local . --force
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

Implemented teams:

- `all`
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

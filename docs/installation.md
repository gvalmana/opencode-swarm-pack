# Installation

The installer copies pack files into either the global OpenCode configuration or a project-local `.opencode` directory.

## Recommended Self-Install

Run this once from the downloaded `opencode-swarm-pack` directory:

```sh
./install.sh --self-install
```

This copies the pack to:

```text
~/.local/share/opencode-swarm-pack/
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

Use global installation when you want `/swarm-two` and installed swarm commands available in every project.

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

Use `--force` to replace files from this pack:

```sh
opencode-swarm-install --global --force
opencode-swarm-install --local . --force
```

## Pack Selection

The installer installs `two-pack` by default. It also accepts explicit pack names:

```sh
opencode-swarm-install --global --pack two-pack
opencode-swarm-install --global --pack adversaries
```

Implemented packs:

- `two-pack`
- `adversaries`

Installing `adversaries` also installs the shared `two-pack` base files because it reuses `swarm-orchestrator`, `swarm-coder`, and `opencode-swarm`.

## Restart Required

OpenCode loads agents, commands, and skills on startup. Restart OpenCode after installing or updating this pack.

## Manual Uninstall

Remove these files from the selected target:

```text
agents/swarm-orchestrator.md
agents/swarm-coder.md
agents/swarm-cleaner.md
commands/swarm-two.md
commands/swarm-adversaries.md
skills/opencode-swarm/
```

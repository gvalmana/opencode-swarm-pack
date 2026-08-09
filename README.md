# OpenCode Swarm Pack

OpenCode Swarm Pack brings SwarmForge-style role workflows to OpenCode using native agents, commands, and skills.

The first implemented workflow is `two-pack`:

```text
coder -> cleaner -> final
```

Future packs are documented and reserved for incremental implementation: `adversaries`, `four-pack`, `six-pack`, and `squad`.

## Goals

- Coordinate specialized OpenCode agents as a small engineering team.
- Keep changes small, role-owned, and reviewable.
- Centralize commits in the orchestrator.
- Support both global and project-local installation.
- Preserve a documented migration path toward the fuller SwarmForge workflows.

## Installation

Recommended one-time installation:

```sh
./install.sh --self-install
```

This copies the pack to `~/.local/share/opencode-swarm-pack` and creates this wrapper:

```text
~/.local/bin/opencode-swarm-install
```

After that, install packs from any project without remembering where this repository was downloaded.

Install globally for all OpenCode projects:

```sh
opencode-swarm-install --global
```

Install locally into a specific project:

```sh
opencode-swarm-install --local /path/to/project
```

Install locally into the current project:

```sh
opencode-swarm-install --local .
```

Use `--force` to replace previously installed files from this pack:

```sh
opencode-swarm-install --global --force
```

Restart OpenCode after installing. OpenCode loads agents, commands, and skills at startup.

## Usage

After installation and restart, run:

```text
/swarm-two implement a small validation for checkout totals
```

For adversarial implementation and review, run:

```text
/swarm-adversaries implement a small validation and review it for edge cases
```

The orchestrator will delegate to `swarm-coder`, inspect the result, create a role-owned commit when appropriate, then delegate to `swarm-cleaner` for behavior-preserving cleanup.

The command is only the workflow entrypoint. It starts `swarm-orchestrator`, and the orchestrator invokes the role agents.

```text
/swarm-two -> swarm-orchestrator -> swarm-coder -> swarm-orchestrator -> swarm-cleaner -> swarm-orchestrator
```

## Documentation

- `docs/architecture.md`
- `docs/installation.md`
- `docs/usage.md`
- `docs/handoff-protocol.md`
- `docs/commit-discipline.md`
- `docs/role-traceability.md`
- `docs/packs.md`
- `docs/future-packs.md`
- `docs/troubleshooting.md`

## Implemented Packs

- `two-pack`: implemented.
- `adversaries`: implemented.

## Planned Packs

- `four-pack`: specifier, coder, refactorer, architect.
- `six-pack`: specifier, coder, cleaner, architect, hardener, QA.
- `squad`: squad leader with transient specialized agents.

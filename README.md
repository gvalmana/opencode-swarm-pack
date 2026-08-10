# Swarm Pack

Swarm Pack brings SwarmForge-style role workflows to AI coding tools using native target adapters. OpenCode, Codex, and GitHub Copilot are currently supported installation targets.

The first implemented team is `delivery-team`:

```text
coder -> cleaner -> final
```

All defined teams are implemented incrementally and reuse shared role agents where responsibilities match.

## Goals

- Coordinate specialized agents as a small engineering team.
- Keep changes small, role-owned, and reviewable.
- Centralize commits in the orchestrator.
- Support both global and project-local installation.
- Preserve a documented migration path toward the fuller SwarmForge workflows.

## Installation

Recommended npm installation:

```sh
npm install -g swarm-pack
```

Install globally for all OpenCode projects:

```sh
swarm-pack install --target opencode --global
```

Install globally for Codex:

```sh
swarm-pack install --target codex --global
```

Install globally for GitHub Copilot:

```sh
swarm-pack install --target copilot --global
```

If `--team` is omitted, all bundled teams are installed.

Install locally into a specific project:

```sh
swarm-pack install --target opencode --local /path/to/project
```

Install locally into a Codex project:

```sh
swarm-pack install --target codex --local /path/to/project
```

Install locally into a GitHub Copilot project:

```sh
swarm-pack install --target copilot --local /path/to/project
```

Install locally into the current project:

```sh
swarm-pack install --target opencode --local .
```

The target is required by design so installation never scans or modifies tool directories implicitly.

Use `--force` to replace previously installed files from these teams:

```sh
swarm-pack install --target opencode --global --force
```

Restart the target tool after installing. OpenCode, Codex, and GitHub Copilot load agents, instructions, and skills at startup.

Legacy manual installation remains available with `./install.sh --self-install`.

## Usage

After OpenCode installation and restart, run:

```text
/swarm-delivery implement a small validation for checkout totals
```

For implementation and adversarial review, run:

```text
/swarm-review implement a small validation and review it for edge cases
```

The orchestrator will delegate to `swarm-coder`, inspect the result, create a role-owned commit when appropriate, then delegate to `swarm-cleaner` for behavior-preserving cleanup.

The command is only the workflow entrypoint. It starts `swarm-orchestrator`, and the orchestrator invokes the role agents.

```text
/swarm-delivery -> swarm-orchestrator -> swarm-coder -> swarm-orchestrator -> swarm-cleaner -> swarm-orchestrator
```

Codex does not install `/swarm-*` commands. After Codex installation and restart, prompt Codex directly:

```text
Run the swarm delivery workflow for this request. Use swarm-coder, then swarm-cleaner, and wait for each handoff before continuing.
```

Copilot also does not install `/swarm-*` command files. After Copilot installation and restart, prompt Copilot directly:

```text
Use the swarm-coder agent, then the swarm-cleaner agent, to run the delivery-team workflow for this request. Wait for each HANDOFF before continuing.
```

## Documentation

- `docs/architecture.md`
- `docs/installation.md`
- `docs/usage.md`
- `docs/handoff-protocol.md`
- `docs/commit-discipline.md`
- `docs/role-traceability.md`
- `docs/teams.md`
- `docs/multi-target-support.md`
- `docs/future-teams.md`
- `docs/troubleshooting.md`

## Implemented Teams

- `delivery-team`: coder, cleaner.
- `review-team`: coder, reviewer.
- `feature-team`: specifier, coder, refactorer, architect.
- `assurance-team`: specifier, coder, cleaner, architect, hardener, QA.
- `mission-team`: mission leader with dedicated mission agents for analysis, acceptance, QA procedure, implementation, review, hardening, QA, senior implementation, and readiness gates.

Mission installation depends on `delivery-team` for the shared skill and base orchestration assets, then installs its own mission-specific agents.

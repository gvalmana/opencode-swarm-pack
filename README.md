# OpenCode Swarm Teams

OpenCode Swarm Teams bring SwarmForge-style role workflows to OpenCode using native agents, commands, and skills.

The first implemented team is `delivery-team`:

```text
coder -> cleaner -> final
```

All defined teams are implemented incrementally and reuse shared role agents where responsibilities match.

## Goals

- Coordinate specialized OpenCode agents as a small engineering team.
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

Install locally into a specific project:

```sh
swarm-pack install --target opencode --local /path/to/project
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

Restart OpenCode after installing. OpenCode loads agents, commands, and skills at startup.

Legacy manual installation remains available with `./install.sh --self-install`.

## Usage

After installation and restart, run:

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

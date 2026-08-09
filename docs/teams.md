# Teams

This document tracks supported teams.

## Delivery Team

Status: implemented.

Flow:

```text
coder -> cleaner -> final
```

Use for:

- Small bugs.
- Small features.
- Focused backend changes.
- Local refactors.

Roles:

- `swarm-coder`: implements behavior with focused tests.
- `swarm-cleaner`: preserves behavior while improving local quality.

Difference from SwarmForge: SwarmForge loops `cleaner -> coder`; OpenCode Swarm Teams makes that return conditional to avoid unnecessary loops.

Command:

```text
/swarm-delivery <task>
```

## Review Team

Status: implemented.

Flow:

```text
coder -> reviewer -> coder until approved
```

Source roles:

- `coder`
- `reviewer`

OpenCode roles:

- `swarm-coder`: implements and fixes review findings.
- `swarm-reviewer`: performs read-only adversarial review.

Use for:

- Risky fixes.
- Review-heavy implementation.
- Local PR hardening before opening a PR.

Command:

```text
/swarm-review <task>
```

## Feature Team

Status: implemented.

Flow:

```text
specifier -> coder -> refactorer -> architect -> final
```

OpenCode roles:

- `swarm-specifier`: acceptance criteria.
- `swarm-coder`: implementation.
- `swarm-refactorer`: behavior-preserving cleanup.
- `swarm-architect`: structural review.

Use for:

- Medium features.
- Work that needs explicit acceptance criteria.
- Behavior changes with architectural implications.

Command:

```text
/swarm-feature <task>
```

Dependencies: installs `delivery-team` base automatically.

## Assurance Team

Status: implemented.

Flow:

```text
specifier -> coder -> cleaner -> architect -> hardener -> qa -> final
```

OpenCode roles:

- `swarm-specifier`: acceptance criteria.
- `swarm-coder`: implementation.
- `swarm-cleaner`: behavior-preserving cleanup.
- `swarm-architect`: structural review.
- `swarm-hardener`: edge-case hardening.
- `swarm-qa`: final independent verification.

Naming note: SwarmForge uses `hardender` and uppercase `QA` in the source workflow. This team normalizes both to `swarm-hardener` and `swarm-qa`. See `docs/role-traceability.md`.

Use for:

- Large features.
- Critical changes.
- Work requiring independent QA or hardening.

Command:

```text
/swarm-assurance <task>
```

Dependencies: installs `feature-team` and `delivery-team` base automatically.

## Mission Team

Status: implemented advanced workflow.

Flow:

```text
mission-leader -> analyst -> gherkin-writer -> gherkin-reviewer -> qa-procedure-writer -> qa-procedure-reviewer -> implementer -> cleaner -> code-reviewer -> architect -> hardener -> qa -> senior-implementor -> merger -> final
```

Source roles:

- `mission-leader`
- `analyst`
- `gherkin-writer`
- `qa-procedure-writer`
- `gherkin-reviewer`
- `qa-procedure-reviewer`
- `implementer`
- `cleaner`
- `code-reviewer`
- `hardener`
- `qa`
- `architect`
- `senior-implementor`
- `merger`

Use for:

- Epics.
- Multi-story themes.
- Approval gates.
- Batched quality gates.

Command:

```text
/swarm-mission <task>
```

Dependencies: installs `delivery-team` base files, then `mission-team` agents and command.

See `docs/role-traceability.md` for the exact mapping between OpenCode role filenames and SwarmForge source roles.

# Packs

This document tracks supported and planned packs.

## Two-Pack

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

Difference from SwarmForge: SwarmForge loops `cleaner -> coder`; OpenCode Swarm Pack makes that return conditional to avoid unnecessary loops.

## Adversaries

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
/swarm-adversaries <task>
```

## Four-Pack

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
/swarm-four <task>
```

Dependencies: installs `two-pack` base automatically.

## Six-Pack

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

Naming note: SwarmForge `six-pack` uses `hardender` and uppercase `QA`. This pack normalizes both to `swarm-hardener` and `swarm-qa`. See `docs/role-traceability.md`.

Use for:

- Large features.
- Critical changes.
- Work requiring independent QA or hardening.

Command:

```text
/swarm-six <task>
```

Dependencies: installs `four-pack` and `two-pack` base automatically.

## Squad

Status: planned advanced workflow.

Flow:

```text
squad-leader -> transient agents -> squad-leader
```

Source roles:

- `squad-leader`
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

See `docs/role-traceability.md` for the exact mapping between OpenCode role filenames and SwarmForge source roles.

# Assurance Team

Status: implemented.

Flow:

```text
specifier -> coder -> cleaner -> architect -> hardener -> qa -> final
```

Roles:

- `swarm-specifier`: acceptance criteria.
- `swarm-coder`: implementation.
- `swarm-cleaner`: behavior-preserving cleanup.
- `swarm-architect`: structural review.
- `swarm-hardener`: edge-case hardening and robustness.
- `swarm-qa`: final independent verification.

Command:

```text
/swarm-assurance <task>
```

Naming note: SwarmForge source workflows use `hardender` and `QA`. This OpenCode team normalizes both to `swarm-hardener` and `swarm-qa`. See `docs/role-traceability.md`.

Dependencies:

- Reuses `delivery-team` and `feature-team` base files.
- Installing `assurance-team` automatically installs both dependencies.

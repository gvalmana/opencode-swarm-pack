# Six-Pack

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
/swarm-six <task>
```

Naming note: SwarmForge `six-pack` uses `hardender` and `QA`. This OpenCode pack normalizes both to `swarm-hardener` and `swarm-qa`. See `docs/role-traceability.md`.

Dependencies:

- Reuses `two-pack` and `four-pack` base files.
- Installing `six-pack` automatically installs both dependencies.

# Maintenance Team

Status: implemented.

Flow:

```text
cleaner -> refactorer -> architect -> final
```

Roles:

- `swarm-cleaner`: local behavior-preserving cleanup.
- `swarm-refactorer`: deeper behavior-preserving refactoring and coverage improvement.
- `swarm-architect`: structural review and boundary critique.

Command:

```text
/swarm-maintenance <task>
```

Rules:

- Do not introduce new behavior.
- Preserve existing tests and observable behavior.
- Stop if the requested maintenance requires product or specification decisions.

Dependencies:

- Reuses `feature-team` and its transitive `delivery-team` base files.

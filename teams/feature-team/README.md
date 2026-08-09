# Feature Team

Status: implemented.

Flow:

```text
specifier -> coder -> refactorer -> architect -> final
```

Roles:

- `swarm-specifier`: acceptance criteria.
- `swarm-coder`: implementation.
- `swarm-refactorer`: behavior-preserving cleanup.
- `swarm-architect`: structural review.

Command:

```text
/swarm-feature <task>
```

Dependencies:

- Reuses `delivery-team` base files (`swarm-orchestrator`, `swarm-coder`, `opencode-swarm` skill).
- Installing `feature-team` automatically installs the shared base.

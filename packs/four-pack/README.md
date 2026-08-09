# Four-Pack

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
/swarm-four <task>
```

Dependencies:

- Reuses `two-pack` base files (`swarm-orchestrator`, `swarm-coder`, `opencode-swarm` skill).
- Installing `four-pack` automatically installs the shared base.

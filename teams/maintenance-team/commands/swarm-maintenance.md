---
description: Run behavior-preserving maintenance and refactoring.
agent: swarm-orchestrator
---

Run the `maintenance-team` workflow for this request:

$ARGUMENTS

Team flow:

```text
cleaner -> refactorer -> architect -> final
```

Options:

- Worktrees are enabled by default.
- Pass `--no-worktree` in `$ARGUMENTS` to run roles in the main worktree for this session.
- Set `OPENCODE_SWARM_NO_WORKTREE=1` to opt out through the environment.

Rules:

- Use the `swarm-pack` skill.
- Inspect repository state before starting.
- Do not introduce new behavior.
- Delegate local cleanup to `swarm-cleaner`.
- Commit safe cleaner-owned changes when there are any.
- Delegate deeper behavior-preserving refactoring to `swarm-refactorer`.
- Commit safe refactorer-owned changes when there are any.
- Delegate structural review to `swarm-architect`.
- Commit safe architect-owned changes when there are any.
- Stop if any role identifies required behavior, product, or specification changes.
- Final response must summarize roles, commits, verification, and risks.

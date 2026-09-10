---
description: Run a focused hotfix with adversarial review.
agent: swarm-orchestrator
---

Run the `hotfix-team` workflow for this request:

$ARGUMENTS

Team flow:

```text
coder -> reviewer -> final
```

Options:

- Worktrees are enabled by default.
- Pass `--no-worktree` in `$ARGUMENTS` to run roles in the main worktree for this session.
- Set `OPENCODE_SWARM_NO_WORKTREE=1` to opt out through the environment.

Rules:

- Use the `swarm-pack` skill.
- Inspect repository state before starting.
- Keep the fix minimal and focused on the urgent defect.
- Delegate implementation to `swarm-coder`.
- Commit safe coder-owned changes before review.
- Delegate read-only review to `swarm-reviewer`.
- If reviewer returns `decision: approved`, finalize.
- If reviewer returns `decision: changes-requested`, delegate one focused fix back to `swarm-coder` with the review findings.
- Stop if the fix requires broader refactoring, unclear product decisions, or repeated failed review.
- Final response must summarize roles, commits, verification, and risks.

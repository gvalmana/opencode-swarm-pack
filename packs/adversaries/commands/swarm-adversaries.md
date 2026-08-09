---
description: Run the adversaries OpenCode swarm workflow: coder -> reviewer -> coder until approved.
agent: swarm-orchestrator
---

Run the `adversaries` workflow for this request:

$ARGUMENTS

Pack flow:

```text
coder -> reviewer -> coder until approved
```

Rules:

- Use the `opencode-swarm` skill.
- Inspect repository state before starting.
- Delegate implementation to `swarm-coder` in its assigned worktree.
- Commit safe coder-owned changes (squash-merge from the coder branch) before review.
- Delegate read-only adversarial review to `swarm-reviewer` in its assigned worktree.
- If review is approved, finalize.
- If review requests changes, delegate a focused correction to `swarm-coder` in a new worktree.
- Do not let the reviewer edit files.
- Stop on blockers, repeated failed iterations, unexpected files, ambiguous scope, or unsafe git state.
- Final response must summarize roles, iterations, commits, verification, worktree paths, findings, and risks.

Options:

- Pass `--no-worktree` in $ARGUMENTS to disable per-role worktree isolation for this session and use the legacy sequential flow.
- Alternatively set `OPENCODE_SWARM_NO_WORKTREE=1` before the session as an escape hatch.

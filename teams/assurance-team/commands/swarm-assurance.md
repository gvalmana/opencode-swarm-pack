---
description: Deliver with hardening and QA.
agent: swarm-orchestrator
---

Run the `assurance-team` workflow for this request:

$ARGUMENTS

Team flow:

```text
specifier -> coder -> cleaner -> architect -> hardener -> security-reviewer -> qa -> final
```

Options:

- Worktrees are enabled by default.
- Pass `--no-worktree` in `$ARGUMENTS` to run roles in the main worktree for this session.
- Set `OPENCODE_SWARM_NO_WORKTREE=1` to opt out through the environment.

Rules:

- Use the `swarm-pack` skill.
- Inspect repository state before starting.
- Delegate acceptance criteria to `swarm-specifier`.
- Ask the user to approve the spec when criteria are non-trivial before delegating to coder.
- Delegate implementation to `swarm-coder`.
- Commit safe coder-owned changes before cleanup.
- Delegate behavior-preserving cleanup to `swarm-cleaner`.
- Commit safe cleaner-owned changes when there are any.
- Delegate structural review to `swarm-architect`.
- Commit safe architect-owned changes when there are any.
- Delegate edge-case hardening to `swarm-hardener`.
- Commit safe hardener-owned changes when there are any.
- Delegate read-only security review to `swarm-security-reviewer`.
- Loop back to coder or hardener when security review returns `decision: changes-requested`.
- Delegate final independent verification to `swarm-qa`.
- Loop back to coder only when hardener, security-reviewer, or qa finds a defect that the previous roles must address.
- Stop on blockers, repeated failed iterations, unexpected files, ambiguous scope, or unsafe git state.
- Final response must summarize roles, commits, verification, and risks.

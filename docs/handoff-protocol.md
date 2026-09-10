# Handoff Protocol

Subagents communicate back to the orchestrator with a structured handoff.

## Required Format

```text
HANDOFF
role: <role>
status: completed|blocked|failed
task: <short-stable-task-name>
worktree_path: <path-or-none>
branch: <branch-or-none>
base_sha: <sha-or-none>
commit_needed: yes|no
changed_files:
verification:
next_recommended_role:
summary:
risks:
```

## Rules

- Keep handoffs concise.
- Do not include full test logs unless the failure is small and essential.
- Do not include internal chain-of-thought or process narrative.
- Use `blocked` for ambiguity, conflicting requirements, missing tools, unsafe commands, or permissions.
- Use `failed` for attempted work that could not be completed.
- Use `completed` only when role-owned work is done and verification was attempted or explicitly skipped with reason.
- Include `worktree_path`, `branch`, and `base_sha` when worktrees are enabled. Use `<path-or-none>`, `<branch-or-none>`, and `<sha-or-none>` only when no worktree was assigned.

## Reviewer Extensions

Reviewer-style roles add:

```text
decision: approved|changes-requested|commented
findings:
```

Readiness roles add their own decision vocabulary when documented by the role. `swarm-merger` uses `decision: ready|blocked`.

## Delivery Team Routing

For `delivery-team`:

- `coder` normally recommends `cleaner`.
- `cleaner` normally recommends `final`.
- `cleaner` recommends `coder` only when it found a functional defect or missing behavior.

## Orchestrator Responsibility

The orchestrator validates handoffs against the actual repository state. A handoff is not trusted blindly when the diff, tests, or file state disagree.

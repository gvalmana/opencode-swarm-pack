# Worktree Discipline

Phase 6 introduces per-role git worktrees so each subagent edits an isolated working copy while the orchestrator owns merge and commit discipline.

## Layout

The orchestrator creates one worktree per role per session, inside the project:

```text
.worktrees/swarm-<role>/<task-id>
```

`<role>` is the subagent name without the `swarm-` prefix (`coder`, `cleaner`, `reviewer`).

`<task-id>` has the shape `<role>-<YYYY-MM-DD>-<6hex>`. The random suffix avoids collisions across concurrent sessions in the same project.

The branch is created from the main worktree HEAD at session start:

```text
swarm/<role>/<task-id>
```

After the role's HANDOFF is approved, the orchestrator squash-merges the branch into the main worktree and removes the role worktree with `git worktree remove --force`. The branch remains in the reflog for recovery; it is not auto-deleted.

## Merge Strategy

Squash merge with a role byline, preserving the contract from `docs/commit-discipline.md`:

```text
git merge --squash swarm/<role>/<task-id>
git commit -m "<concise summary>

By <role>."
```

This produces a single commit per role in the main history, with the `By <role>.` byline intact. Intermediate commits inside the role worktree are collapsed.

## Dirty Detection

Before the first delegation of a session, the orchestrator runs:

```sh
git rev-parse --is-inside-work-tree
git status --porcelain
```

If the project is not a git repository, the orchestrator stops with instructions:

```sh
git init && git add -A && git commit -m 'Initial commit'
```

If the main worktree has uncommitted or untracked changes (excluding files matched by `.gitignore`), the orchestrator stops and asks the user before proceeding. User changes are never reverted.

## Conflict Detection

When squash-merging, git does not report textual conflicts because the merge target is the main worktree and the squash materializes changes only against the original base. The orchestrator still inspects `git diff` between base SHA and the role branch tip:

- Unexpected files outside the role's assignment → stop and ask.
- Files overlapping with user changes made during the session → stop and ask.
- A `git merge --squash` that fails for any reason → stop and ask.

The orchestrator never force-resolves.

## Opt-Out

Two ways to disable worktree isolation for a session:

1. Command flag: include `--no-worktree` in the command arguments.

   ```text
   /swarm-two add a hello world CLI --no-worktree
   /swarm-adversaries fix checkout totals --no-worktree
   ```

2. Environment variable: set `OPENCODE_SWARM_NO_WORKTREE=1` before the session.

When opted out, the orchestrator uses the legacy sequential flow: subagents edit the main worktree directly, and the orchestrator commits after each role with the same `By <role>.` byline.

## Concurrent Sessions

Two swarm sessions on the same project can run safely because `TASK_ID` includes a random suffix. Worktree paths and branch names will not collide.

Limitation: if both sessions run with `--no-worktree` simultaneously, both write to the main worktree. Git index conflicts are possible. The orchestrator detects unexpected files and stops, but resolution may require manual intervention.

## Recovery

If the orchestrator aborts or crashes mid-session, worktrees and branches may be orphaned.

List orphans:

```sh
git worktree list
```

Remove an orphaned worktree:

```sh
git worktree remove --force .worktrees/swarm-<role>/<task-id>
```

Recover a branch from the reflog:

```sh
git reflog
git checkout -b recover/<role>-<task-id> <sha-from-reflog>
```

See `docs/troubleshooting.md` for the full recovery flow.

## Limitations

- Filesystems that do not support symlinks can fail `git worktree add`. Document the fallback or use `--no-worktree`.
- Filesystems with case-insensitive paths can produce confusing worktree paths on macOS defaults. Document explicitly when targeting macOS.
- Very large repositories make worktree creation slow. `git worktree add` copies the working tree. Consider `--no-worktree` for repos with hundreds of thousands of files.
- The orchestrator suggests adding `.worktrees/` to `.gitignore` but does not modify it automatically, to avoid surprising changes to project configuration.

## Adding `.worktrees/` to `.gitignore`

The orchestrator recommends adding this line to the project's `.gitignore` after the first session:

```text
.worktrees/
```

The orchestrator must not modify `.gitignore` without explicit user approval.

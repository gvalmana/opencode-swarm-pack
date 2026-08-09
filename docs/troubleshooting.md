# Troubleshooting

## Command Does Not Appear

Restart OpenCode. Commands are loaded at startup.

Check that the expected command file exists in one of:

```text
~/.config/opencode/commands/
<project>/.opencode/commands/
```

For example, `swarm-delivery.md`, `swarm-review.md`, `swarm-feature.md`, or `swarm-assurance.md` should be in the same command directory.

## Installer Command Does Not Work

If `swarm-pack` is not found, confirm the npm package is installed globally and your npm global bin directory is in `PATH`.

Install it with:

```sh
npm install -g swarm-pack
```

The legacy self-install wrapper remains available for manual usage:

```sh
./install.sh --self-install --force
```

## Agent Does Not Appear

Restart OpenCode.

Check that the agent files exist in one of:

```text
~/.config/opencode/agents/
<project>/.opencode/agents/
```

## Skill Does Not Appear

Check that the skill is installed at:

```text
skills/opencode-swarm/SKILL.md
```

The file must be named exactly `SKILL.md`.

## Existing Files Block Install

The installer refuses to overwrite files by default.

Use:

```sh
swarm-pack install --target opencode --global --force
swarm-pack install --target opencode --local . --force
```

## Verification Command Missing

The role should report the missing command in its handoff. The orchestrator can continue only if the missing check is not essential or the user approves an alternate check.

## Unexpected Files Changed

The orchestrator should stop before committing and ask how to proceed. It must not revert user changes.

## Existing Dirty Worktree

The orchestrator should inspect existing changes before starting. If user changes overlap with role-owned work, it should ask before proceeding.

## OpenCode Config Fails After Install

These teams install agent, command, and skill files. They do not need to edit `opencode.json`.

If OpenCode fails to start due to unrelated config issues, use OpenCode's config escape hatches or fix the config file, then restart.

## Worktree Recovery

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

Branches created by Phase 6 are named `swarm/<role>/<task-id>` and stay in the reflog after their worktree is removed. Recovery does not require the worktree path to still exist.

## Concurrent Swarm Sessions

Two swarm sessions on the same project are safe because `TASK_ID` includes a random suffix. Worktree paths and branch names do not collide.

Limitation: if both sessions run with `--no-worktree` simultaneously, both write to the main worktree. Git index conflicts are possible. The orchestrator detects unexpected files and stops, but resolution may require manual intervention.

## Non-Git Project

The orchestrator refuses to start a worktree-based session in a non-git directory.

Initialize first:

```sh
git init && git add -A && git commit -m 'Initial commit'
```

To opt out of the worktree requirement while iterating in a non-git directory, run with `--no-worktree`.

## Worktree Creation Fails

Common causes:

- The filesystem does not support symlinks (some Windows and network mounts). Use `--no-worktree`.
- The repository has a `.git` directory in a path that git worktree cannot handle. Run `git worktree prune` first.
- A previous session left a stale worktree at the same path. Run `git worktree prune` then retry.
- The `.worktrees/` directory itself is tracked. Add `.worktrees/` to `.gitignore` and `git rm -r --cached .worktrees/`.

## `.worktrees/` Should Be Ignored

The orchestrator does not modify `.gitignore` automatically. After the first session, the user should add:

```text
.worktrees/
```

If `.worktrees/` is committed, `git worktree add` may still work but produces noise in `git status`.

## Unexpected Files Changed

The orchestrator should stop before committing and ask how to proceed. It must not revert user changes.

With Phase 6 worktrees enabled, the orchestrator inspects `git -C <wt> diff <base>..HEAD` after each role. Unexpected files outside the role's assignment trigger the same stop-and-ask behavior.

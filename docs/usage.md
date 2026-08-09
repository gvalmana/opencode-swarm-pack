# Usage

The first available command is `/swarm-two`.

The second available command is `/swarm-adversaries`.

Example:

```text
/swarm-two fix the checkout total duplication bug
```

Other examples:

```text
/swarm-two add validation for invoice dates
/swarm-two refactor the tax calculation service without changing behavior
/swarm-two fix the null customer edge case in checkout
```

## Hello World Example

This is a minimal example for testing that the pack is installed and the two-pack flow works.

Create an empty project:

```sh
mkdir hello-swarm
cd hello-swarm
git init
```

Install the pack locally from the `opencode-swarm-pack` directory:

```sh
/home/sysadmin/PROYECTOS/PRUEBAS/AgentsProyect/opencode-swarm-pack/install.sh --local .
```

Restart OpenCode from the `hello-swarm` directory so it loads `.opencode/`.

Run:

```text
/swarm-two create a minimal Node.js hello world CLI. It should print "Hello, world!" when running npm start, and include a simple test or verification script if appropriate.
```

Expected flow:

```text
swarm-orchestrator -> worktree(coder) -> swarm-coder -> squash-merge + commit -> worktree(cleaner) -> swarm-cleaner -> optional squash-merge + commit -> worktree remove -> final summary
```

Expected result:

- A small Node.js hello world application.
- Two worktrees created and removed during the session:
  ```text
  .worktrees/swarm-coder/coder-2026-08-07-abc123
  .worktrees/swarm-cleaner/cleaner-2026-08-07-def456
  ```
- A role-owned coder commit on the main worktree with `By coder.`.
- A cleaner commit only if cleanup was useful.
- `git worktree list` shows only the main worktree at the end.
- Final summary listing verification, commits, worktree paths, and residual risks.

Possible final files:

```text
package.json
src/index.js
```

Possible verification command:

```sh
npm start
```

## Two-Pack Flow

```text
orchestrator -> coder -> commit -> cleaner -> optional commit -> final
```

The coder implements the behavior and tests.

The cleaner performs behavior-preserving cleanup.

The orchestrator commits after each role when there are safe, role-owned changes.

## Command Versus Agents

The command starts the workflow. The agents do the work.

```text
/swarm-two
  └── uses swarm-orchestrator
        ├── calls swarm-coder
        └── calls swarm-cleaner
```

Use the command when you want the complete repeatable workflow.

Use an individual agent only when you intentionally want that isolated role and no pack orchestration.

Example direct-agent intent:

```text
Ask swarm-cleaner to review this diff for behavior-preserving cleanup only.
```

Example pack intent:

```text
/swarm-two add a hello world CLI
```

Example adversarial review intent:

```text
/swarm-adversaries add a hello world CLI and review it for edge cases
```

## Flow With Commits

```text
User
  │
  │ /swarm-two create hello world CLI
  ▼
swarm-orchestrator (main worktree)
  │
  │ git worktree add -b swarm/coder/<task-id> .worktrees/swarm-coder/<task-id> HEAD
  │ delegate to swarm-coder with worktree path, branch, base SHA
  ▼
swarm-coder (.worktrees/swarm-coder/<task-id>)
  │
  │ edits files, runs verification, returns HANDOFF with worktree_path
  ▼
swarm-orchestrator (main worktree)
  │
  │ git -C <wt> status + git diff <base>..HEAD + verification check
  │ git merge --squash swarm/coder/<task-id>
  │ git commit -m "Implement hello world CLI\n\nBy coder."
  │ git worktree remove --force .worktrees/swarm-coder/<task-id>
  │ git worktree add -b swarm/cleaner/<task-id> .worktrees/swarm-cleaner/<task-id> HEAD
  │ delegate to swarm-cleaner
  ▼
swarm-cleaner (.worktrees/swarm-cleaner/<task-id>)
  │
  │ behavior-preserving cleanup, returns HANDOFF
  ▼
swarm-orchestrator (main worktree)
  │
  │ optional git merge --squash swarm/cleaner/<task-id>
  │ optional git commit -m "Simplify hello world CLI\n\nBy cleaner."
  │ git worktree remove --force .worktrees/swarm-cleaner/<task-id>
  ▼
Final summary to user (with worktrees_used)
```

## Adversaries Flow

Use `/swarm-adversaries` when you want implementation followed by critical read-only review.

```text
User
  │
  │ /swarm-adversaries fix checkout total duplication
  ▼
swarm-orchestrator (main worktree)
  │
  │ git worktree add (coder)
  │ delegate implementation
  ▼
swarm-coder (worktree)
  │
  │ edits files, runs verification, returns HANDOFF
  ▼
swarm-orchestrator (main worktree)
  │
  │ squash-merge + commit By coder + worktree remove
  │ git worktree add (reviewer)
  │ delegate read-only review
  ▼
swarm-reviewer (worktree)
  │
  │ read-only review, returns HANDOFF with decision
  ▼
swarm-orchestrator (main worktree)
  │
  ├── approved -> final summary (with worktrees_used)
  │
  └── changes requested -> git worktree add (coder) -> focused fix -> squash-merge -> re-review
```

The reviewer must not edit files. It returns findings and a decision only.

## When The Flow Stops

The orchestrator stops when:

- The request is ambiguous.
- Verification fails and the next step is unclear.
- A subagent changes unexpected files.
- Existing user changes would be mixed with role-owned changes.
- A command needs unsafe permissions.
- The cleaner finds a functional issue that must go back to the coder.
- The project is not a git repository.
- The main worktree has uncommitted or untracked changes (excluding `.gitignore`).
- A `git merge --squash` reports conflicts or unexpected overlap.

## Expected Final Summary

The final response should include:

- Pack used.
- Roles executed.
- Commits created.
- Verification commands run.
- `worktrees_used`: the paths of worktrees created and removed during the session.
- Remaining risks or skipped checks.

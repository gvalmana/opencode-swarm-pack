# Future Packs

Future work should be incremental. Do not implement all SwarmForge complexity before the `two-pack` has proven useful.

## Phase 1: Two-Pack

Implemented first.

Deliverables:

- Shared skill.
- Orchestrator.
- Coder.
- Cleaner.
- `/swarm-two` command.
- Installer.
- Documentation.

## Phase 2: Adversaries

Implemented.

Adds a read-only reviewer role and `/swarm-adversaries`.

The reviewer should produce findings only. The orchestrator decides whether to send work back to coder.

## Phase 3: Four-Pack

Implemented.

Adds `swarm-specifier`, `swarm-refactorer`, `swarm-architect`, and `/swarm-four`.

The specifier should ask for user approval before implementation when acceptance criteria are non-trivial.

## Phase 4: Six-Pack

Implemented.

Adds `swarm-hardener`, `swarm-qa`, and `/swarm-six`.

Hardening and QA are explicitly scoped. Avoid expensive mutation or full-suite checks unless the project supports them and the user approves the cost.

## Phase 5: Squad

Still pending.

## Phase 5: Squad

Add a persistent `swarm-squad-leader` and transient role agents.

The squad workflow should include:

- Theme clarification.
- Story packet state.
- Approval gates.
- Assignment files.
- Result handoffs.
- Optional worktree isolation.

This should not be implemented until the simpler packs are stable.

## Phase 6: Optional Worktrees

Status: shipped.

Per-role worktrees isolate subagent edits while the orchestrator keeps the existing commit-byline contract.

Deliverables:

- `packs/two-pack/skills/opencode-swarm/SKILL.md` — new "Worktree Discipline" section.
- `packs/two-pack/agents/swarm-orchestrator.md` — new "Worktree Rules" section alongside "Commit Rules"; HANDOFF expectations updated to include `worktree_path`, `branch`, `base_sha`; final response includes `worktrees_used`.
- `packs/two-pack/agents/swarm-coder.md` and `swarm-cleaner.md` — HANDOFF extended with worktree fields; rules forbid creating/removing/merging worktrees.
- `packs/adversaries/agents/swarm-reviewer.md` — same HANDOFF extension; read-only review still applies.
- `packs/two-pack/commands/swarm-two.md` and `packs/adversaries/commands/swarm-adversaries.md` — document `--no-worktree` opt-out.
- `docs/worktree-discipline.md` — canonical spec (layout, naming, merge strategy, dirty detection, conflict detection, opt-out, concurrent session safety, recovery).
- `docs/architecture.md` — updated diagrams showing worktree boundaries.
- `docs/usage.md` — updated flow with worktree add/remove, final summary includes `worktrees_used`.
- `docs/troubleshooting.md` — worktree recovery, non-git project, concurrent session notes, `.worktrees/` gitignore recommendation.

Requirements honored:

- Merge strategy documented (squash with `By <role>.` byline).
- Conflict resolution flow documented (orchestrator stops and asks; never force-resolves; never reverts user changes).
- Dirty worktree detection (before the first delegation of a session).
- Cleanup/recovery commands (`git worktree remove --force`, reflog recovery).
- Clear rule for user-owned changes (stop-and-ask on unexpected files; user changes never reverted).

Opt-out: `--no-worktree` flag in command arguments or `OPENCODE_SWARM_NO_WORKTREE=1` env var.

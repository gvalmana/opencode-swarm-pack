# Future Teams

Future work should be incremental. Do not implement all SwarmForge complexity before the `delivery-team` has proven useful.

## Phase 1: Delivery Team

Implemented first.

Deliverables:

- Shared skill.
- Orchestrator.
- Coder.
- Cleaner.
- `/swarm-delivery` command.
- Installer.
- Documentation.

## Phase 2: Review Team

Implemented.

Adds a read-only reviewer role and `/swarm-review`.

The reviewer should produce findings only. The orchestrator decides whether to send work back to coder.

## Phase 3: Feature Team

Implemented.

Adds `swarm-specifier`, `swarm-refactorer`, `swarm-architect`, and `/swarm-feature`.

The specifier should ask for user approval before implementation when acceptance criteria are non-trivial.

## Phase 4: Assurance Team

Implemented.

Adds `swarm-hardener`, `swarm-qa`, and `/swarm-assurance`.

Hardening and QA are explicitly scoped. Avoid expensive mutation or full-suite checks unless the project supports them and the user approves the cost.

## Phase 5: Mission Team

Status: implemented.

Adds a persistent `swarm-mission-leader`, mission-specific planning agents, and `/swarm-mission`.

The mission workflow should include:

- Theme clarification.
- Story state.
- Approval gates.
- Assignment files.
- Result handoffs.
- Optional worktree isolation.

Mission work reuses existing implementation, review, cleanup, architecture, hardening, and QA agents instead of duplicating them.

## Phase 6: Optional Worktrees

Status: shipped.

Per-role worktrees isolate subagent edits while the orchestrator keeps the existing commit-byline contract.

Deliverables:

- `teams/delivery-team/skills/opencode-swarm/SKILL.md` — new "Worktree Discipline" section.
- `teams/delivery-team/agents/swarm-orchestrator.md` — new "Worktree Rules" section alongside "Commit Rules"; HANDOFF expectations updated to include `worktree_path`, `branch`, `base_sha`; final response includes `worktrees_used`.
- `teams/delivery-team/agents/swarm-coder.md` and `swarm-cleaner.md` — HANDOFF extended with worktree fields; rules forbid creating/removing/merging worktrees.
- `teams/review-team/agents/swarm-reviewer.md` — same HANDOFF extension; read-only review still applies.
- `teams/delivery-team/commands/swarm-delivery.md` and `teams/review-team/commands/swarm-review.md` — document `--no-worktree` opt-out.
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

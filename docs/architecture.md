# Architecture

OpenCode Swarm Teams adapts SwarmForge concepts to OpenCode without copying the tmux daemon model.

## Mapping From SwarmForge

| SwarmForge | OpenCode Swarm Teams |
|---|---|
| `swarmforge.conf` | OpenCode command files |
| `roles/*.prompt` | OpenCode agent files |
| constitution articles | shared OpenCode skill |
| file handoff helpers | structured handoff text |
| daemon-driven tmux wakeups | orchestrator-controlled delegation |
| role worktrees | per-role worktrees since Phase 6 (one shared worktree before) |

## First Phase

Phase 1 through 5 intentionally avoids background daemons and uses a single shared worktree. Phase 6 introduces per-role worktrees while preserving the orchestrator-owned commit contract.

The orchestration model is:

```text
user -> swarm command -> orchestrator -> worktree add -> subagent -> handoff -> orchestrator -> squash-merge -> worktree remove -> next role
```

## Why A Command And Not Only Agents

OpenCode agents define behavior. OpenCode commands define entrypoints.

`/swarm-delivery` is not the team itself. It is the user-facing shortcut that starts the workflow with the right orchestrator and team instructions.

The command invokes `swarm-orchestrator`. The orchestrator then delegates to `swarm-coder` and `swarm-cleaner`.

Without a command, the user would need to manually select or prompt the orchestrator every time and remember the exact workflow rules. The command makes the workflow repeatable:

- It selects the correct primary agent.
- It passes the user's request into the team template.
- It fixes the intended flow: `coder -> cleaner -> final`.
- It keeps the invocation short: `/swarm-delivery <task>`.

The agents remain the actual workers. The command is only the front door.

## Multi-Target Direction

Swarm Pack is expected to support multiple AI coding tools through explicit installation targets. The installer must not auto-detect tools or scan user directories. Users select the tool with `--target`.

The current OpenCode files remain the functional implementation. Future targets should use a portable canonical model under `swarm/` and target adapters that render that model into each tool's native format.

See `docs/multi-target-support.md` for the roadmap and pending work.

## Delivery Team Flow Diagram

```text
┌────────────┐
│   User     │
└─────┬──────┘
      │ /swarm-delivery <task>
      ▼
┌────────────────────┐
│ swarm-delivery command │
│ entrypoint only    │
└─────┬──────────────┘
      │ starts selected agent
      ▼
┌────────────────────┐
│ swarm-orchestrator │
│ main worktree      │
└─────┬──────────────┘
      │ git worktree add (coder)
      ▼
┌────────────────────────────────────┐
│ .worktrees/swarm-coder/<task-id>   │
│   ┌────────────────────┐           │
│   │ swarm-coder        │           │
│   │ edits + verifies   │           │
│   └─────┬──────────────┘           │
└─────────┼──────────────────────────┘
          │ HANDOFF (with worktree_path, branch, base_sha)
          ▼
┌────────────────────┐
│ swarm-orchestrator │
│ git merge --squash  │
│ git commit By coder │
│ git worktree remove│
└─────┬──────────────┘
      │ git worktree add (cleaner)
      ▼
┌────────────────────────────────────┐
│ .worktrees/swarm-cleaner/<task-id> │
│   ┌────────────────────┐           │
│   │ swarm-cleaner      │           │
│   │ cleanup + verifies │           │
│   └─────┬──────────────┘           │
└─────────┼──────────────────────────┘
          │ HANDOFF
          ▼
┌────────────────────┐
│ swarm-orchestrator │
│ commit By cleaner  │
│ if needed          │
└─────┬──────────────┘
      │ summary
      ▼
┌────────────┐
│   User     │
└────────────┘
```

## Mermaid Diagram

```mermaid
flowchart TD
    U[User] --> C["/swarm-delivery command"]
    C --> O[swarm-orchestrator main worktree]
    O -->|git worktree add coder| WT1[".worktrees/swarm-coder/<task-id>"]
    WT1 --> CODER[swarm-coder]
    CODER -->|HANDOFF with worktree_path, branch, base_sha| O
    O -->|git merge --squash + commit By coder| GC[Git commit on main]
    GC --> O
    O -->|git worktree remove coder| O
    O -->|git worktree add cleaner| WT2[".worktrees/swarm-cleaner/<task-id>"]
    WT2 --> CLEANER[swarm-cleaner]
    CLEANER -->|HANDOFF| O
    O -->|commit By cleaner if needed| GCL[Optional git commit]
    GCL --> O
    O --> S[Final summary]
    S --> U
```

## Review Team Flow Diagram

```text
┌────────────┐
│   User     │
└─────┬──────┘
      │ /swarm-review <task>
      ▼
┌──────────────────────────┐
│ swarm-review command     │
│ entrypoint only          │
└─────┬────────────────────┘
      ▼
┌────────────────────┐
│ swarm-orchestrator │
│ main worktree      │
└─────┬──────────────┘
      │ git worktree add (coder)
      ▼
┌────────────────────────────────────┐
│ .worktrees/swarm-coder/<task-id>   │
│   ┌────────────────────┐           │
│   │ swarm-coder        │           │
│   └─────┬──────────────┘           │
└─────────┼──────────────────────────┘
          │ HANDOFF
          ▼
┌────────────────────┐
│ swarm-orchestrator │
│ inspect + commit   │
│ worktree remove    │
└─────┬──────────────┘
      │ git worktree add (reviewer)
      ▼
┌────────────────────────────────────┐
│ .worktrees/swarm-reviewer/<id>     │
│   ┌────────────────────┐           │
│   │ swarm-reviewer     │           │
│   │ no edits allowed   │           │
│   └─────┬──────────────┘           │
└─────────┼──────────────────────────┘
          │ HANDOFF with decision
          ▼
┌────────────────────┐
│ swarm-orchestrator │
└─────┬──────────────┘
      ├─ approved ───────────► final summary
      │
      └─ changes-requested ─► new coder worktree -> focused fix
```

The orchestrator is responsible for:

- Talking to the user.
- Selecting the workflow steps.
- Delegating to role agents.
- Inspecting changes after each role.
- Running or requesting verification.
- Creating small role-owned commits.
- Stopping on blockers or unsafe state.

Subagents are responsible for:

- Performing only their role-owned work.
- Keeping scope narrow.
- Verifying their changes when possible.
- Returning a structured handoff.
- Not committing.
- Not talking directly to the user.

## Commit Ownership

Only the orchestrator creates commits. This keeps history clean and prevents subagents from committing unexpected changes or user-owned work.

## Future Worktrees

Per-role worktrees are shipped in Phase 6. See `docs/worktree-discipline.md` for the full spec: layout, naming, merge strategy, dirty detection, conflict detection, opt-out, concurrent session safety, and recovery.

Earlier phases used one shared worktree sequentially. Phase 6 keeps the orchestrator-owned commit contract intact and adds isolation for subagent edits.

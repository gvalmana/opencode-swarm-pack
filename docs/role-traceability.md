# Role Traceability

OpenCode Swarm Pack keeps role names traceable to SwarmForge while adding a `swarm-` prefix to avoid collisions with existing OpenCode agents. Each role prompt mirrors the SwarmForge source prompt and adapts it to OpenCode's tool model.

## Adaptation Philosophy

SwarmForge orchestrates roles through tmux panes, handoff helper scripts (`swarm_handoff.sh`, `ready_for_next.sh`, `done_with_current.sh`), per-role worktrees, and file-based handoff daemons. OpenCode orchestrates through a single `swarm-orchestrator` agent that delegates to subagents via the model tool.

The adaptation rule for every role is:

- Preserve the role's `Owns` and `Does Not Own` sections verbatim from SwarmForge.
- Preserve the role's workflow phases, analysis tools, and verification scope.
- Replace SwarmForge-specific artifacts (Gherkin APS, `gherkin-mutator`, `ready_for_next.sh`, `done_with_current.sh`, per-role worktree daemon) with OpenCode equivalents:
  - Subagent delegation is performed by the orchestrator through the `Task` tool.
  - Handoffs are returned through a structured `HANDOFF` block at the end of each subagent response.
  - Per-role worktrees are an opt-in feature controlled by the orchestrator (off by default in phase 1).
  - Mutation, CRAP, DRY, and acceptance mutators are run only when the project actually has them.
- Preserve the discipline contract: only the orchestrator commits; subagents edit files and report a handoff.

## Implemented Roles

| OpenCode Role | SwarmForge Source | Status |
|---|---|---|
| `swarm-orchestrator` | OpenCode adaptation of pack coordination | implemented |
| `swarm-coder` | `two-pack/coder`, `four-pack/coder`, `six-pack/coder`, `adversaries/coder` | implemented (two-pack, four-pack, six-pack, adversaries share the same prompt) |
| `swarm-cleaner` | `two-pack/cleaner`, `six-pack/cleaner` | implemented (two-pack, six-pack) |
| `swarm-reviewer` | `adversaries/reviewer` | implemented for adversaries |
| `swarm-specifier` | `four-pack/specifier`, `six-pack/specifier` | implemented for four-pack and six-pack |
| `swarm-refactorer` | `four-pack/refactorer` | implemented for four-pack |
| `swarm-architect` | `four-pack/architect`, `six-pack/architect` | implemented for four-pack and six-pack |
| `swarm-hardener` | `six-pack/hardender` (normalized name) | implemented for six-pack |
| `swarm-qa` | `six-pack/QA` (normalized name) | implemented for six-pack |

`swarm-orchestrator` is an OpenCode-specific role. SwarmForge uses shell scripts, tmux, and handoff daemons for orchestration; OpenCode needs a prompt-level orchestrator to coordinate subagents and commits.

## Planned Pack Roles (Squad)

| OpenCode Role | SwarmForge Source | Planned Pack |
|---|---|---|
| `swarm-squad-leader` | `squad/squad-leader` | squad |
| `swarm-analyst` | `squad/analyst` | squad |
| `swarm-gherkin-writer` | `squad/gherkin-writer` | squad |
| `swarm-qa-procedure-writer` | `squad/qa-procedure-writer` | squad |
| `swarm-gherkin-reviewer` | `squad/gherkin-reviewer` | squad |
| `swarm-qa-procedure-reviewer` | `squad/qa-procedure-reviewer` | squad |
| `swarm-implementer` | `squad/implementer` | squad |
| `swarm-code-reviewer` | `squad/code-reviewer` | squad |
| `swarm-senior-implementor` | `squad/senior-implementor` | squad |
| `swarm-merger` | `squad/merger` | squad |

## Naming Notes

SwarmForge `six-pack` uses `hardender`. SwarmForge `squad` uses `hardener`. OpenCode Swarm Pack normalizes this to `swarm-hardener` because it is clearer and aligns with the later `squad` branch.

SwarmForge `six-pack` uses uppercase `QA`. OpenCode Swarm Pack normalizes this to `swarm-qa` to keep filenames lowercase and consistent.

## Per-Role Differences Versus SwarmForge

- **Specifier**: keeps the five-phase specification workflow (write, prune, normalize, background, ask for approval) and the rule "do not commit or notify coder until the user explicitly approves the handoff". OpenCode removes the `ir-dry-checker` and APS references because they are SwarmForge-specific tools; the same intent (deterministic, pruned criteria) is encoded as rules.
- **Coder**: keeps the acceptance pipeline discipline and the explicit "do not run mutation/CRAP/DRY" rule. OpenCode does not assume Babashka or Go-based Gherkin parsers; the role uses the project's existing test conventions when no pipeline exists.
- **Cleaner**: keeps the CRAP-≤6, DRY, and mutation scan-count rules, the 100-mutation-sites-per-file split rule, and the "ignore QA suite" rule. OpenCode version makes CRAP/DRY/mutation conditional on the project having them.
- **Refactorer**: same as cleaner plus property testing responsibility. Both share a common structure but differ in scope: refactorer is allowed to touch architecture-adjacent code, cleaner is restricted to local cleanup.
- **Architect**: keeps the four review phases (UI/Core Separation, Dependency Rule, Information Hiding, Local Code Quality), the mutation worker limit (`--max-workers 8`), and the differential mutation rule. The "Refactorer handoffs" / `BATCH` / `TASK` shape is replaced by the orchestrator delegating one task at a time.
- **Hardener**: keeps the mutation hardening discipline and the Gherkin mutation "no-op step" rule. In OpenCode this is conditional on the project having acceptance mutators.
- **QA**: keeps the end-to-end-through-UI rule (no private API for QA), the QA-procedure-to-script conversion, and the "reproduce before fixing" rule. In OpenCode this becomes "exercise the change through the project's normal entrypoint or UI, not through a private test API".

## Hand-Off Mapping

SwarmForge hand-off:

```text
type: git_handoff
to: <role>[,<role>...]
priority: NN
task: <short-stable-task-name>
commit: <10-character-commit-abbrev>
```

OpenCode hand-off:

```text
HANDOFF
role: <role>
status: completed|blocked|failed
task: <short-stable-task-name>
commit_needed: yes|no
changed_files:
verification:
next_recommended_role:
summary:
risks:
```

The orchestrator owns `commit_needed` decisions and creates the commit. Role-specific fields (`decision`/`findings` for reviewer, `architecture_notes` for architect, `edge_cases_covered` for hardener, `qa_report` for QA) extend the block without replacing the base fields.

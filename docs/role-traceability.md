# Role Traceability

OpenCode Swarm Teams keeps role names traceable to SwarmForge while adding a `swarm-` prefix to avoid collisions with existing OpenCode agents. Each role prompt mirrors the SwarmForge source prompt and adapts it to OpenCode's tool model.

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
| `swarm-orchestrator` | OpenCode adaptation of team coordination | implemented |
| `swarm-coder` | delivery, feature, assurance, and review implementation roles | implemented and reusable |
| `swarm-cleaner` | delivery and assurance cleanup roles | implemented and reusable |
| `swarm-reviewer` | review-team reviewer | implemented for review-team |
| `swarm-specifier` | feature and assurance specification roles | implemented and reusable |
| `swarm-refactorer` | feature refactorer | implemented for feature-team |
| `swarm-architect` | feature and assurance architecture roles | implemented and reusable |
| `swarm-hardener` | assurance hardening role | implemented for assurance-team |
| `swarm-qa` | assurance QA role | implemented for assurance-team |

`swarm-orchestrator` is an OpenCode-specific role. SwarmForge uses shell scripts, tmux, and handoff daemons for orchestration; OpenCode needs a prompt-level orchestrator to coordinate subagents and commits.

## Mission Team Roles

| OpenCode Role | SwarmForge Source | Team |
|---|---|---|
| `swarm-mission-leader` | source mission leader | mission-team |
| `swarm-analyst` | source analyst | mission-team |
| `swarm-gherkin-writer` | source gherkin-writer | mission-team |
| `swarm-qa-procedure-writer` | source qa-procedure-writer | mission-team |
| `swarm-gherkin-reviewer` | source gherkin-reviewer | mission-team |
| `swarm-qa-procedure-reviewer` | source qa-procedure-reviewer | mission-team |
| `swarm-mission-implementer` | source implementer | mission-team |
| `swarm-mission-cleaner` | source cleaner | mission-team |
| `swarm-mission-code-reviewer` | source code-reviewer | mission-team |
| `swarm-mission-architect` | source architect | mission-team |
| `swarm-mission-hardener` | source hardener | mission-team |
| `swarm-mission-qa` | source qa | mission-team |
| `swarm-mission-senior-implementor` | source senior-implementor | mission-team |
| `swarm-merger` | source merger | mission-team |

## Mission Team Naming

OpenCode installs agents into a flat namespace. Mission roles that would collide with shared agents use `swarm-mission-*` names while keeping the source role's responsibility.

## Naming Notes

SwarmForge source workflows use `hardender` in one place and `hardener` in another. OpenCode Swarm Teams normalizes this to `swarm-hardener`.

SwarmForge source workflows use uppercase `QA`. OpenCode Swarm Teams normalizes this to `swarm-qa` to keep filenames lowercase and consistent.

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

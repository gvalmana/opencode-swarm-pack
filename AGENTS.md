# AGENTS.md

This repository is a **team workflow bundle** for OpenCode, not a runnable application. It ships reusable agent, command, and skill definitions that `install.sh` copies into an OpenCode config directory. There is no build, test, lint, or typecheck step.

## Layout

- `install.sh` — bash installer (the only executable).
- `teams/<team-name>/` — each team contains `agents/`, `commands/`, `skills/`.
- `docs/` — canonical specs. Treat these as the source of truth over the README when they conflict.
- `teams/mission-team/` — advanced workflow; reuse existing agents for equivalent implementation, review, cleanup, architecture, hardening, and QA roles.

## Installer

The wrapper assumes one-time self-install has been run (`./install.sh --self-install`), which places a wrapper at `~/.local/bin/opencode-swarm-install`. After that, install from any project:

```sh
opencode-swarm-install --local .
opencode-swarm-install --global
opencode-swarm-install --global --team review-team
opencode-swarm-install --local . --force   # overwrite existing files
```

Gotchas:

- The installer **refuses to overwrite** an existing file unless `--force` is passed or the destination is byte-identical (`cmp -s`). Edit-team work in a consumer project will need `--force`.
- After install, **restart OpenCode**. Agents, commands, and skills are loaded at startup; an in-session install will not appear until restart.
- `--team review-team` and `--team feature-team` auto-install shared `delivery-team` files; `--team assurance-team` auto-installs both `delivery-team` and `feature-team` dependencies; `--team mission-team` installs only `delivery-team` plus `mission-team`.
- `--local <path>` resolves `<path>` with `cd -P`, so a relative path must exist; `mkdir` it first.

## Team content conventions

When editing or adding files inside `teams/`:

- **YAML frontmatter is load-bearing.** `agents/*.md` must declare `mode` (`primary` or `subagent`) and a `permission` block; `commands/*.md` must declare `agent:` pointing at the orchestrator; `skills/<name>/SKILL.md` is the exact filename OpenCode looks for. Renaming any of these will break installation silently (file just won't be picked up).
- **Role names use the `swarm-` prefix** to avoid collisions with built-in OpenCode agents. See `docs/role-traceability.md` for the SwarmForge → OpenCode name mapping and the `hardender → hardener` / `QA → qa` normalizations.
- **Subagents never commit.** Only `swarm-orchestrator` and `swarm-mission-leader` run `git commit`. This is enforced in prompt text, not by tooling — preserve the rule when editing agent prompts.
- **HANDOFF format is fixed.** Every role agent must finish with the block defined in `teams/delivery-team/skills/opencode-swarm/SKILL.md` and `docs/handoff-protocol.md`. Reviewers add a `decision:` and `findings:` field. Do not invent new fields without updating the skill and the protocol doc.
- **Commit messages include `By <role>.` on a trailing line.** This is part of the discipline contract; do not drop it.
- **Subagents return `commit_needed: no` and never touch git state** beyond `git status` / `git diff`. Their permission blocks reflect this — keep `git commit*` and `git add*` out of allow-lists for subagents.
- **Worktree discipline (Phase 6).** When enabled, each subagent operates only inside the worktree path the orchestrator assigns (`.worktrees/swarm-<role>/<task-id>`, branch `swarm/<role>/<task-id>`). Subagents must not run `git worktree*`, `git merge*`, `git commit*`, or `git add*` — the orchestrator owns all of that. Subagent HANDOFFs must include `worktree_path`, `branch`, and `base_sha`. Honor the opt-out: `--no-worktree` in command arguments or `OPENCODE_SWARM_NO_WORKTREE=1`. See `docs/worktree-discipline.md` for the spec.

## Team status

Implemented and shippable:

- `delivery-team` (coder → cleaner → final)
- `review-team` (coder → reviewer → coder until approved)
- `feature-team` (specifier → coder → refactorer → architect → final)
- `assurance-team` (specifier → coder → cleaner → architect → hardener → qa → final)
- `mission-team` (mission leader coordinates analysis, acceptance, QA procedure, implementation, review, hardening, QA, readiness, final)

Agents are reusable across teams by default. `mission-team` is the exception: it carries dedicated `swarm-mission-*` agents to mirror the full source workflow without overwriting shared agent names in OpenCode's flat agent namespace.

## Validation without a test suite

There are no automated tests. To sanity-check a team change manually:

1. `./install.sh --local /tmp/scratch-project --team <team> --force` against a throwaway git repo.
2. Confirm files appear at `/tmp/scratch-project/.opencode/{agents,commands,skills}/`.
3. Read the installed `.md` files back and confirm YAML frontmatter parses (no stray tabs, quoted strings intact).
4. For agents: confirm `mode` and `permission` blocks match the role's intended bash allow-list (orchestrator may `git commit`; subagents must not).
5. After a successful `/swarm-delivery` session, run `git worktree list` and confirm only the main worktree remains. Confirm `.worktrees/` is added to `.gitignore` in the consumer project (the orchestrator suggests it but does not modify the file).

## Do not

- Do not add a `package.json`, lockfile, CI workflow, or test runner. This repo does not have one and adding one will mislead future agents into running nonexistent commands.
- Do not name mission-specific duplicates `swarm-coder`, `swarm-cleaner`, `swarm-reviewer`, `swarm-architect`, `swarm-hardener`, or `swarm-qa`; OpenCode installs agents into a flat namespace, so mission-specific duplicates use `swarm-mission-*` names.
- Do not change `install.sh` semantics (refuses-overwrite, `--force`, `--self-install` wrapper creation) without updating `docs/installation.md` in the same change.

# AGENTS.md

This repository is a **content pack** for OpenCode, not a runnable application. It ships agent, command, and skill definitions that `install.sh` copies into an OpenCode config directory. There is no build, test, lint, or typecheck step.

## Layout

- `install.sh` — bash installer (the only executable).
- `packs/<pack-name>/` — each pack contains `agents/`, `commands/`, `skills/`.
- `docs/` — canonical specs. Treat these as the source of truth over the README when they conflict.
- `packs/squad/` — reserved placeholder, not implemented. Do not add live squad files unless the work is actually implementing that pack.

## Installer

The wrapper assumes one-time self-install has been run (`./install.sh --self-install`), which places a wrapper at `~/.local/bin/opencode-swarm-install`. After that, install from any project:

```sh
opencode-swarm-install --local .
opencode-swarm-install --global
opencode-swarm-install --global --pack adversaries
opencode-swarm-install --local . --force   # overwrite existing files
```

Gotchas:

- The installer **refuses to overwrite** an existing file unless `--force` is passed or the destination is byte-identical (`cmp -s`). Edit-pack work in a consumer project will need `--force`.
- After install, **restart OpenCode**. Agents, commands, and skills are loaded at startup; an in-session install will not appear until restart.
- `--pack adversaries` and `--pack four-pack` auto-install shared `two-pack` files; `--pack six-pack` auto-installs both `two-pack` and `four-pack` dependencies.
- `--local <path>` resolves `<path>` with `cd -P`, so a relative path must exist; `mkdir` it first.

## Pack content conventions

When editing or adding files inside `packs/`:

- **YAML frontmatter is load-bearing.** `agents/*.md` must declare `mode` (`primary` or `subagent`) and a `permission` block; `commands/*.md` must declare `agent:` pointing at the orchestrator; `skills/<name>/SKILL.md` is the exact filename OpenCode looks for. Renaming any of these will break installation silently (file just won't be picked up).
- **Role names use the `swarm-` prefix** to avoid collisions with built-in OpenCode agents. See `docs/role-traceability.md` for the SwarmForge → OpenCode name mapping and the `hardender → hardener` / `QA → qa` normalizations.
- **Subagents never commit.** Only `swarm-orchestrator` runs `git commit`. This is enforced in prompt text, not by tooling — preserve the rule when editing agent prompts.
- **HANDOFF format is fixed.** Every role agent must finish with the block defined in `packs/two-pack/skills/opencode-swarm/SKILL.md` and `docs/handoff-protocol.md`. Reviewers add a `decision:` and `findings:` field. Do not invent new fields without updating the skill and the protocol doc.
- **Commit messages include `By <role>.` on a trailing line.** This is part of the discipline contract; do not drop it.
- **Subagents return `commit_needed: no` and never touch git state** beyond `git status` / `git diff`. Their permission blocks reflect this — keep `git commit*` and `git add*` out of allow-lists for subagents.
- **Worktree discipline (Phase 6).** When enabled, each subagent operates only inside the worktree path the orchestrator assigns (`.worktrees/swarm-<role>/<task-id>`, branch `swarm/<role>/<task-id>`). Subagents must not run `git worktree*`, `git merge*`, `git commit*`, or `git add*` — the orchestrator owns all of that. Subagent HANDOFFs must include `worktree_path`, `branch`, and `base_sha`. Honor the opt-out: `--no-worktree` in command arguments or `OPENCODE_SWARM_NO_WORKTREE=1`. See `docs/worktree-discipline.md` for the spec.

## Pack status

Implemented and shippable:

- `two-pack` (coder → cleaner → final)
- `adversaries` (coder → reviewer → coder until approved)
- `four-pack` (specifier → coder → refactorer → architect → final)
- `six-pack` (specifier → coder → cleaner → architect → hardener → qa → final)

Planned but not implemented: `squad`. See `docs/future-packs.md` and `packs/squad/README.md`; do not move it from placeholder to live pack until the matching `swarm-*` agent files and command file actually exist.

## Validation without a test suite

There are no automated tests. To sanity-check a pack change manually:

1. `./install.sh --local /tmp/scratch-project --pack <pack> --force` against a throwaway git repo.
2. Confirm files appear at `/tmp/scratch-project/.opencode/{agents,commands,skills}/`.
3. Read the installed `.md` files back and confirm YAML frontmatter parses (no stray tabs, quoted strings intact).
4. For agents: confirm `mode` and `permission` blocks match the role's intended bash allow-list (orchestrator may `git commit`; subagents must not).
5. After a successful `/swarm-two` session, run `git worktree list` and confirm only the main worktree remains. Confirm `.worktrees/` is added to `.gitignore` (the orchestrator suggests it but does not modify the file).

## Do not

- Do not add a `package.json`, lockfile, CI workflow, or test runner. This repo does not have one and adding one will mislead future agents into running nonexistent commands.
- Do not implement `squad` files speculatively. `docs/packs.md`, `docs/future-packs.md`, and `packs/squad/README.md` label it planned.
- Do not change `install.sh` semantics (refuses-overwrite, `--force`, `--self-install` wrapper creation) without updating `docs/installation.md` in the same change.

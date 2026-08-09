# Multi-Target Support

Swarm Pack is intended to support multiple AI coding tools through explicit installation targets. The installer must not scan user directories or auto-detect tools. Users choose the target they want to install into.

Example commands:

```sh
swarm-pack install --target opencode --local .
swarm-pack install --target opencode --global
swarm-pack install --target codex --local .
swarm-pack install --target codex --global
```

## Confirmed Decisions

- `--target` is required.
- The installer does not auto-detect tools.
- The installer does not scan user directories looking for supported tools.
- Phase 1 prepares the multi-target architecture only.
- OpenCode remains the only functional target in Phase 1.
- The first new target planned after Phase 1 is `codex`.
- Portable definitions will live under a canonical `swarm/` folder.
- Existing OpenCode-oriented `teams/` assets remain supported during the transition.
- `install.sh` remains a legacy manual installer and is not invoked by npm.

## Why Targets Need Adapters

The current team files are OpenCode-specific. Agents use OpenCode frontmatter such as `mode`, `permission`, and command routing through `agent`. Commands use OpenCode conventions such as `commands/*.md` and `$ARGUMENTS`.

Those files cannot be copied unchanged into other tools because each tool has different expectations for:

- Configuration paths.
- Agent or role definitions.
- Slash commands or prompt invocation.
- Skill or instruction discovery.
- Permission modeling.
- Subagent support.
- Global versus project-local configuration.

Multi-target support therefore needs a portable swarm model plus target adapters that render or install that model into each tool's native format.

## Target Contract

Each target should expose a small common contract:

```js
{
  id: "opencode",
  displayName: "OpenCode",
  capabilities: {
    agents: true,
    commands: true,
    skills: true,
    permissions: true,
    subagents: true
  },
  resolveTargetDirectory(options) {},
  installTeam(context) {}
}
```

`src/install.js` should not import target implementations directly. It should resolve targets through a registry.

Planned structure:

```text
src/
  targets/
    registry.js
    opencode.js
    codex.js
```

## Phase 1: Architecture Preparation

Implemented foundation:

- `src/targets/registry.js` lists supported targets.
- `src/install.js` resolves targets through the registry instead of importing concrete target modules.
- `opencode` is the only supported target.
- `opencode` exposes capability metadata.
- Existing OpenCode installation behavior is preserved.
- `--target` remains required.
- The canonical `swarm/` folder is documented.
- Codex behavior is intentionally not implemented in this phase.

Acceptance criteria:

- `swarm-pack install --target opencode --local .` still installs the same files as before.
- `swarm-pack install --target opencode --global` still installs the same files as before.
- Missing `--target` still fails.
- Unsupported targets still fail with a clear list of available targets.
- `src/install.js` no longer knows concrete target modules directly.
- The registry is the only place that lists supported targets.

## Phase 2: Canonical Swarm Folder

Portable definitions will live under `swarm/`.

Initial target structure:

```text
swarm/
  README.md
  teams/
    delivery-team/
      team.json
      roles/
      workflows/
      skills/
```

The canonical model should represent:

- Teams.
- Roles.
- Workflows.
- Skills and shared instructions.
- Handoff protocol.
- Commit discipline.
- Worktree discipline.
- Required capabilities.

Example `team.json` shape:

```json
{
  "id": "delivery-team",
  "name": "Delivery Team",
  "dependencies": [],
  "workflows": ["delivery"],
  "roles": ["coder", "cleaner"],
  "requiredCapabilities": ["agents", "commands", "subagents"]
}
```

The first canonical folder change should be documentation or scaffolding only. Do not migrate all existing teams in one step unless there is a separate migration plan.

## Phase 3: Renderers

Each target should translate the canonical model into its native files.

OpenCode renderer responsibilities:

- Generate or copy `agents/*.md`.
- Generate or copy `commands/*.md`.
- Generate or copy `skills/*/SKILL.md`.
- Preserve OpenCode-specific frontmatter and permission metadata.

Codex renderer responsibilities are pending research. The renderer should not be implemented until Codex's expected global and local configuration formats are documented.

## Phase 4: Codex Target

Codex is the first planned target after architecture preparation.

Pending research:

- Local configuration path.
- Global configuration path.
- Supported instruction files.
- Whether Codex supports agents or role-like prompts.
- Whether Codex supports commands or prompt shortcuts.
- Whether Codex supports reusable skills.
- Whether Codex supports permission metadata.
- Whether Codex supports subagent orchestration.

Pending implementation:

- Add `src/targets/codex.js`.
- Register `codex` in `src/targets/registry.js`.
- Add Codex capabilities.
- Add Codex installation docs.
- Add validation for unsupported team capabilities.

Expected commands:

```sh
swarm-pack install --target codex --local .
swarm-pack install --target codex --global
```

## Optional Informational Commands

These commands may be added later. They should not scan user directories.

```sh
swarm-pack targets
swarm-pack teams
```

`swarm-pack targets` should list registered targets only:

```text
Supported targets:
- opencode
- codex
```

`swarm-pack teams` should list bundled teams only.

## Risks

- Some tools may not support subagents.
- Some tools may not support declarative permissions.
- Some tools may not support slash commands.
- Some tools may only support repository instructions.
- A target may need degraded prompt-only installation.
- OpenCode-specific terminology must not leak into the canonical model.
- The canonical model must not remove existing OpenCode behavior until adapters can reproduce it.

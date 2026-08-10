# Multi-Target Support

Swarm Pack is intended to support multiple AI coding tools through explicit installation targets. The installer must not scan user directories or auto-detect tools. Users choose the target they want to install into.

Example commands:

```sh
swarm-pack install --target opencode --local .
swarm-pack install --target opencode --global
swarm-pack install --target codex --local .
swarm-pack install --target codex --global
swarm-pack install --target copilot --local .
swarm-pack install --target copilot --global
```

## Confirmed Decisions

- `--target` is required.
- Omitting `--team` installs all bundled teams.
- The installer does not auto-detect tools.
- The installer does not scan user directories looking for supported tools.
- OpenCode, Codex, and GitHub Copilot are functional targets.
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
    subagents: true,
    instructions: true
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
    copilot.js
```

## Phase 1: Architecture Preparation

Implemented foundation:

- `src/targets/registry.js` lists supported targets.
- `src/install.js` resolves targets through the registry instead of importing concrete target modules.
- `opencode` was the first supported target.
- `opencode` exposes capability metadata.
- Existing OpenCode installation behavior is preserved.
- `--target` remains required.
- The canonical `swarm/` folder is documented.
- Codex behavior is implemented by a target adapter after this phase.

Acceptance criteria:

- `swarm-pack install --target opencode --local .` still installs the same files as before.
- `swarm-pack install --target opencode --global` still installs the same files as before.
- Missing `--target` still fails.
- Unsupported targets still fail with a clear list of available targets.
- `src/install.js` no longer knows concrete target modules directly.
- The registry is the only place that lists supported targets.

## Phase 2: Canonical Swarm Folder

Portable definitions live under `swarm/`.

Implemented scaffold:

```text
swarm/
  README.md
  teams/
    delivery-team/
      team.json
      roles/
        README.md
      workflows/
        README.md
      skills/
        README.md
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

The current canonical delivery team is scaffold-only. Functional OpenCode assets still live under `teams/delivery-team/` until renderers can reproduce the existing behavior.

## Phase 3: Renderers

Each target should translate the canonical model into its native files.

OpenCode renderer responsibilities:

- Generate or copy `agents/*.md`.
- Generate or copy `commands/*.md`.
- Generate or copy `skills/*/SKILL.md`.
- Preserve OpenCode-specific frontmatter and permission metadata.

Codex renderer responsibilities:

- Render OpenCode-oriented `agents/*.md` role definitions to `.codex/agents/*.toml` custom agents.
- Generate compact Codex instructions in `AGENTS.md`.
- Copy reusable skills to `.agents/skills/` for project installs or `~/.agents/skills/` for global installs.
- Do not copy OpenCode commands because Codex does not use `.opencode/commands/*.md` or `/swarm-*` command files.
- Do not install `.rules` files by default because Codex rules are experimental security policy.

GitHub Copilot renderer responsibilities:

- Render OpenCode-oriented `agents/*.md` role definitions to `.github/agents/*.agent.md` or `~/.copilot/agents/*.agent.md` custom agents.
- Generate compact Copilot instructions in `.github/copilot-instructions.md` or `~/.copilot/copilot-instructions.md`.
- Copy reusable skills to `.agents/skills/` for project installs or `~/.agents/skills/` for global installs.
- Translate OpenCode permission intent to Copilot `tools` lists.
- Do not copy OpenCode commands because Copilot does not use `.opencode/commands/*.md` or `/swarm-*` command files.
- Do not install hooks by default because Copilot hooks are session policy and automation.

## Phase 4: Codex Target

Codex is the first target after architecture preparation.

Implemented behavior:

- Local custom agents: `<project>/.codex/agents/*.toml`.
- Global custom agents: `~/.codex/agents/*.toml`.
- Local instructions: `<project>/AGENTS.md`.
- Global instructions: `~/.codex/AGENTS.md`.
- Local skills: `<project>/.agents/skills/`.
- Global skills: `~/.agents/skills/`.
- Subagent workflows are prompt-driven through Codex custom agents.
- Read-only review roles render with `sandbox_mode = "read-only"`.
- Write-capable roles inherit the parent session sandbox and approval policy.

Intentional limitations:

- No `/swarm-*` slash commands for Codex.
- No `.codex/config.toml` generation in the first Codex target implementation.
- No `.codex/rules/*.rules` generation in the first Codex target implementation.
- No automatic Codex detection; users still pass `--target codex` explicitly.

Expected commands:

```sh
swarm-pack install --target codex --local .
swarm-pack install --target codex --global
```

After installing into Codex, invoke workflows with prompts such as:

```text
Run the swarm delivery workflow for this request. Use swarm-coder, then swarm-cleaner, and wait for each handoff before continuing.
```

## Phase 5: GitHub Copilot Target

GitHub Copilot is implemented as a native Markdown target.

Implemented behavior:

- Local custom agents: `<project>/.github/agents/*.agent.md`.
- Global custom agents: `~/.copilot/agents/*.agent.md`.
- Local instructions: `<project>/.github/copilot-instructions.md`.
- Global instructions: `~/.copilot/copilot-instructions.md`.
- Local skills: `<project>/.agents/skills/`.
- Global skills: `~/.agents/skills/`.
- Subagent workflows are prompt-driven through Copilot custom agents.
- Coordinator roles render with `tools: ["read", "search", "edit", "execute", "agent"]`.
- Read-only and readiness-review roles render with `tools: ["read", "search"]`.
- Write-capable roles render with `tools: ["read", "search", "edit", "execute"]`.

Intentional limitations:

- No `/swarm-*` slash command files for Copilot.
- No plugin packaging in the first Copilot target implementation.
- No hook generation in the first Copilot target implementation.
- No automatic Copilot detection; users still pass `--target copilot` explicitly.

Expected commands:

```sh
swarm-pack install --target copilot --local .
swarm-pack install --target copilot --global
```

After installing into Copilot, invoke workflows with prompts such as:

```text
Use the swarm-coder agent, then the swarm-cleaner agent, to run the delivery-team workflow for this request. Wait for each HANDOFF before continuing.
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
- copilot
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

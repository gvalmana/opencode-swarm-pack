# Canonical Swarm Definitions

This folder is reserved for portable swarm definitions that are not tied to a specific AI coding tool.

The current functional assets still live under `teams/` and are installed for the OpenCode target. Future multi-target work should move shared concepts into this folder and let target adapters render them into tool-specific formats.

Planned structure:

```text
swarm/
  teams/
    delivery-team/
      team.json
      roles/
      workflows/
      skills/
```

The canonical model should avoid OpenCode-specific frontmatter such as `mode`, `permission`, and `agent`. Tool-specific metadata belongs in target adapters or renderers.

`team.json` fields:

- `id`: stable team identifier used by the installer.
- `name`: human-readable team name.
- `summary`: short description of the team.
- `dependencies`: other canonical teams required before this team.
- `workflows`: workflow identifiers exposed by the team.
- `roles`: role identifiers used by the workflows.
- `skills`: shared instruction identifiers required by the team.
- `requiredCapabilities`: target capabilities required for native installation.
- `status`: maturity of the canonical definition, such as `scaffold` or `active`.

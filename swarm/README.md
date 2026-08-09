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

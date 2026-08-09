# Adversaries

Status: implemented.

Planned flow:

```text
coder -> reviewer -> coder until approved
```

This pack adapts the SwarmForge `adversaries` branch. The reviewer is read-only and adversarial, producing concrete findings rather than editing code.

Install only this pack:

```sh
opencode-swarm-install --local . --pack adversaries
```

If `swarm-orchestrator`, `swarm-coder`, or `opencode-swarm` are not already installed, also install `two-pack` because those files are shared by the first two packs:

```sh
opencode-swarm-install --local . --pack two-pack
opencode-swarm-install --local . --pack adversaries
```

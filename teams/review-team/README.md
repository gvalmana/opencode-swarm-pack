# Review Team

Status: implemented.

Flow:

```text
coder -> reviewer -> coder until approved
```

This team performs implementation followed by read-only adversarial review. The reviewer produces concrete findings rather than editing code.

Install this team:

```sh
opencode-swarm-install --local . --team review-team
```

The installer also installs shared `delivery-team` files because this team reuses `swarm-orchestrator`, `swarm-coder`, and `opencode-swarm`.

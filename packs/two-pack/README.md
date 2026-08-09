# Two-Pack

`two-pack` is the first implemented OpenCode Swarm workflow.

Flow:

```text
coder -> cleaner -> final
```

The orchestrator delegates implementation to `swarm-coder`, commits safe role-owned changes, delegates cleanup to `swarm-cleaner`, then produces a final summary.

Unlike SwarmForge's original `coder -> cleaner -> coder` loop, this first OpenCode version returns to coder only when cleaner identifies a functional issue.

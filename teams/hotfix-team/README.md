# Hotfix Team

Status: implemented.

Flow:

```text
coder -> reviewer -> final
```

Roles:

- `swarm-coder`: minimal implementation for the urgent fix.
- `swarm-reviewer`: read-only adversarial review.

Command:

```text
/swarm-hotfix <task>
```

Rules:

- Keep scope narrow and avoid opportunistic cleanup.
- Skip spec, refactor, hardening, and QA gates unless the reviewer blocks on them.
- Stop if the fix is not safe to ship without the heavier assurance workflow.

Dependencies:

- Reuses `review-team` and its transitive `delivery-team` base files.

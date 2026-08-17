# Usage

The first available command is `/swarm-delivery`.

The review command is `/swarm-review`.

The mission command is `/swarm-mission`.

Claude Code renders these workflow entrypoints as skills. OpenCode renders them as command files. Codex and Copilot use prompt-driven workflows with the installed agents.

Example:

```text
/swarm-delivery fix the checkout total duplication bug
/swarm-mission coordinate a multi-story checkout reliability initiative
```

Other examples:

```text
/swarm-delivery add validation for invoice dates
/swarm-delivery refactor the tax calculation service without changing behavior
/swarm-delivery fix the null customer edge case in checkout
```

## Team Selection Guide

| Team | Entrypoint | Best for | Avoid when |
|---|---|---|---|
| Delivery Team | `/swarm-delivery` | Small bugs, small features, focused local changes | Acceptance criteria are unclear or independent review is required |
| Review Team | `/swarm-review` | Risky fixes, review-heavy implementation, local PR hardening | The task is trivial or needs formal QA execution |
| Feature Team | `/swarm-feature` | Medium features, explicit acceptance criteria, architecture-adjacent behavior | You need independent QA or mission-level gates |
| Assurance Team | `/swarm-assurance` | Large or critical changes, hardening, independent QA | The change is too small for full quality-gate overhead |
| Mission Team | `/swarm-mission` | Epics, multi-story themes, acceptance and QA procedure gates | You need a quick local implementation loop |

Use the complete workflow entrypoint when you want repeatable orchestration. Use an individual agent only when you intentionally want that isolated role and no team workflow.

## Hello World Prompts

Delivery Team:

```text
/swarm-delivery crea un Hello World en Python que imprima exactamente "Hello, World!" al ejecutar python hello.py. No agregues dependencias y verifica con python hello.py.
```

Review Team:

```text
/swarm-review crea un Hello World en Python y revisa la implementación por edge cases, simplicidad y comandos de verificación. No agregues dependencias.
```

Feature Team:

```text
/swarm-feature crea una CLI mínima en Python para Hello World con criterios de aceptación explícitos antes de implementar. Debe ejecutarse con python hello.py y mostrar exactamente "Hello, World!".
```

Assurance Team:

```text
/swarm-assurance crea un Hello World en Python con verificación independiente y hardening básico. No agregues frameworks nuevos; debe ejecutarse con python hello.py y mostrar exactamente "Hello, World!".
```

Mission Team:

```text
/swarm-mission crea un Hello World en Python.

Objetivo:
- Crear un script Python simple que imprima `Hello, World!`.
- Usar una estructura mínima y clara.
- Añadir una prueba básica si el proyecto ya tiene convención de tests; si no existe, no agregues framework nuevo.

Criterios de aceptación:
- El script debe poder ejecutarse con `python hello.py`.
- La salida debe ser exactamente: `Hello, World!`.
- No modifiques archivos no relacionados.
- No agregues dependencias.
- Verifica la ejecución con el comando más pequeño posible.
```

## Hello World Example

This is a minimal example for testing that the team is installed and the delivery flow works.

Create an empty project:

```sh
mkdir hello-swarm
cd hello-swarm
git init
```

Install the team locally:

```sh
swarm-pack install --target opencode --local .
```

Restart OpenCode from the `hello-swarm` directory so it loads `.opencode/`.

Run:

```text
/swarm-delivery create a minimal Node.js hello world CLI. It should print "Hello, world!" when running npm start, and include a simple test or verification script if appropriate.
```

Expected flow:

```text
swarm-orchestrator -> worktree(coder) -> swarm-coder -> squash-merge + commit -> worktree(cleaner) -> swarm-cleaner -> optional squash-merge + commit -> worktree remove -> final summary
```

Expected result:

- A small Node.js hello world application.
- Two worktrees created and removed during the session:
  ```text
  .worktrees/swarm-coder/coder-2026-08-07-abc123
  .worktrees/swarm-cleaner/cleaner-2026-08-07-def456
  ```
- A role-owned coder commit on the main worktree with `By coder.`.
- A cleaner commit only if cleanup was useful.
- `git worktree list` shows only the main worktree at the end.
- Final summary listing verification, commits, worktree paths, and residual risks.

Possible final files:

```text
package.json
src/index.js
```

Possible verification command:

```sh
npm start
```

## Delivery Team Flow

```text
orchestrator -> coder -> commit -> cleaner -> optional commit -> final
```

The coder implements the behavior and tests.

The cleaner performs behavior-preserving cleanup.

The orchestrator commits after each role when there are safe, role-owned changes.

## Command Versus Agents

The command starts the workflow. The agents do the work.

```text
/swarm-delivery
  └── uses swarm-orchestrator
        ├── calls swarm-coder
        └── calls swarm-cleaner
```

Use the command when you want the complete repeatable workflow.

Use an individual agent only when you intentionally want that isolated role and no team orchestration.

Example direct-agent intent:

```text
Ask swarm-cleaner to review this diff for behavior-preserving cleanup only.
```

Example team intent:

```text
/swarm-delivery add a hello world CLI
```

Example adversarial review intent:

```text
/swarm-review add a hello world CLI and review it for edge cases
```

## Flow With Commits

```text
User
  │
  │ /swarm-delivery create hello world CLI
  ▼
swarm-orchestrator (main worktree)
  │
  │ git worktree add -b swarm/coder/<task-id> .worktrees/swarm-coder/<task-id> HEAD
  │ delegate to swarm-coder with worktree path, branch, base SHA
  ▼
swarm-coder (.worktrees/swarm-coder/<task-id>)
  │
  │ edits files, runs verification, returns HANDOFF with worktree_path
  ▼
swarm-orchestrator (main worktree)
  │
  │ git -C <wt> status + git diff <base>..HEAD + verification check
  │ git merge --squash swarm/coder/<task-id>
  │ git commit -m "Implement hello world CLI\n\nBy coder."
  │ git worktree remove --force .worktrees/swarm-coder/<task-id>
  │ git worktree add -b swarm/cleaner/<task-id> .worktrees/swarm-cleaner/<task-id> HEAD
  │ delegate to swarm-cleaner
  ▼
swarm-cleaner (.worktrees/swarm-cleaner/<task-id>)
  │
  │ behavior-preserving cleanup, returns HANDOFF
  ▼
swarm-orchestrator (main worktree)
  │
  │ optional git merge --squash swarm/cleaner/<task-id>
  │ optional git commit -m "Simplify hello world CLI\n\nBy cleaner."
  │ git worktree remove --force .worktrees/swarm-cleaner/<task-id>
  ▼
Final summary to user (with worktrees_used)
```

## Review Team Flow

Use `/swarm-review` when you want implementation followed by critical read-only review.

```text
User
  │
  │ /swarm-review fix checkout total duplication
  ▼
swarm-orchestrator (main worktree)
  │
  │ git worktree add (coder)
  │ delegate implementation
  ▼
swarm-coder (worktree)
  │
  │ edits files, runs verification, returns HANDOFF
  ▼
swarm-orchestrator (main worktree)
  │
  │ squash-merge + commit By coder + worktree remove
  │ git worktree add (reviewer)
  │ delegate read-only review
  ▼
swarm-reviewer (worktree)
  │
  │ read-only review, returns HANDOFF with decision
  ▼
swarm-orchestrator (main worktree)
  │
  ├── approved -> final summary (with worktrees_used)
  │
  └── changes requested -> git worktree add (coder) -> focused fix -> squash-merge -> re-review
```

The reviewer must not edit files. It returns findings and a decision only.

## Mission Team Flow

Use `/swarm-mission` when work needs mission-level analysis, acceptance scenarios, QA procedures, multiple quality gates, and readiness review.

```text
mission-leader -> analyst -> gherkin-writer -> gherkin-reviewer -> qa-procedure-writer -> qa-procedure-reviewer -> implementer -> cleaner -> code-reviewer -> architect -> hardener -> qa -> senior-implementor -> merger -> final
```

The mission leader coordinates the workflow through mission-specific agents named `swarm-mission-*` where their names would otherwise collide with shared agents.

## When The Flow Stops

The orchestrator stops when:

- The request is ambiguous.
- Verification fails and the next step is unclear.
- A subagent changes unexpected files.
- Existing user changes would be mixed with role-owned changes.
- A command needs unsafe permissions.
- The cleaner finds a functional issue that must go back to the coder.
- The project is not a git repository.
- The main worktree has uncommitted or untracked changes (excluding `.gitignore`).
- A `git merge --squash` reports conflicts or unexpected overlap.

## Expected Final Summary

The final response should include:

- Team used.
- Roles executed.
- Commits created.
- Verification commands run.
- `worktrees_used`: the paths of worktrees created and removed during the session.
- Remaining risks or skipped checks.

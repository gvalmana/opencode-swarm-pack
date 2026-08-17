# Teams

This document tracks supported Swarm Pack teams, the agents each team uses, and when each workflow is a good fit.

The agent responsibilities are target-independent. OpenCode, Codex, Copilot, and Claude Code render or install these roles differently, but the functional role contract is the same.

Entrypoints:

- OpenCode installs `/swarm-*` command files.
- Claude Code installs `/swarm-*` workflow skills.
- Codex and Copilot use prompt-driven workflows with the installed agents.

## Delivery Team

Status: implemented.

Summary: small delivery loop for implementation plus behavior-preserving cleanup.

Flow:

```text
coder -> cleaner -> final
```

Agents:

- `swarm-orchestrator`: coordinates the workflow, delegates roles, validates handoffs, and owns role-based commits when commits are requested.
- `swarm-coder`: implements behavior slices with focused tests or the smallest relevant verification.
- `swarm-cleaner`: improves local quality without changing behavior.

Use when:

- Small bugs.
- Small features.
- Focused backend changes.
- Local refactors with low behavioral risk.

Avoid when:

- Acceptance criteria are unclear.
- You need independent adversarial review.
- The change needs explicit QA or release readiness gates.

Entrypoint:

```text
/swarm-delivery <task>
```

Example prompt:

```text
/swarm-delivery crea un Hello World en Python que imprima exactamente "Hello, World!" al ejecutar python hello.py. No agregues dependencias y verifica con python hello.py.
```

Difference from SwarmForge: SwarmForge loops `cleaner -> coder`; Swarm Pack makes that return conditional to avoid unnecessary loops.

## Review Team

Status: implemented.

Summary: delivery loop with an adversarial read-only review before finalizing.

Flow:

```text
coder -> reviewer -> coder until approved
```

Agents:

- `swarm-orchestrator`: coordinates implementation, review loops, handoffs, and commits when commits are requested.
- `swarm-coder`: implements the change and fixes review findings.
- `swarm-reviewer`: reviews adversarially without editing files, focusing on bugs, regressions, risks, and missing tests.

Use when:

- Risky fixes.
- Review-heavy implementation.
- Local PR hardening before opening a PR.
- Small or medium changes with important edge cases.

Avoid when:

- The task is trivial and review overhead is not worth it.
- Acceptance criteria must be written before implementation.
- You need final QA execution rather than review findings.

Entrypoint:

```text
/swarm-review <task>
```

Example prompt:

```text
/swarm-review crea un Hello World en Python y revisa la implementación por edge cases, simplicidad y comandos de verificación. No agregues dependencias.
```

Dependencies: installs `delivery-team` base automatically.

## Feature Team

Status: implemented.

Summary: specification-first feature workflow with implementation, refactoring, and structural review.

Flow:

```text
specifier -> coder -> refactorer -> architect -> final
```

Agents:

- `swarm-orchestrator`: coordinates the feature workflow and owns role-based commits when commits are requested.
- `swarm-specifier`: converts user intent into externally visible acceptance criteria and examples before implementation.
- `swarm-coder`: implements the accepted behavior.
- `swarm-refactorer`: refactors without changing behavior, improves coverage, and reduces duplication.
- `swarm-architect`: reviews module boundaries, dependency direction, information hiding, and testability.

Use when:

- Medium features.
- Work needs explicit acceptance criteria.
- Behavior changes have architectural implications.
- The implementation should not start until observable behavior is clarified.

Avoid when:

- The request is already tiny and obvious.
- You need independent QA execution.
- You need mission-level planning or multiple approval gates.

Entrypoint:

```text
/swarm-feature <task>
```

Example prompt:

```text
/swarm-feature crea una CLI mínima en Python para Hello World con criterios de aceptación explícitos antes de implementar. Debe ejecutarse con python hello.py y mostrar exactamente "Hello, World!".
```

Dependencies: installs `delivery-team` base automatically.

## Assurance Team

Status: implemented.

Summary: full quality workflow for larger or critical changes, adding hardening and independent QA.

Flow:

```text
specifier -> coder -> cleaner -> architect -> hardener -> qa -> final
```

Agents:

- `swarm-orchestrator`: coordinates the assurance workflow and owns role-based commits when commits are requested.
- `swarm-specifier`: defines acceptance criteria before implementation.
- `swarm-coder`: implements the accepted behavior.
- `swarm-cleaner`: improves local quality without changing behavior.
- `swarm-architect`: reviews structure, dependencies, information hiding, and testability.
- `swarm-hardener`: covers edge cases, robustness gaps, and additional tests or fixes.
- `swarm-qa`: independently verifies the result through the normal user path or project entrypoint.

Use when:

- Large features.
- Critical changes.
- Work requires independent QA or hardening.
- Regressions would be expensive.

Avoid when:

- The change is too small for the overhead.
- The project cannot run meaningful verification locally.
- You need a multi-story mission with acceptance and QA procedure gates.

Entrypoint:

```text
/swarm-assurance <task>
```

Example prompt:

```text
/swarm-assurance crea un Hello World en Python con verificación independiente y hardening básico. No agregues frameworks nuevos; debe ejecutarse con python hello.py y mostrar exactamente "Hello, World!".
```

Dependencies: installs `feature-team` and `delivery-team` base automatically.

Naming note: SwarmForge uses `hardender` and uppercase `QA` in the source workflow. Swarm Pack normalizes both to `swarm-hardener` and `swarm-qa`. See `docs/role-traceability.md`.

## Mission Team

Status: implemented advanced workflow.

Summary: mission-level workflow for initiatives that need analysis, acceptance scenarios, QA procedures, implementation, review gates, hardening, QA, and merge readiness.

Flow:

```text
mission-leader -> analyst -> gherkin-writer -> gherkin-reviewer -> qa-procedure-writer -> qa-procedure-reviewer -> implementer -> cleaner -> code-reviewer -> architect -> hardener -> qa -> senior-implementor -> merger -> final
```

Agents:

- `swarm-mission-leader`: coordinates the mission workflow and controls mission-level gates.
- `swarm-analyst`: analyzes scope, risks, boundaries, and work breakdown.
- `swarm-gherkin-writer`: writes focused acceptance scenarios for mission behavior.
- `swarm-gherkin-reviewer`: reviews acceptance scenarios for clarity, coverage, and contradictions.
- `swarm-qa-procedure-writer`: writes end-to-end QA procedures.
- `swarm-qa-procedure-reviewer`: reviews QA procedures for coverage, realism, and safety.
- `swarm-mission-implementer`: implements production code, unit tests, and acceptance tests.
- `swarm-mission-cleaner`: performs cleanup and coverage improvements without behavior changes.
- `swarm-mission-code-reviewer`: writes code review reports without editing product files.
- `swarm-mission-architect`: writes architecture critiques without editing product files.
- `swarm-mission-hardener`: hardens implementation with edge-case tests and fixes.
- `swarm-mission-qa`: executes QA scripts, fixes issues where appropriate, and reports final QA results.
- `swarm-mission-senior-implementor`: performs senior implementation improvements and verification updates.
- `swarm-merger`: reviews readiness for merge or release without changing files.

Use when:

- Epics.
- Multi-story themes.
- Approval gates.
- Batched quality gates.
- Work needs traceable acceptance and QA procedure artifacts.

Avoid when:

- The task is a simple fix or small feature.
- You do not need formal acceptance scenarios or QA procedures.
- You need a quick local implementation loop.

Entrypoint:

```text
/swarm-mission <task>
```

Example prompt:

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

Dependencies: installs `delivery-team` base files, then `mission-team` agents and command.

See `docs/role-traceability.md` for the exact mapping between role filenames and SwarmForge source roles.

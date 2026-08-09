# Mission Team

Status: implemented advanced workflow.

Model:

```text
mission-leader -> transient agents -> mission-leader
```

This team coordinates the largest workflow with dedicated mission agents. Agent filenames use `swarm-mission-*` for roles that would otherwise collide with shared team agents in OpenCode's flat namespace.

Mission-specific roles:

- mission-leader
- analyst
- gherkin-writer
- qa-procedure-writer
- gherkin-reviewer
- qa-procedure-reviewer
- implementer
- cleaner
- code-reviewer
- architect
- hardener
- qa
- senior-implementor
- merger

Command:

```text
/swarm-mission <task>
```

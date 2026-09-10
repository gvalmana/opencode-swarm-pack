# Adding A Team

Teams are installed from `teams/<team-name>/` and discovered automatically.

## Steps

1. Create `teams/<team-name>/team.json` with `name`, `summary`, `dependencies`, and `workflow`.
2. Add a command file under `teams/<team-name>/commands/` with frontmatter `agent: swarm-orchestrator` or another coordinator.
3. Add only team-specific agents. Reuse shared agents through `dependencies` when responsibilities already match.
4. Add a README describing flow, roles, command, rules, and dependencies.
5. Update `docs/teams.md`, `README.md`, and `AGENTS.md`.
6. Validate all four targets with local installs into `/tmp`.

Dependencies are transitive, so prefer the narrowest direct dependency.

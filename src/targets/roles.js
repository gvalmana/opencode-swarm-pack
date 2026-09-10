// Single source of truth for role classification across every render target.
// Update these sets when adding a role; all targets pick the change up at once.

const COORDINATOR_ROLES = new Set([
  "swarm-mission-leader",
  "swarm-orchestrator",
]);

const READ_ONLY_ROLES = new Set([
  "swarm-analyst",
  "swarm-architect",
  "swarm-gherkin-reviewer",
  "swarm-merger",
  "swarm-mission-architect",
  "swarm-mission-code-reviewer",
  "swarm-qa-procedure-reviewer",
  "swarm-reviewer",
  "swarm-security-reviewer",
]);

function isCoordinator(agentName) {
  return COORDINATOR_ROLES.has(agentName);
}

function isReadOnly(agentName) {
  return READ_ONLY_ROLES.has(agentName);
}

module.exports = {
  COORDINATOR_ROLES,
  READ_ONLY_ROLES,
  isCoordinator,
  isReadOnly,
};

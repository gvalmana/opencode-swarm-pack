// Shared instruction partials so target instruction files stay consistent.
// `teams` is the resolved list from src/teams.js ({ name, workflow, ... }).

function renderInstalledTeams(teams) {
  return teams.map((team) => `- ${team.name}`).join("\n");
}

function renderWorkflowList(teams) {
  return teams
    .filter((team) => team.workflow)
    .map((team) => `- ${team.name}: ${team.workflow}`)
    .join("\n");
}

function renderDisciplineBullets(skillLine) {
  return [
    "- Keep work in small, reviewable increments.",
    "- Do not broaden scope or modify unrelated files.",
    "- Preserve user changes and never revert unrelated work.",
    `- ${skillLine}`,
    "- Subagents must return concise handoffs using the fixed HANDOFF format.",
    "- Only the main coordinating agent should create commits when the user explicitly asks for commits.",
  ].join("\n");
}

module.exports = {
  renderDisciplineBullets,
  renderInstalledTeams,
  renderWorkflowList,
};

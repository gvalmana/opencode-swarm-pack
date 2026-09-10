const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { planWriteFile } = require("../filesystem");
const { listMarkdownFiles, planSkillTree, resolveLocalProjectPath } = require("./base");
const { parseDescription } = require("./frontmatter");
const { renderDisciplineBullets, renderInstalledTeams, renderWorkflowList } = require("./instructions");
const { isCoordinator, isReadOnly } = require("./roles");
const { adaptSkillReference, neutralizeOpenCodeText, quote } = require("./text");

function resolveTargetDirectory(options) {
  if (options.mode === "global") {
    return path.join(os.homedir(), ".copilot");
  }

  return path.join(resolveLocalProjectPath(options), ".github");
}

function resolveInstructionPath(options) {
  if (options.mode === "global") {
    return path.join(os.homedir(), ".copilot", "copilot-instructions.md");
  }

  return path.join(resolveLocalProjectPath(options), ".github", "copilot-instructions.md");
}

function resolveSkillDirectory(options) {
  if (options.mode === "global") {
    return path.join(os.homedir(), ".agents", "skills");
  }

  return path.join(resolveLocalProjectPath(options), ".agents", "skills");
}

function toolsForAgent(agentName) {
  if (isReadOnly(agentName)) {
    return ["read", "search"];
  }

  if (isCoordinator(agentName)) {
    return ["read", "search", "edit", "execute", "agent"];
  }

  return ["read", "search", "edit", "execute"];
}

function buildAgentInstructions(agentName, body) {
  const adaptedBody = adaptSkillReference(
    body,
    "Use the /swarm-pack skill when available; otherwise follow the embedded swarm discipline and handoff rules directly."
  );

  return [
    "These instructions were adapted from the Swarm Pack role definition for GitHub Copilot custom agents.",
    "Follow Copilot custom instructions and preserve the fixed swarm handoff format.",
    `You are running as ${agentName} when Copilot delegates work to you.`,
    "",
    adaptedBody,
  ].join("\n");
}

function renderAgentMarkdown(agentName, description, body) {
  return `---
name: ${quote(agentName)}
description: ${quote(neutralizeOpenCodeText(description))}
tools: [${toolsForAgent(agentName).map(quote).join(", ")}]
---

${buildAgentInstructions(agentName, body)}
`;
}

function installTeam(packageRoot, targetDirectory, teamName, options, plan) {
  const teamDirectory = path.join(packageRoot, "teams", teamName);

  for (const file of listMarkdownFiles(path.join(teamDirectory, "agents"))) {
    const { description, body } = parseDescription(fs.readFileSync(file.path, "utf8"), file.path);
    planWriteFile(
      plan,
      renderAgentMarkdown(file.stem, description, body),
      path.join(targetDirectory, "agents", `${file.stem}.agent.md`)
    );
  }

  planSkillTree(path.join(teamDirectory, "skills"), resolveSkillDirectory(options), plan, neutralizeOpenCodeText);
}

function renderInstructions(teams) {
  return `# Copilot Swarm Pack

This repository has Swarm Pack role agents installed for GitHub Copilot.

## How To Use

Ask Copilot to run a swarm workflow by name and delegate to the installed custom agents. Copilot does not use the OpenCode /swarm-* slash command files.

Example:

\`\`\`text
Use the swarm-coder agent, then the swarm-cleaner agent, to run the delivery-team workflow for this request. Wait for each HANDOFF before continuing.
\`\`\`

For parallelizable work, use /fleet only when role tasks can run safely without edit conflicts.

## Installed Teams

${renderInstalledTeams(teams)}

## Workflows

${renderWorkflowList(teams)}

## Swarm Discipline

${renderDisciplineBullets("Use the /swarm-pack skill when available.")}
`;
}

function installInstructions(teams, options, plan) {
  planWriteFile(plan, renderInstructions(teams), resolveInstructionPath(options));
}

function describeDestinations(options, targetDirectory) {
  return [targetDirectory, resolveInstructionPath(options), resolveSkillDirectory(options)];
}

module.exports = {
  id: "copilot",
  displayName: "GitHub Copilot",
  capabilities: {
    agents: true,
    commands: false,
    skills: true,
    permissions: true,
    subagents: true,
    instructions: true,
    rules: false,
    hooks: false,
  },
  restartMessage: "Restart Copilot CLI or reload Copilot customizations for the new agents, instructions, and skills to load.",
  describeDestinations,
  installInstructions,
  installTeam,
  resolveTargetDirectory,
};

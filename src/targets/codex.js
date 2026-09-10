const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { planWriteFile } = require("../filesystem");
const { listMarkdownFiles, planSkillTree, resolveLocalProjectPath } = require("./base");
const { parseDescription } = require("./frontmatter");
const { renderDisciplineBullets, renderInstalledTeams, renderWorkflowList } = require("./instructions");
const { isReadOnly } = require("./roles");
const { adaptSkillReference, neutralizeOpenCodeText, quote } = require("./text");

function resolveTargetDirectory(options) {
  if (options.mode === "global") {
    return path.join(os.homedir(), ".codex");
  }

  return path.join(resolveLocalProjectPath(options), ".codex");
}

function resolveInstructionPath(options) {
  if (options.mode === "global") {
    return path.join(os.homedir(), ".codex", "AGENTS.md");
  }

  return path.join(resolveLocalProjectPath(options), "AGENTS.md");
}

function resolveSkillDirectory(options) {
  if (options.mode === "global") {
    return path.join(os.homedir(), ".agents", "skills");
  }

  return path.join(resolveLocalProjectPath(options), ".agents", "skills");
}

function buildDeveloperInstructions(agentName, body) {
  const adaptedBody = adaptSkillReference(
    body,
    "Use the swarm-pack skill when available; otherwise follow the embedded swarm discipline and handoff rules directly."
  );

  return [
    "These instructions were adapted from the Swarm Pack role definition for Codex custom agents.",
    "Follow Codex project guidance from AGENTS.md and preserve the fixed swarm handoff format.",
    `You are running as ${agentName} when the parent agent delegates work to you.`,
    "",
    adaptedBody,
  ].join("\n");
}

function renderAgentToml(agentName, description, body) {
  const lines = [
    `name = ${quote(agentName)}`,
    `description = ${quote(neutralizeOpenCodeText(description))}`,
  ];

  if (isReadOnly(agentName)) {
    lines.push('sandbox_mode = "read-only"');
  }

  lines.push(`developer_instructions = ${quote(buildDeveloperInstructions(agentName, body))}`, "");

  return lines.join("\n");
}

function installTeam(packageRoot, targetDirectory, teamName, options, plan) {
  const teamDirectory = path.join(packageRoot, "teams", teamName);

  for (const file of listMarkdownFiles(path.join(teamDirectory, "agents"))) {
    const { description, body } = parseDescription(fs.readFileSync(file.path, "utf8"), file.path);
    planWriteFile(
      plan,
      renderAgentToml(file.stem, description, body),
      path.join(targetDirectory, "agents", `${file.stem}.toml`)
    );
  }

  planSkillTree(path.join(teamDirectory, "skills"), resolveSkillDirectory(options), plan, neutralizeOpenCodeText);
}

function renderInstructions(teams) {
  return `# Codex Swarm Pack

This repository has Swarm Pack role agents installed for Codex.

## How To Use

Ask Codex to run a swarm workflow by name and delegate to the installed custom agents. Codex does not use the OpenCode /swarm-* slash commands.

Example:

\`\`\`text
Run the swarm delivery workflow for this request. Use swarm-coder, then swarm-cleaner, and wait for each handoff before continuing.
\`\`\`

## Installed Teams

${renderInstalledTeams(teams)}

## Workflows

${renderWorkflowList(teams)}

## Swarm Discipline

${renderDisciplineBullets("Use the swarm-pack skill when available with `$swarm-pack`.")}
`;
}

function installInstructions(teams, options, plan) {
  planWriteFile(plan, renderInstructions(teams), resolveInstructionPath(options));
}

function describeDestinations(options, targetDirectory) {
  return [targetDirectory, resolveInstructionPath(options), resolveSkillDirectory(options)];
}

module.exports = {
  id: "codex",
  displayName: "Codex",
  capabilities: {
    agents: true,
    commands: false,
    skills: true,
    permissions: true,
    subagents: true,
    instructions: true,
    rules: false,
  },
  restartMessage: "Restart Codex for the new agents, instructions, and skills to load.",
  describeDestinations,
  installInstructions,
  installTeam,
  resolveTargetDirectory,
};

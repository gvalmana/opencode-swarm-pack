const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { installFile, installGeneratedFile } = require("../filesystem");

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
]);

function resolveProjectPath(options) {
  if (!options.localPath) {
    throw new Error("--local requires a project path");
  }

  if (!fs.existsSync(options.localPath) || !fs.statSync(options.localPath).isDirectory()) {
    throw new Error(`local project path does not exist: ${options.localPath}`);
  }

  return fs.realpathSync(options.localPath);
}

function resolveTargetDirectory(options) {
  if (options.mode === "global") {
    return path.join(os.homedir(), ".copilot");
  }

  return path.join(resolveProjectPath(options), ".github");
}

function resolveInstructionPath(options) {
  if (options.mode === "global") {
    return path.join(os.homedir(), ".copilot", "copilot-instructions.md");
  }

  return path.join(resolveProjectPath(options), ".github", "copilot-instructions.md");
}

function resolveSkillDirectory(options) {
  if (options.mode === "global") {
    return path.join(os.homedir(), ".agents", "skills");
  }

  return path.join(resolveProjectPath(options), ".agents", "skills");
}

function parseAgentMarkdown(content, filePath) {
  if (!content.startsWith("---\n")) {
    return { description: "Swarm role agent.", body: content.trim() };
  }

  const end = content.indexOf("\n---\n", 4);
  if (end === -1) {
    throw new Error(`invalid frontmatter in ${filePath}`);
  }

  const frontmatter = content.slice(4, end);
  const body = content.slice(end + 5).trim();
  const descriptionLine = frontmatter
    .split("\n")
    .find((line) => line.startsWith("description:"));
  const description = descriptionLine
    ? descriptionLine.slice("description:".length).trim()
    : "Swarm role agent.";

  return { description, body };
}

function yamlString(value) {
  return JSON.stringify(value);
}

function neutralizeOpenCodeText(value) {
  return value
    .replace(/OpenCode swarm/g, "Swarm Pack")
    .replace(/OpenCode Swarm/g, "Swarm Pack")
    .replace(/OpenCode/g, "Swarm Pack");
}

function toolsForAgent(agentName) {
  if (READ_ONLY_ROLES.has(agentName)) {
    return ["read", "search"];
  }

  if (COORDINATOR_ROLES.has(agentName)) {
    return ["read", "search", "edit", "execute", "agent"];
  }

  return ["read", "search", "edit", "execute"];
}

function buildAgentInstructions(agentName, body) {
  const adaptedBody = neutralizeOpenCodeText(body).replace(
    /Use the `swarm-pack` skill\./g,
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
name: ${yamlString(agentName)}
description: ${yamlString(neutralizeOpenCodeText(description))}
tools: [${toolsForAgent(agentName).map(yamlString).join(", ")}]
---

${buildAgentInstructions(agentName, body)}
`;
}

function installAgents(teamDirectory, targetDirectory, options) {
  const sourceDirectory = path.join(teamDirectory, "agents");
  if (!fs.existsSync(sourceDirectory) || !fs.statSync(sourceDirectory).isDirectory()) {
    return;
  }

  for (const entry of fs.readdirSync(sourceDirectory, { withFileTypes: true })) {
    if (!entry.isFile() || path.extname(entry.name) !== ".md") {
      continue;
    }

    const source = path.join(sourceDirectory, entry.name);
    const agentName = path.basename(entry.name, ".md");
    const { description, body } = parseAgentMarkdown(fs.readFileSync(source, "utf8"), source);
    installGeneratedFile(
      renderAgentMarkdown(agentName, description, body),
      path.join(targetDirectory, "agents", `${agentName}.agent.md`),
      options
    );
  }
}

function installSkillDirectory(sourceDirectory, destinationDirectory, options) {
  if (!fs.existsSync(sourceDirectory) || !fs.statSync(sourceDirectory).isDirectory()) {
    return;
  }

  for (const entry of fs.readdirSync(sourceDirectory, { withFileTypes: true })) {
    const source = path.join(sourceDirectory, entry.name);
    const destination = path.join(destinationDirectory, entry.name);

    if (entry.isDirectory()) {
      installSkillDirectory(source, destination, options);
    } else if (entry.isFile() && path.extname(entry.name) === ".md") {
      installGeneratedFile(neutralizeOpenCodeText(fs.readFileSync(source, "utf8")), destination, options);
    } else if (entry.isFile()) {
      installFile(source, destination, options);
    }
  }
}

function installSkills(teamDirectory, options) {
  installSkillDirectory(path.join(teamDirectory, "skills"), resolveSkillDirectory(options), options);
}

function installTeam(packageRoot, targetDirectory, team, options) {
  const teamDirectory = path.join(packageRoot, "teams", team);
  installAgents(teamDirectory, targetDirectory, options);
  installSkills(teamDirectory, options);
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

${teams.map((team) => `- ${team}`).join("\n")}

## Workflows

- delivery-team: swarm-coder -> swarm-cleaner -> final
- review-team: swarm-coder -> swarm-reviewer -> swarm-coder until approved
- feature-team: swarm-specifier -> swarm-coder -> swarm-refactorer -> swarm-architect -> final
- assurance-team: swarm-specifier -> swarm-coder -> swarm-cleaner -> swarm-architect -> swarm-hardener -> swarm-qa -> final
- mission-team: use swarm-mission-leader to coordinate the mission workflow

## Swarm Discipline

- Keep work in small, reviewable increments.
- Do not broaden scope or modify unrelated files.
- Preserve user changes and never revert unrelated work.
- Use the /swarm-pack skill when available.
- Subagents must return concise handoffs using the fixed HANDOFF format.
- Only the main coordinating agent should create commits when the user explicitly asks for commits.
`;
}

function installInstructions(teams, options) {
  installGeneratedFile(renderInstructions(teams), resolveInstructionPath(options), options);
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
  installInstructions,
  installTeam,
  resolveTargetDirectory,
};

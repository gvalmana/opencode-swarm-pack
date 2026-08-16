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
    return path.join(os.homedir(), ".claude");
  }

  return path.join(resolveProjectPath(options), ".claude");
}

function resolveInstructionPath(options) {
  if (options.mode === "global") {
    return path.join(os.homedir(), ".claude", "CLAUDE.md");
  }

  return path.join(resolveProjectPath(options), "CLAUDE.md");
}

function parseMarkdownWithFrontmatter(content, filePath) {
  if (!content.startsWith("---\n")) {
    return { frontmatter: {}, body: content.trim() };
  }

  const end = content.indexOf("\n---\n", 4);
  if (end === -1) {
    throw new Error(`invalid frontmatter in ${filePath}`);
  }

  const frontmatterText = content.slice(4, end);
  const body = content.slice(end + 5).trim();
  const frontmatter = {};

  for (const line of frontmatterText.split("\n")) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) {
      frontmatter[match[1]] = match[2].trim();
    }
  }

  return { frontmatter, body };
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
    return ["Read", "Glob", "Grep", "Bash", "WebFetch", "Skill"];
  }

  if (COORDINATOR_ROLES.has(agentName)) {
    return ["Agent", "Read", "Glob", "Grep", "Bash", "Edit", "Write", "TodoWrite", "Skill"];
  }

  return ["Read", "Glob", "Grep", "Bash", "Edit", "Write", "TodoWrite", "Skill"];
}

function buildAgentInstructions(agentName, body) {
  const adaptedBody = neutralizeOpenCodeText(body).replace(
    /Use the `swarm-pack` skill\./g,
    "Use the /swarm-pack skill when available; otherwise follow the embedded swarm discipline and handoff rules directly."
  );

  return [
    "These instructions were adapted from the Swarm Pack role definition for Claude Code subagents.",
    "Follow CLAUDE.md project guidance and preserve the fixed swarm HANDOFF format.",
    `You are running as ${agentName} when Claude Code delegates work to you.`,
    "",
    adaptedBody,
  ].join("\n");
}

function renderAgentMarkdown(agentName, description, body) {
  const frontmatter = [
    "---",
    `name: ${yamlString(agentName)}`,
    `description: ${yamlString(neutralizeOpenCodeText(description || "Swarm role agent."))}`,
    `tools: [${toolsForAgent(agentName).map(yamlString).join(", ")}]`,
    "model: inherit",
  ];

  if (READ_ONLY_ROLES.has(agentName)) {
    frontmatter.push("permissionMode: plan");
  }

  frontmatter.push("---", "");

  return `${frontmatter.join("\n")}${buildAgentInstructions(agentName, body)}\n`;
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
    const { frontmatter, body } = parseMarkdownWithFrontmatter(fs.readFileSync(source, "utf8"), source);
    installGeneratedFile(
      renderAgentMarkdown(agentName, frontmatter.description, body),
      path.join(targetDirectory, "agents", `${agentName}.md`),
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

function installSkills(teamDirectory, targetDirectory, options) {
  installSkillDirectory(path.join(teamDirectory, "skills"), path.join(targetDirectory, "skills"), options);
}

function buildWorkflowSkillInstructions(commandName, coordinator, body) {
  const adaptedBody = neutralizeOpenCodeText(body).replace(
    /Use the `swarm-pack` skill\./g,
    "Use the /swarm-pack skill when available; otherwise follow the embedded swarm discipline and handoff rules directly."
  );

  return [
    `Run the ${commandName} workflow in Claude Code.`,
    "",
    coordinator
      ? `Use the ${coordinator} subagent as the coordinating role when delegation is available.`
      : "Use the installed Swarm Pack subagents when delegation is available.",
    "Wait for each HANDOFF before continuing to the next role.",
    "",
    adaptedBody,
  ].join("\n");
}

function renderWorkflowSkill(commandName, description, coordinator, body) {
  return `---
name: ${yamlString(commandName)}
description: ${yamlString(neutralizeOpenCodeText(description || `Run the ${commandName} workflow.`))}
---

${buildWorkflowSkillInstructions(commandName, coordinator, body)}
`;
}

function installWorkflowSkills(teamDirectory, targetDirectory, options) {
  const sourceDirectory = path.join(teamDirectory, "commands");
  if (!fs.existsSync(sourceDirectory) || !fs.statSync(sourceDirectory).isDirectory()) {
    return;
  }

  for (const entry of fs.readdirSync(sourceDirectory, { withFileTypes: true })) {
    if (!entry.isFile() || path.extname(entry.name) !== ".md") {
      continue;
    }

    const source = path.join(sourceDirectory, entry.name);
    const commandName = path.basename(entry.name, ".md");
    const { frontmatter, body } = parseMarkdownWithFrontmatter(fs.readFileSync(source, "utf8"), source);
    installGeneratedFile(
      renderWorkflowSkill(commandName, frontmatter.description, frontmatter.agent, body),
      path.join(targetDirectory, "skills", commandName, "SKILL.md"),
      options
    );
  }
}

function installTeam(packageRoot, targetDirectory, team, options) {
  const teamDirectory = path.join(packageRoot, "teams", team);
  installAgents(teamDirectory, targetDirectory, options);
  installSkills(teamDirectory, targetDirectory, options);
  installWorkflowSkills(teamDirectory, targetDirectory, options);
}

function renderInstructions(teams) {
  return `# Claude Code Swarm Pack

This repository has Swarm Pack role agents and workflow skills installed for Claude Code.

## How To Use

Invoke a workflow skill by slash command, or ask Claude to use the installed subagents directly.

Example:

\`\`\`text
/swarm-delivery implement a small validation for checkout totals
\`\`\`

Alternative prompt:

\`\`\`text
Use the swarm-coder agent, then the swarm-cleaner agent, to run the delivery-team workflow for this request. Wait for each HANDOFF before continuing.
\`\`\`

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

## Claude Code Notes

- Claude Code workflow entrypoints are installed as skills under .claude/skills/.
- Claude Code subagents are installed under .claude/agents/.
- Claude Code agent teams are experimental. If enabled with CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1, teammates can reuse these subagent definitions by name.
`;
}

function installInstructions(teams, options) {
  installGeneratedFile(renderInstructions(teams), resolveInstructionPath(options), options);
}

module.exports = {
  id: "claude",
  displayName: "Claude Code",
  capabilities: {
    agents: true,
    commands: true,
    skills: true,
    permissions: true,
    subagents: true,
    instructions: true,
    agentTeams: "experimental",
  },
  restartMessage: "Restart Claude Code if this created the first .claude/agents or .claude/skills directory; otherwise Claude Code should detect updated agents and skills automatically.",
  installInstructions,
  installTeam,
  resolveTargetDirectory,
};

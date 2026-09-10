const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { planWriteFile } = require("../filesystem");
const { listMarkdownFiles, planSkillTree, resolveLocalProjectPath } = require("./base");
const { parseFrontmatter } = require("./frontmatter");
const { renderDisciplineBullets, renderInstalledTeams, renderWorkflowList } = require("./instructions");
const { isCoordinator, isReadOnly } = require("./roles");
const { adaptSkillReference, neutralizeOpenCodeText, quote } = require("./text");

function resolveTargetDirectory(options) {
  if (options.mode === "global") {
    return path.join(os.homedir(), ".claude");
  }

  return path.join(resolveLocalProjectPath(options), ".claude");
}

function resolveInstructionPath(options) {
  if (options.mode === "global") {
    return path.join(os.homedir(), ".claude", "CLAUDE.md");
  }

  return path.join(resolveLocalProjectPath(options), "CLAUDE.md");
}

// Claude Code has no granular Bash allow-list, so read-only roles do not get
// Bash at all: anything else would let a read-only role run mutating commands.
function toolsForAgent(agentName) {
  if (isReadOnly(agentName)) {
    return ["Read", "Glob", "Grep", "WebFetch", "Skill"];
  }

  if (isCoordinator(agentName)) {
    return ["Agent", "Read", "Glob", "Grep", "Bash", "Edit", "Write", "TodoWrite", "Skill"];
  }

  return ["Read", "Glob", "Grep", "Bash", "Edit", "Write", "TodoWrite", "Skill"];
}

function buildAgentInstructions(agentName, body) {
  const adaptedBody = adaptSkillReference(
    body,
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
    `name: ${quote(agentName)}`,
    `description: ${quote(neutralizeOpenCodeText(description || "Swarm role agent."))}`,
    `tools: [${toolsForAgent(agentName).map(quote).join(", ")}]`,
    "model: inherit",
  ];

  if (isReadOnly(agentName)) {
    frontmatter.push("permissionMode: plan");
  }

  frontmatter.push("---", "");

  return `${frontmatter.join("\n")}${buildAgentInstructions(agentName, body)}\n`;
}

function buildWorkflowSkillInstructions(commandName, coordinator, body) {
  const adaptedBody = adaptSkillReference(
    body,
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
name: ${quote(commandName)}
description: ${quote(neutralizeOpenCodeText(description || `Run the ${commandName} workflow.`))}
---

${buildWorkflowSkillInstructions(commandName, coordinator, body)}
`;
}

function installTeam(packageRoot, targetDirectory, teamName, options, plan) {
  const teamDirectory = path.join(packageRoot, "teams", teamName);

  for (const file of listMarkdownFiles(path.join(teamDirectory, "agents"))) {
    const { frontmatter, body } = parseFrontmatter(fs.readFileSync(file.path, "utf8"), file.path);
    planWriteFile(
      plan,
      renderAgentMarkdown(file.stem, frontmatter.description, body),
      path.join(targetDirectory, "agents", `${file.stem}.md`)
    );
  }

  planSkillTree(
    path.join(teamDirectory, "skills"),
    path.join(targetDirectory, "skills"),
    plan,
    neutralizeOpenCodeText
  );

  for (const file of listMarkdownFiles(path.join(teamDirectory, "commands"))) {
    const { frontmatter, body } = parseFrontmatter(fs.readFileSync(file.path, "utf8"), file.path);
    planWriteFile(
      plan,
      renderWorkflowSkill(file.stem, frontmatter.description, frontmatter.agent, body),
      path.join(targetDirectory, "skills", file.stem, "SKILL.md")
    );
  }
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

${renderInstalledTeams(teams)}

## Workflows

${renderWorkflowList(teams)}

## Swarm Discipline

${renderDisciplineBullets("Use the /swarm-pack skill when available.")}

## Claude Code Notes

- Claude Code workflow entrypoints are installed as skills under .claude/skills/.
- Claude Code subagents are installed under .claude/agents/.
- Claude Code agent teams are experimental. If enabled with CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1, teammates can reuse these subagent definitions by name.
`;
}

function installInstructions(teams, options, plan) {
  planWriteFile(plan, renderInstructions(teams), resolveInstructionPath(options));
}

function describeDestinations(options, targetDirectory) {
  return [targetDirectory, resolveInstructionPath(options)];
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
  describeDestinations,
  installInstructions,
  installTeam,
  resolveTargetDirectory,
};

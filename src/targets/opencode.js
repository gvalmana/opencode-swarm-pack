const os = require("node:os");
const path = require("node:path");
const { planDirectoryCopy } = require("../filesystem");
const { resolveLocalProjectPath } = require("./base");

const ASSET_DIRECTORIES = ["agents", "commands", "skills"];

function resolveTargetDirectory(options) {
  if (options.mode === "global") {
    return path.join(os.homedir(), ".config", "opencode");
  }

  return path.join(resolveLocalProjectPath(options), ".opencode");
}

function installTeam(packageRoot, targetDirectory, teamName, options, plan) {
  const teamDirectory = path.join(packageRoot, "teams", teamName);

  for (const assetDirectory of ASSET_DIRECTORIES) {
    planDirectoryCopy(
      path.join(teamDirectory, assetDirectory),
      path.join(targetDirectory, assetDirectory),
      plan
    );
  }
}

function describeDestinations(options, targetDirectory) {
  return [targetDirectory];
}

module.exports = {
  id: "opencode",
  displayName: "OpenCode",
  capabilities: {
    agents: true,
    commands: true,
    skills: true,
    permissions: true,
    subagents: true,
  },
  restartMessage: "Restart OpenCode for the new agents, commands, and skills to load.",
  describeDestinations,
  installTeam,
  resolveTargetDirectory,
};

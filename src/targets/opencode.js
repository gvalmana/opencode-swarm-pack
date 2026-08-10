const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

function resolveTargetDirectory(options) {
  if (options.mode === "global") {
    return path.join(os.homedir(), ".config", "opencode");
  }

  if (!options.localPath) {
    throw new Error("--local requires a project path");
  }

  if (!fs.existsSync(options.localPath) || !fs.statSync(options.localPath).isDirectory()) {
    throw new Error(`local project path does not exist: ${options.localPath}`);
  }

  return path.join(fs.realpathSync(options.localPath), ".opencode");
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
  assetDirectories: ["agents", "commands", "skills"],
  restartMessage: "Restart OpenCode for the new agents, commands, and skills to load.",
  resolveTargetDirectory,
};

const path = require("node:path");
const { installDirectory, isDirectory } = require("./filesystem");
const { getTarget, listTargetIds } = require("./targets/registry");

const AVAILABLE_TEAMS = [
  "delivery-team",
  "review-team",
  "feature-team",
  "assurance-team",
  "mission-team",
];

const TEAM_DEPENDENCIES = {
  "delivery-team": [],
  "review-team": ["delivery-team"],
  "feature-team": ["delivery-team"],
  "assurance-team": ["delivery-team", "feature-team"],
  "mission-team": ["delivery-team"],
};

function resolveTeams(team) {
  if (!AVAILABLE_TEAMS.includes(team)) {
    throw new Error(
      `team '${team}' is not implemented yet. Available: ${AVAILABLE_TEAMS.join(", ")}`
    );
  }

  return [...TEAM_DEPENDENCIES[team], team];
}

function installTeam(packageRoot, target, targetDirectory, team, options) {
  const teamDirectory = path.join(packageRoot, "teams", team);

  if (!isDirectory(teamDirectory)) {
    throw new Error(`team directory not found: ${teamDirectory}`);
  }

  for (const assetDirectory of target.assetDirectories) {
    installDirectory(
      path.join(teamDirectory, assetDirectory),
      path.join(targetDirectory, assetDirectory),
      options
    );
  }
}

function install(options) {
  if (!options.target) {
    throw new Error(`--target is required. Available: ${listTargetIds().join(", ")}`);
  }

  if (!options.mode) {
    throw new Error("choose --global or --local <project-path>");
  }

  const target = getTarget(options.target);
  if (!target) {
    throw new Error(`target '${options.target}' is not supported yet. Available: ${listTargetIds().join(", ")}`);
  }

  const targetDirectory = target.resolveTargetDirectory(options);

  for (const team of resolveTeams(options.team)) {
    installTeam(options.packageRoot, target, targetDirectory, team, options);
  }

  console.log(`Installed ${options.team} into ${targetDirectory}`);
  console.log(target.restartMessage);
}

module.exports = {
  install,
};

const path = require("node:path");
const { installDirectory, isDirectory } = require("./filesystem");
const opencode = require("./targets/opencode");

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

const TARGETS = {
  opencode,
};

function resolveTeams(team) {
  if (!AVAILABLE_TEAMS.includes(team)) {
    throw new Error(
      `team '${team}' is not implemented yet. Available: ${AVAILABLE_TEAMS.join(", ")}`
    );
  }

  return [...TEAM_DEPENDENCIES[team], team];
}

function getTarget(name) {
  const target = TARGETS[name];

  if (!target) {
    throw new Error(`target '${name}' is not supported yet. Available: ${Object.keys(TARGETS).join(", ")}`);
  }

  return target;
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
  if (!options.mode) {
    throw new Error("choose --global or --local <project-path>");
  }

  const target = getTarget(options.target);
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

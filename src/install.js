const { checkPlanConflicts, executePlan } = require("./filesystem");
const { resolveTeams } = require("./teams");
const { getTarget, listTargetIds } = require("./targets/registry");

function install(options) {
  if (!options.target) {
    throw new Error(`--target is required. Available: ${listTargetIds().join(", ")}`);
  }

  if (!options.mode) {
    throw new Error("choose --global or --local <project-path>");
  }

  const target = getTarget(options.target);
  const targetDirectory = target.resolveTargetDirectory(options);
  const teams = resolveTeams(options.packageRoot, options.team);

  const plan = [];

  for (const team of teams) {
    target.installTeam(options.packageRoot, targetDirectory, team.name, options, plan);
  }

  if (target.installInstructions) {
    target.installInstructions(teams, options, plan);
  }

  const uniquePlan = checkPlanConflicts(plan, options);
  const { written, skipped } = executePlan(uniquePlan);

  console.log(`Installed teams: ${teams.map((team) => team.name).join(", ")}`);
  console.log(`Files written: ${written.length} (${skipped} already up to date)`);
  console.log("Destinations:");

  for (const destination of target.describeDestinations(options, targetDirectory)) {
    console.log(`  - ${destination}`);
  }

  console.log(target.restartMessage);
}

module.exports = {
  install,
};

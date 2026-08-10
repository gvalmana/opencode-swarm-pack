const codex = require("./codex");
const copilot = require("./copilot");
const opencode = require("./opencode");

const targets = [opencode, codex, copilot];

function listTargets() {
  return targets.slice();
}

function listTargetIds() {
  return targets.map((target) => target.id);
}

function getTarget(id) {
  return targets.find((target) => target.id === id);
}

module.exports = {
  getTarget,
  listTargetIds,
  listTargets,
};

const codex = require("./codex");
const opencode = require("./opencode");

const targets = [opencode, codex];

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

const codex = require("./codex");
const claude = require("./claude");
const copilot = require("./copilot");
const opencode = require("./opencode");

const targets = [opencode, codex, copilot, claude];

// Target contract: every target must expose installTeam so the installer can
// keep a single uniform pipeline. installInstructions is optional.
function validateTarget(target) {
  const problems = [];

  if (!target || typeof target !== "object") {
    throw new Error("invalid target: module must export an object");
  }

  if (!target.id || typeof target.id !== "string") {
    problems.push("missing id");
  }

  if (typeof target.resolveTargetDirectory !== "function") {
    problems.push("missing resolveTargetDirectory()");
  }

  if (typeof target.installTeam !== "function") {
    problems.push("missing installTeam()");
  }

  if (typeof target.describeDestinations !== "function") {
    problems.push("missing describeDestinations()");
  }

  if (problems.length > 0) {
    throw new Error(`invalid target '${target.id || "unknown"}': ${problems.join(", ")}`);
  }
}

targets.forEach(validateTarget);

function listTargets() {
  return targets.slice();
}

function listTargetIds() {
  return targets.map((target) => target.id);
}

function getTarget(id) {
  const target = targets.find((candidate) => candidate.id === id);

  if (!target) {
    throw new Error(
      `target '${id}' is not supported yet. Available: ${listTargetIds().join(", ")}`
    );
  }

  return target;
}

module.exports = {
  getTarget,
  listTargetIds,
  listTargets,
};

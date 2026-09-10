// Shared text helpers for render targets.

function neutralizeOpenCodeText(value) {
  return value
    .replace(/OpenCode swarm/g, "Swarm Pack")
    .replace(/OpenCode Swarm/g, "Swarm Pack")
    .replace(/OpenCode/g, "Swarm Pack");
}

function quote(value) {
  return JSON.stringify(value);
}

function adaptSkillReference(body, replacement) {
  return neutralizeOpenCodeText(body).replace(/Use the `swarm-pack` skill\./g, replacement);
}

module.exports = {
  adaptSkillReference,
  neutralizeOpenCodeText,
  quote,
};

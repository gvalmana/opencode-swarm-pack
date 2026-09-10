const fs = require("node:fs");
const path = require("node:path");
const { isDirectory } = require("./filesystem");

const DEFAULT_WORKFLOW_SUMMARY = "";

function loadTeamManifest(packageRoot, teamName) {
  const teamDirectory = path.join(packageRoot, "teams", teamName);

  if (!isDirectory(teamDirectory)) {
    return null;
  }

  const manifestPath = path.join(teamDirectory, "team.json");
  let manifest = {};

  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    } catch (error) {
      throw new Error(`invalid team manifest ${manifestPath}: ${error.message}`);
    }
  }

  return {
    name: teamName,
    dependencies: Array.isArray(manifest.dependencies) ? manifest.dependencies : [],
    summary: manifest.summary || "",
    workflow: manifest.workflow || DEFAULT_WORKFLOW_SUMMARY,
  };
}

function listTeamNames(packageRoot) {
  const teamsDirectory = path.join(packageRoot, "teams");

  return fs
    .readdirSync(teamsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function resolveTeams(packageRoot, requested) {
  const available = listTeamNames(packageRoot);

  if (requested !== "all" && !available.includes(requested)) {
    throw new Error(
      `team '${requested}' is not implemented yet. Available: all, ${available.join(", ")}`
    );
  }

  const seeds = requested === "all" ? available : [requested];
  const ordered = [];
  const visited = new Set();
  const visiting = new Set();

  function visit(teamName, chain) {
    if (visited.has(teamName)) {
      return;
    }

    if (visiting.has(teamName)) {
      throw new Error(`circular team dependency: ${[...chain, teamName].join(" -> ")}`);
    }

    const manifest = loadTeamManifest(packageRoot, teamName);

    if (!manifest) {
      throw new Error(
        `team '${teamName}' (dependency of ${chain[chain.length - 1]}) is not implemented. ` +
          `Available: ${available.join(", ")}`
      );
    }

    visiting.add(teamName);

    for (const dependency of manifest.dependencies) {
      visit(dependency, [...chain, teamName]);
    }

    visiting.delete(teamName);
    visited.add(teamName);
    ordered.push(manifest);
  }

  for (const seed of seeds) {
    visit(seed, []);
  }

  return ordered;
}

module.exports = {
  listTeamNames,
  loadTeamManifest,
  resolveTeams,
};

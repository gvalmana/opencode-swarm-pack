const fs = require("node:fs");
const path = require("node:path");

function ensureDirectory(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function isDirectory(dir) {
  try {
    return fs.statSync(dir).isDirectory();
  } catch (_error) {
    return false;
  }
}

function planCopyFile(plan, source, destination) {
  plan.push({ kind: "copy", source, destination });
}

function planWriteFile(plan, content, destination) {
  plan.push({ kind: "write", content, destination });
}

function planDirectoryCopy(sourceDir, destinationDir, plan) {
  if (!isDirectory(sourceDir)) {
    return;
  }

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const source = path.join(sourceDir, entry.name);
    const destination = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      planDirectoryCopy(source, destination, plan);
    } else if (entry.isFile()) {
      planCopyFile(plan, source, destination);
    }
  }
}

function entryBytes(entry) {
  if (entry.kind === "copy") {
    return fs.readFileSync(entry.source);
  }

  return Buffer.from(entry.content, "utf8");
}

function entryMatchesExisting(entry) {
  if (!fs.existsSync(entry.destination) || isDirectory(entry.destination)) {
    return false;
  }

  return entryBytes(entry).equals(fs.readFileSync(entry.destination));
}

function dedupePlan(plan) {
  const byDestination = new Map();

  for (const entry of plan) {
    const existing = byDestination.get(entry.destination);

    if (!existing) {
      byDestination.set(entry.destination, entry);
      continue;
    }

    if (!entryBytes(existing).equals(entryBytes(entry))) {
      throw new Error(
        `namespace collision: two planned files produce different content for ${entry.destination}\n` +
          "Rename one of the source files or install only one of the colliding teams."
      );
    }
  }

  return [...byDestination.values()];
}

function checkPlanConflicts(plan, options) {
  const unique = dedupePlan(plan);
  const problems = [];

  for (const entry of unique) {
    if (!fs.existsSync(entry.destination)) {
      continue;
    }

    if (isDirectory(entry.destination)) {
      problems.push(`${entry.destination} (a directory exists at this path)`);
      continue;
    }

    if (!options.force && !entryMatchesExisting(entry)) {
      problems.push(entry.destination);
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `targets exist with different content:\n${problems.map((p) => `  - ${p}`).join("\n")}\n` +
        "Use --force to overwrite."
    );
  }

  return unique;
}

function executePlan(uniquePlan) {
  const written = [];
  let skipped = 0;

  for (const entry of uniquePlan) {
    if (entryMatchesExisting(entry)) {
      skipped += 1;
      continue;
    }

    ensureDirectory(path.dirname(entry.destination));

    if (entry.kind === "copy") {
      fs.copyFileSync(entry.source, entry.destination);
    } else {
      fs.writeFileSync(entry.destination, entry.content);
    }

    written.push(entry.destination);
  }

  return { written, skipped };
}

module.exports = {
  checkPlanConflicts,
  ensureDirectory,
  executePlan,
  isDirectory,
  planCopyFile,
  planDirectoryCopy,
  planWriteFile,
};

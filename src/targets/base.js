const fs = require("node:fs");
const path = require("node:path");
const { isDirectory, planCopyFile, planWriteFile } = require("../filesystem");

// Validates --local once and resolves it with realpath semantics. Every target
// path helper builds on this so resolution order never leaks raw ENOENT errors.
function resolveLocalProjectPath(options) {
  if (!options.localPath) {
    throw new Error("--local requires a project path");
  }

  if (!fs.existsSync(options.localPath) || !fs.statSync(options.localPath).isDirectory()) {
    throw new Error(`local project path does not exist: ${options.localPath}`);
  }

  return fs.realpathSync(options.localPath);
}

function listMarkdownFiles(directory) {
  if (!isDirectory(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && path.extname(entry.name) === ".md")
    .map((entry) => ({
      name: entry.name,
      path: path.join(directory, entry.name),
      stem: path.basename(entry.name, ".md"),
    }));
}

// Recursive skill copy: .md files are transformed (neutralized) and planned as
// generated writes; every other file is planned as a raw copy.
function planSkillTree(sourceDirectory, destinationDirectory, plan, transform) {
  if (!isDirectory(sourceDirectory)) {
    return;
  }

  for (const entry of fs.readdirSync(sourceDirectory, { withFileTypes: true })) {
    const source = path.join(sourceDirectory, entry.name);
    const destination = path.join(destinationDirectory, entry.name);

    if (entry.isDirectory()) {
      planSkillTree(source, destination, plan, transform);
    } else if (entry.isFile() && path.extname(entry.name) === ".md") {
      planWriteFile(plan, transform(fs.readFileSync(source, "utf8")), destination);
    } else if (entry.isFile()) {
      planCopyFile(plan, source, destination);
    }
  }
}

module.exports = {
  listMarkdownFiles,
  planSkillTree,
  resolveLocalProjectPath,
};

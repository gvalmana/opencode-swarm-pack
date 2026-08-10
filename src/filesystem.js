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

function filesAreEqual(source, destination) {
  if (!fs.existsSync(destination)) {
    return false;
  }

  return fs.readFileSync(source).equals(fs.readFileSync(destination));
}

function installFile(source, destination, options) {
  ensureDirectory(path.dirname(destination));

  if (fs.existsSync(destination) && !options.force) {
    if (filesAreEqual(source, destination)) {
      return;
    }

    throw new Error(
      `target exists with different content: ${destination}\nUse --force to overwrite.`
    );
  }

  fs.copyFileSync(source, destination);
}

function installGeneratedFile(content, destination, options) {
  ensureDirectory(path.dirname(destination));

  if (fs.existsSync(destination) && !options.force) {
    if (fs.readFileSync(destination, "utf8") === content) {
      return;
    }

    throw new Error(
      `target exists with different content: ${destination}\nUse --force to overwrite.`
    );
  }

  fs.writeFileSync(destination, content);
}

function installDirectory(sourceDir, destinationDir, options) {
  if (!isDirectory(sourceDir)) {
    return;
  }

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const source = path.join(sourceDir, entry.name);
    const destination = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      installDirectory(source, destination, options);
    } else if (entry.isFile()) {
      installFile(source, destination, options);
    }
  }
}

module.exports = {
  ensureDirectory,
  installDirectory,
  installFile,
  installGeneratedFile,
  isDirectory,
};

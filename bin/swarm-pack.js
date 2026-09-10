#!/usr/bin/env node

const path = require("node:path");
const { run } = require("../src/cli");

process.exit(
  run(process.argv.slice(2), {
    packageRoot: path.resolve(__dirname, ".."),
  })
);

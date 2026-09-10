const { install } = require("./install");
const { listTargetIds } = require("./targets/registry");

function mainUsage() {
  return `Usage:
  swarm-pack <command> [options]

Commands:
  install        Install a swarm team into a supported target

Options:
  -h, --help     Show help`;
}

function installUsage() {
  return `Usage:
  swarm-pack install --target <name> --global [--team <name>] [--force]
  swarm-pack install --target <name> --local <project-path> [--team <name>] [--force]

Options:
  --target <name>     Required. Tool target to install into. Available: ${listTargetIds().join(", ")}
  --global            Install into the target's global configuration
  --local <path>      Install into the target's local project configuration
  --team <name>       Team to install. Default: all
  --force             Overwrite existing installed files
  -h, --help          Show help`;
}

function readFlagValue(args, index, flag) {
  const value = args[index + 1];

  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }

  return value;
}

function parseInstallArgs(args) {
  const options = {
    target: "",
    team: "all",
    force: false,
    help: false,
    mode: "",
    localPath: "",
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    switch (arg) {
      case "--target":
        options.target = readFlagValue(args, index, "--target");
        index += 1;
        break;
      case "--team":
        options.team = readFlagValue(args, index, "--team");
        index += 1;
        break;
      case "--global":
        if (options.mode) {
          throw new Error("choose only one of --global or --local <project-path>");
        }
        options.mode = "global";
        break;
      case "--local":
        if (options.mode) {
          throw new Error("choose only one of --global or --local <project-path>");
        }
        options.localPath = readFlagValue(args, index, "--local");
        options.mode = "local";
        index += 1;
        break;
      case "--force":
        options.force = true;
        break;
      case "-h":
      case "--help":
        options.help = true;
        break;
      default:
        throw new Error(`unknown argument: ${arg}`);
    }
  }

  return options;
}

function run(args, context) {
  const command = args[0];

  if (!command || command === "-h" || command === "--help") {
    console.log(mainUsage());
    return 0;
  }

  if (command !== "install") {
    console.error(`ERROR: unknown command: ${command}`);
    console.error(mainUsage());
    return 1;
  }

  let options;
  try {
    options = parseInstallArgs(args.slice(1));
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    console.error(installUsage());
    return 1;
  }

  if (options.help) {
    console.log(installUsage());
    return 0;
  }

  try {
    install({ ...options, packageRoot: context.packageRoot });
    return 0;
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    return 1;
  }
}

module.exports = {
  run,
};

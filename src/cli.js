const { install } = require("./install");

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
  --target <name>     Required. Tool target to install into. Available: opencode
  --global            Install into the target's global configuration
  --local <path>      Install into the target's local project configuration
  --team <name>       Team to install. Default: delivery-team
  --force             Overwrite existing installed files
  -h, --help          Show help`;
}

function parseInstallArgs(args) {
  const options = {
    target: "",
    team: "delivery-team",
    force: false,
    mode: "",
    localPath: "",
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    switch (arg) {
      case "--target":
        index += 1;
        if (!args[index]) {
          throw new Error("--target requires a target name");
        }
        options.target = args[index];
        break;
      case "--team":
        index += 1;
        if (!args[index]) {
          throw new Error("--team requires a team name");
        }
        options.team = args[index];
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
        index += 1;
        if (!args[index]) {
          throw new Error("--local requires a project path");
        }
        options.mode = "local";
        options.localPath = args[index];
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
    return;
  }

  if (command !== "install") {
    console.error(`ERROR: unknown command: ${command}`);
    console.error(mainUsage());
    process.exit(1);
  }

  let options;
  try {
    options = parseInstallArgs(args.slice(1));
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    console.error(installUsage());
    process.exit(1);
  }

  if (options.help) {
    console.log(installUsage());
    return;
  }

  try {
    install({ ...options, packageRoot: context.packageRoot });
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  run,
};

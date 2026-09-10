#!/usr/bin/env sh
set -eu

usage() {
  cat <<'USAGE'
Usage:
  ./install.sh --self-install [--force]
  ./install.sh --global [--team <name>] [--force]
  ./install.sh --local <project-path> [--team <name>] [--force]

Options:
  --self-install      Copy these teams to ~/.local/share and install opencode-swarm-install
  --global            Install into ~/.config/opencode (delegates to the npm CLI)
  --local <path>      Install into <path>/.opencode (delegates to the npm CLI)
  --team <name>       Team to install. Default: all
  --force             Overwrite existing installed files
  -h, --help          Show this help
USAGE
}

mode=""
local_path=""
team=""
force=""

while [ "$#" -gt 0 ]; do
  case "$1" in
    --global)
      mode="global"
      shift
      ;;
    --self-install)
      mode="self-install"
      shift
      ;;
    --local)
      mode="local"
      if [ "$#" -lt 2 ]; then
        echo "ERROR: --local requires a project path" >&2
        exit 1
      fi
      local_path="$2"
      shift 2
      ;;
    --team)
      if [ "$#" -lt 2 ]; then
        echo "ERROR: --team requires a team name" >&2
        exit 1
      fi
      team="$2"
      shift 2
      ;;
    --force)
      force="yes"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "ERROR: unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

self_install() {
  share_dir="${HOME}/.local/share/opencode-swarm-teams"
  bin_dir="${HOME}/.local/bin"
  wrapper="$bin_dir/opencode-swarm-install"

  if [ -e "$share_dir" ] && [ "$force" != "yes" ]; then
    echo "ERROR: self-install target exists: $share_dir" >&2
    echo "Use --force to overwrite." >&2
    exit 1
  fi

  mkdir -p "$share_dir" "$bin_dir"

  if [ "$script_dir" = "$share_dir" ]; then
    :
  elif [ -e "$share_dir" ]; then
    rm -rf "$share_dir"
    mkdir -p "$share_dir"
    (cd "$script_dir" && tar cf - .) | (cd "$share_dir" && tar xf -)
  else
    (cd "$script_dir" && tar cf - .) | (cd "$share_dir" && tar xf -)
  fi

  cat > "$wrapper" <<EOF
#!/usr/bin/env sh
exec "$share_dir/install.sh" "\$@"
EOF
  chmod +x "$wrapper"

  echo "Installed OpenCode Swarm Teams into $share_dir"
  echo "Installed CLI wrapper: $wrapper"
  echo "Use: opencode-swarm-install --local ."
  case ":${PATH}:" in
    *":$bin_dir:"*) ;;
    *) echo "WARNING: $bin_dir is not in PATH. Add it to use opencode-swarm-install directly." ;;
  esac
}

if [ -z "$mode" ]; then
  echo "ERROR: choose --self-install, --global, or --local <project-path>" >&2
  usage >&2
  exit 1
fi

if [ "$mode" = "self-install" ]; then
  self_install
  exit 0
fi

# Team installation is delegated to the npm CLI so there is a single source of
# truth for teams, dependencies, and overwrite semantics.
set -- install --target opencode

if [ "$mode" = "global" ]; then
  set -- "$@" --global
else
  set -- "$@" --local "$local_path"
fi

if [ -n "$team" ]; then
  set -- "$@" --team "$team"
fi

if [ "$force" = "yes" ]; then
  set -- "$@" --force
fi

exec node "$script_dir/bin/swarm-pack.js" "$@"

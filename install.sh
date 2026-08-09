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
  --global            Install into ~/.config/opencode
  --local <path>      Install into <path>/.opencode
  --team <name>       Team to install. Available: delivery-team, review-team, feature-team, assurance-team, mission-team
  --force             Overwrite existing installed files
  -h, --help          Show this help
USAGE
}

mode=""
local_path=""
team="delivery-team"
force="no"

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

case "$team" in
  delivery-team|review-team|feature-team|assurance-team|mission-team) ;;
  *)
    echo "ERROR: team '$team' is not implemented yet. Available: delivery-team, review-team, feature-team, assurance-team, mission-team" >&2
    exit 1
    ;;
esac

if [ "$mode" = "global" ]; then
  target_dir="${HOME}/.config/opencode"
else
  if [ ! -d "$local_path" ]; then
    echo "ERROR: local project path does not exist: $local_path" >&2
    exit 1
  fi
  target_dir=$(CDPATH= cd -- "$local_path" && pwd)/.opencode
fi

install_file() {
  src="$1"
  dest="$2"
  dest_parent=$(dirname -- "$dest")
  mkdir -p "$dest_parent"

  if [ -e "$dest" ] && [ "$force" != "yes" ]; then
    if cmp -s "$src" "$dest"; then
      return 0
    fi
    echo "ERROR: target exists with different content: $dest" >&2
    echo "Use --force to overwrite." >&2
    exit 1
  fi

  cp "$src" "$dest"
}

install_dir() {
  src_dir="$1"
  dest_dir="$2"

  if [ ! -d "$src_dir" ]; then
    return 0
  fi

  find "$src_dir" -type f | while IFS= read -r src; do
    rel=${src#"$src_dir"/}
    install_file "$src" "$dest_dir/$rel"
  done
}

install_team() {
  selected_team="$1"
  selected_team_dir="$script_dir/teams/$selected_team"

  if [ ! -d "$selected_team_dir" ]; then
    echo "ERROR: team directory not found: $selected_team_dir" >&2
    exit 1
  fi

  install_dir "$selected_team_dir/agents" "$target_dir/agents"
  install_dir "$selected_team_dir/commands" "$target_dir/commands"
  install_dir "$selected_team_dir/skills" "$target_dir/skills"
}

case "$team" in
  delivery-team) ;;
  review-team|feature-team|assurance-team|mission-team)
    install_team "delivery-team"
    ;;
esac

case "$team" in
  assurance-team)
    install_team "feature-team"
    ;;
esac

install_team "$team"

echo "Installed $team into $target_dir"
echo "Restart OpenCode for the new agents, commands, and skills to load."

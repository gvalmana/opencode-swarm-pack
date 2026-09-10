# Changelog

## 0.2.0

- Refactor target installation around a shared two-phase install plan with pre-flight conflict detection.
- Add team manifests and transitive dependency resolution.
- Share frontmatter parsing, role classification, target text helpers, skill copying, and instruction rendering across targets.
- Make `install.sh` delegate OpenCode installs to the Node CLI while preserving `--self-install`.
- Remove the dormant `swarm/` scaffold from the npm package payload.
- Tighten Claude Code read-only role rendering by omitting unrestricted `Bash`.

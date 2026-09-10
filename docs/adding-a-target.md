# Adding A Target

Targets live in `src/targets/` and are registered in `src/targets/registry.js`.

## Contract

Each target module must export:

```js
{
  id: "target-id",
  displayName: "Target Name",
  capabilities: {},
  restartMessage: "Restart ...",
  resolveTargetDirectory(options) {},
  describeDestinations(options, targetDirectory) {},
  installTeam(packageRoot, targetDirectory, teamName, options, plan) {},
  installInstructions(teams, options, plan) // optional
}
```

The registry validates this contract at startup.

## Reuse Shared Helpers

- `src/targets/frontmatter.js` for frontmatter parsing.
- `src/targets/roles.js` for role classification.
- `src/targets/text.js` for text adaptation.
- `src/targets/base.js` for local path validation, agent listing, and skill-tree planning.
- `src/targets/instructions.js` for installed team and workflow sections.

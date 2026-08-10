# Commit Discipline

Swarm Pack uses small role-owned commits.

## Commit Owner

Only the orchestrator creates commits.

Subagents may edit files and run verification, but they do not run `git commit`.

## Commit Timing

The orchestrator commits after each role when:

- The role completed successfully.
- The diff is understood.
- The changed files belong to the role's assignment.
- Verification was run or a clear reason was recorded.
- The commit will not include unrelated user changes.

## Commit Message Format

Every role-owned commit must include a role byline:

```text
<concise summary>

By <role>.
```

Examples:

```text
Implement checkout total validation

By coder.
```

```text
Simplify checkout validation flow

By cleaner.
```

## Unexpected Changes

If unrelated files are modified, the orchestrator must stop and ask before committing. It must not revert user changes.

## No Forced History

Do not amend, force-push, or use destructive git commands unless the user explicitly requests it.

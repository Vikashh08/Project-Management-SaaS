# Project Rules

## GitHub Push Behavior

- **Push after every task**: After completing each assigned task, immediately push the changes to GitHub. Do not accumulate multiple tasks into a single push.
- **Commit one feature at a time**: Group related file changes into a single commit per feature/fix. Never squash multiple unrelated features into one "mega commit".
- **Natural commit messages only**: Write commit messages in plain, conversational English. Examples:
  - ✅ "Add optimistic UI updates for faster Kanban board drag and drop"
  - ✅ "Fix upload path so attachments are served correctly"
  - ✅ "Build in-app workspace invites and show them in notification dropdown"
  - ❌ "feat: add optimistic updates"
  - ❌ "fix: correct upload path"
  - ❌ "chore: update analytics"
- **No conventional commit prefixes**: Do not use `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, or similar prefixes in commit messages.

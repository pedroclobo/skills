---
name: prune-worktrees
description: Prune branches and worktrees with merged GitHub PRs and clean notifications for merged or closed PRs.
disable-model-invocation: true
---

Remove branches and worktrees that have been merged and trash the GitHub notification emails for merged or closed PRs.

1. Inventory the worktrees.
   - List the current repo's worktrees, including the current and temporary ones. Skip `main` and `master`.
   - List all local branches that have no upstream equivalent.
   - Record the path, branch or detached state, and dirty/untracked status for each worktree/branch.

2. Classify each branch/worktree.
   - Resolve the upstream branch for each worktree/branch.
   - A branch/worktree is eligible when it is associated with a merged PR and contain no open PR for that branch.

3. Find GitHub notification gmails.
   - Search for GitHub notification emails for each eligible PR.
   - Additionally, search for GitHub notifications emails for any other PRs that have been merged or closed.

4. Report and confirm. Present one report with:
   - every eligible worktree/branch, its dirty/untracked state, matching PRs, and planned Git and Gmail actions,
   - every other merged or closed PR found through Gmail, with its notifications,
   - every retained worktree and why,
   - detached worktrees as optional manual deletions.
   Then, ask whether to proceed.

5. Execute.
   - Remove the worktrees, forcing removal when dirty or untracked.
   - Delete its local and remote branches.
   - Trash the recorded Gmail messages.

Never execute any destructive action without explicit user permission.

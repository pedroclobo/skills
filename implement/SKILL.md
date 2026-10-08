---
name: implement
description: Implement a feature end-to-end.
disable-model-invocation: true
---

1. Discuss the interview the user requested with $interview. In the round of the interview, we should agree on the worktree and branch names for the new feature.
2. Implement the feature as discussed in the new worktree.
3. The new worktree should also include an untracked `pr-description.md`, written with $show-me, closely mirroring my recent PR descriptions.

You should push the branch, but never open a PR, unless the user explicitly requests it.

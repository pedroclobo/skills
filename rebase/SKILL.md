---
name: rebase
description: Rebase a branch, resolving trivial conflicts and interviewing the user on the rest.
disable-model-invocation: true
---

Rebase the current branch onto the requested base, or onto local `master`/`main` if the user gives no base.

1. Run `git rebase <base>` and handle every pause.
   For each pause:
   - Resolve every trivial conflict with the smallest patch that preserves both sides' applicable changes.
   - Run the repo's formatter once all conflicts for the commit are resolved. Continue only when formatting passes.
   - Stage only the resolved paths and run `GIT_EDITOR=true git rebase --continue`.

2. Interview the user on the non-trivial conflicts in the paused commit, all in one round via `/batch-interview`.
   - For each, give the replayed commit, the conflicted hunk, justify why it is non-trivial to solve, and give a recommended path.

3. Validate once the rebase completes.
   - Run the repo's formatter, build/check, and linter over the rebased code. For Rust, that is `fmt`, `check`, and `clippy` on the affected crates.
   - If any of the checks fails, patch the code with the fix and amend the commit where the problem originated. Do not amend only the latest commit.

4. Report the results.
   - Show one approximate diff per conflict hunk. Add a short explanation only where the resolution required judgment (it was not mechanical).
   - Say explicitly when the rebase had no conflicts.


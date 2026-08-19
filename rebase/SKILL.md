---
name: rebase
description: Use when the user asks to rebase.
---

# Rebase

Rebase the current branch onto the requested base. Use local `master` when the user gives no base. Keep a conflict ledger from the first conflict until the final report.

## 1. Establish the rebase

1. Read the applicable `AGENTS.md`, `CLAUDE.md`, repository instructions, and project commands before changing files.
2. Resolve the repository root, current branch, current `HEAD`, and base:
   - Use the user's explicit base when provided
   - Otherwise use the local branch `master` exactly
   - Treat a missing local base as a blocker rather than silently choosing `main`, `trunk`, or a remote branch
3. Inspect `git status --short`.
   - If a rebase is already in progress, inspect and resume that rebase instead of starting another one. Reconstruct its current state before changing files.
   - Otherwise, proceed only with a clean, attached branch that is not the base branch.
   - If that worktree is dirty, explain the paths at risk and recommend committing or stashing them. Resume only after the user makes the worktree safe.
4. Record the starting branch, `HEAD`, base ref, base commit, and the ordered commits in `<base>..HEAD`.
5. Create a temporary directory for conflict snapshots. Keep it until the final report, then remove it.

Done when the exact branch, local base, starting commits, and clean-worktree state are recorded.

## 2. Run and resolve the rebase

Run `git rebase <base>` and handle every pause before continuing.

At each conflict:

1. Record the replayed commit and subject from `git status` and `git rebase --show-current-patch`.
2. Inventory every unmerged path with `git diff --name-only --diff-filter=U`. For each path, inspect `git diff --cc -- <path>` and all three index stages:
   - Stage 1 is the common ancestor
   - Stage 2, `ours`, is the base side being rebased onto
   - Stage 3, `theirs`, is the commit being replayed
3. Save the stage-2 and stage-3 blobs for every conflicted path in the temporary directory before editing. Keep the path, commit, and snapshot names in the ledger.
4. Classify the conflict as trivial only when the intended result is mechanically clear from the two sides, the commit message, nearby code, and repository conventions. Examples include adjacent non-overlapping edits, a duplicate import or formatting change, and a generated file with a documented deterministic regeneration command.
5. Resolve each trivial conflict with the smallest patch that preserves the applicable changes. Use the project's generator for generated files when one is documented. Inspect the result with `git diff --check` and the relevant diff before staging.
6. Save the resolved blob after staging and record a final code diff for that conflict. Compare the saved stage-2 blob with the resolved blob using `git diff --no-index`, preserving the affected hunk and enough surrounding context to show the decision. If that diff is empty because the base side won, compare the stage-3 blob with the resolved blob so the report still shows what was discarded. Label whether the result kept the base side, kept the replayed side, or combined both. If a side was discarded, record why.
7. Stage only the resolved paths and run `GIT_EDITOR=true git rebase --continue`. Recheck status after every continue.

Use `git rebase --skip` only when the replayed commit has become empty and inspection proves its change already exists in the base or in an earlier replayed commit. Record that skipped commit and the proof. Preserve a commit when its intent remains distinct.

### Uncertain conflicts

Stop the rebase at the first conflict whose result depends on product behavior, API meaning, data migration, security, deletion-versus-modification, binary content, submodules, or any intent the available evidence cannot settle. Leave the rebase paused and preserve the conflict markers and index stages.

Tell the user:

- The replayed commit
- Every conflicted path and hunk
- The concrete reason the choice is uncertain
- The recommended path, such as keeping the base behavior, preserving the incoming behavior, combining both with a specific invariant, regenerating an artifact, or asking the author of the change

Do not guess, continue, abort, or run validation while this decision is unresolved. When the user chooses a path, apply only that choice, add it to the ledger, and resume the same procedure.

Done when `git status` reports no unmerged paths and the rebase has either advanced to the next commit or stopped with the required uncertainty report.

## 3. Finish and validate

After `git rebase --continue` completes:

1. Confirm that no rebase is in progress, the worktree is clean, and `<base>` is an ancestor of `HEAD`.
2. Run the repository's documented formatter, build/check, and linter commands that cover the rebased code. Run each independently so one failure does not hide later results. Record each command and its result.
   - For Rust repositories, run `fmt`, `check` and `clippy` on the relevant crates.
4. Treat validation failures as reportable results. Inspect whether a failure comes from a conflict resolution, and explain the evidence. Keep the rebase complete while reporting failures unless the user asks for a follow-up fix.
5. Prepare the conflict summary:
   - Show the final diff for every resolved conflict
   - For trivial conflicts, show only the diff
   - For resolutions that required judgment, add a short explanation
   - Mention skipped commits or user-directed resolutions only when they occurred
6. Prepare the result and validation summary. Put validation last.

Done when the rebase result and validation status are verified and the final report accounts for every conflict, skipped commit, user decision, and captured resolution diff.

## Final report

List the following:

1. Conflicts: one diff per conflict hunk. Add a short explanation only when the resolution required judgment
2. Validation: each command and pass/fail result. Include failures and caveats here

Say explicitly when the rebase had no conflicts. Never claim a clean validation result without naming the commands that passed.

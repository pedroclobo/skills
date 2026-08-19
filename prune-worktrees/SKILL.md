---
name: prune-worktrees
description: Prune worktrees whose branches have merged GitHub PRs.
disable-model-invocation: true
---

# Prune worktrees

Remove worktrees for branches with clearly merged GitHub PRs. Inspect everything first, then require one global confirmation before any Git or Gmail mutation.

## Runbook

### 1. Inspect

- Resolve the repository from the current working directory and verify it is a Git worktree.
- Resolve the base GitHub `owner/name` from its remotes. Parse the remote URL and verify it with `gh repo view owner/name`. If GitHub or `gh` access fails, stop before mutation.
- Inventory `git -C <repo> worktree list --porcelain`, including the current and temporary worktrees. Exclude only branches exactly named `main` or `master`.
- For every other entry, record its path, branch or detached state, and dirty/untracked status. Detached entries are manual candidates only and have no PR or email association.

### 2. Classify

For every non-detached branch:

- Resolve its configured upstream with `git for-each-ref`. Query the tracked remote branch, preserving every slash in the branch name. Derive the head owner from the remote URL and keep the base repository from step 1.
- Query the exact PR set with:

  ```text
  gh api --paginate repos/{base-owner}/{base-repo}/pulls --method GET \
    -f state=all -f head={head-owner}:{full-head-branch}
  ```

  Request the PR number, title, state, `merged_at`, head owner, head branch, head repository, and URL. Match the returned fields exactly. Do not use fuzzy searches or `gh pr list`.
- Without an upstream, make the same exact query for each configured remote owner as a bounded fallback.
- A branch is eligible only when the exact results clearly contain a merged PR, contain no open exact PR, and branch protection is known to allow deletion. Retain branches that are absent, unavailable, ambiguous, closed-unmerged without a clear merged result, open, protected, or impossible to check. Include fork PRs, but plan remote deletion only for an eligible `origin` branch.
- Record every matching PR and each planned worktree, local-branch, remote, and email action.

For each eligible PR, use the configured Gmail MCP to find GitHub notifications. Gmail cleanup is optional if the connector is unavailable.

#### Email matching

Use candidate discovery followed by evidence checks. Search the entire mailbox with several bounded queries for the full repository name or URL, PR number or PR URL, exact branch and normalized branch forms, and GitHub notification senders. Paginate with `next_page_token`; do not rely on one query that requires every token in one message.

Normalize repository URLs and names, `refs/heads/x` versus `x`, URL-encoded branch names, and `#123` versus `/pull/123`. Read shortlisted messages with `batch_read_email`; read the thread when surrounding messages supply context. Use `search_email_ids` only once the deletion set is finalized.

Classify evidence as follows:

- **Strong**: an exact PR URL, or the full repository plus PR number.
- **Good**: the full repository plus exact branch, or a PR number from a GitHub notification whose thread identifies the repository.
- **Reject**: branch-only, repository-only, title-only, or ambiguous matches.

Trash strong and good matches after confirmation. A thread may supply missing context, but delete matching messages individually and include review, comment, CI, and mention notifications only when their message or thread context identifies the target PR. Do not trash an entire mixed thread. Record sender, subject, evidence, and count internally; report human-readable details without raw message or thread IDs. Never associate email with detached worktrees.

### 3. Report and confirm

Present one report containing:

- every eligible worktree, its dirty/untracked state, matching PRs, and planned Git/Gmail actions;
- every retained worktree and the reason it was retained; and
- detached worktrees as optional manual deletions.

Ask once for exact confirmation:

- `yes` selects all eligible entries, never detached entries;
- `yes detached: <numbers>` also selects the listed detached entries;
- any other response cancels everything.

Do not delete anything before this confirmation.

### 4. Execute

After confirmation, process entries independently from outside candidate worktrees when possible, using `git -C <repo>`:

- remove each confirmed worktree, forcing removal for dirty or untracked entries;
- delete its local branch afterward; and
- delete only its eligible `origin` branch.

Never delete `main`, `master`, protected branches, or branches belonging only to another remote. Pass paths and branch names as separate arguments. Never interpolate them into shell syntax. Treat already-absent items as successful idempotent results. Do not close, merge, or otherwise mutate PRs.

After Git cleanup, move the recorded Gmail messages to Trash individually or in batches. Continue after individual failures. The final report must account for every confirmed worktree, local branch, remote action, and email, including successes, absent items, skips, and failures.

## Non-negotiables

- Inspection and one exact global confirmation precede every mutation.
- A merged PR is insufficient when another exact PR is open or the result is ambiguous.
- Show dirty/untracked state before any forced removal.
- Retain and explain anything that cannot be checked confidently. Never guess.

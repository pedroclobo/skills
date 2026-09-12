---
name: address-review
description: Address PR review comments through one at a time interviews. Implement the agreed fixes at the end.
disable-model-invocation: true
---

Resolve PR review comments. Only tackle the issues raised in the comments. Don't introduce unnecessary changes.

1. Fetch unresolved review threads and unaddressed top-level comments for the given PR with `gh`.
   - Exclude resolved and outdated threads, and any reviewer comment already followed by a reply from the current GitHub user in the same thread.
   - If a reviewer commented again after the current user's last reply, include only those later reviewer comments.
   Done when each remaining item has reviewer, verbatim comment, file/line locations, the GitHub discussion URL, and a brief code/background context.

2. Interview one item at a time, oldest to newest.
   For each item:
   - show the reviewer's name
   - quote the comment verbatim
   - give some brief context
   - show the estimated code diff if the fix is small
   - use `$interview` to reach a shared understanding of the fix/reply
   Done when user confirms the chosen fix/reply for that item.

3. Build a final change plan covering all confirmed responses.
   - Prefer mapping one review comment fix to one `git` commit.
   Done when every included item is mapped to an implementation change or explicitly deferred by the user.

4. Implement only after all interviews are complete and the final plan is confirmed.
   Done when the code matches the confirmed plan and contains no unrelated edits.

Do not batch questions. Do not edit code before the user confirms the final plan.
Never push changes, mark threads as resolved or post replies on GitHub without the user's explicit request.

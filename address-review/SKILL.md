---
name: address-review
description: Address PR review comments through one-at-a-time interviews, then implement agreed fixes.
disable-model-invocation: true
---

Resolve PR review comments with minimal final diff.

1. Fetch unresolved review threads for the given PR with `gh`.
   - Exclude bots, resolved threads, outdated threads, and non-actionable chatter unless user asks.
   - Exclude any reviewer comment already followed by a reply from the current GitHub user in the same thread.
   - If a reviewer commented again after the current user's last reply, include only those later reviewer comments.
   Done when each remaining item has reviewer, verbatim comment, file/line if present, GitHub URL, and brief code/background context.

2. Interview one item at a time, oldest to newest.
   For each item:
   - show reviewer
   - quote the comment verbatim
   - give brief context
   - use `/interview` to reach shared understanding of the fix/reply
   Done when user confirms the chosen response for that item.

3. Build a final change plan covering all confirmed responses.
   Done when every included item is mapped to an implementation change or explicitly deferred by the user.

4. Implement only after all interviews are complete and the final plan is confirmed.
   Done when the code matches the confirmed plan and contains no unrelated edits.

Do not batch questions. Do not edit code before final plan confirmation.

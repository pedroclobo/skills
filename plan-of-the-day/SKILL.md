---
name: plan-of-the-day
description: Draft today's plan of the day from GitHub notification emails in Gmail.
disable-model-invocation: true
---

Produce today's plan of the day from GitHub email notifications and `gh`. `gh` should be used outside the dev container.

1. Determine the time window.

- The window runs from the last workday through today. Start from yesterday and walk back past weekend days (Sat/Sun) to the most recent workday.

2. Collect candidates from Gmail.

- Search Gmail for messages from `notifications@github.com` received within the time window.
- Read enough of each thread to classify it. Keep only comments or reviews left by others on a PR the user authored, PRs where the user's review was requested or PRs where the user has been mentioned.
- Ignore CI notifications.

3. Filter stale items with `gh`.

- Drop PRs that are merged or closed.
- Drop review items the user already reviewed since the request.
- Look for a review by the user newer than the request email.

4. Write the plan.

- Print in chat, strictly following in the format below (M/D is a date), with markdown links to the PRs. Emit the raw markdown in a unescaped code box.
- If no items were found, say "Nothing planned for the day."

```markdown
[M/D]
- Address [#12345](https://github.com/llvm/llvm-project/pull/12345), [#12346](https://github.com/llvm/llvm-project/pull/12346) and [#12347](https://github.com/llvm/llvm-project/pull/12347) review comments.
- Review [#12348](https://github.com/llvm/llvm-project/pull/12348).
```

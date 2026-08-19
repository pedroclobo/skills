---
name: plan-of-the-day
description: Draft today's plan of the day from GitHub notification emails in Gmail.
disable-model-invocation: true
---

Produce today's plan of the day from GitHub email notifications and `gh`.
`gh` should be used outside the dev container.

## 1. Determine the window

The window runs from the last workday through today. Start from yesterday and walk back past weekend days (Sat/Sun) to the most recent workday.

Done when: you have a concrete start date.

## 2. Collect candidates from Gmail

Search Gmail for messages from `notifications@github.com` received within the window (`from:notifications@github.com after:YYYY/MM/DD`). Read enough of each thread to classify it. Keep only:

- **Address** — comments or reviews left by others on a PR the user authored.
- **Review** — PRs where the user's review was requested.

Ignore everything else (CI, mentions elsewhere, issues). For each kept item record PR number and full PR URL.

Done when: every GitHub email in the window is classified as Address, Review, or ignored.

## 3. Filter stale items with `gh`

For each candidate PR (repo taken from its URL), check state:

- Drop PRs that are merged or closed: `gh pr view <num> --repo <owner>/<repo> --json state`.
- Drop review items the user already reviewed since the request: `gh pr view <num> --repo <owner>/<repo> --json reviews` and look for a review by the user newer than the request email.

Done when: every candidate PR was checked and kept or dropped.

## 4. Emit the plan

Print in chat, in the following format:

```
[7/10]
- Address [#12345](https://github.com/llvm/llvm-project/pull/12345), [#12346](https://github.com/llvm/llvm-project/pull/12346) and [#12347](https://github.com/llvm/llvm-project/pull/12347) review comments.
- Review [#12348](https://github.com/llvm/llvm-project/pull/12348).
```

Done when: the plan is printed and every kept item from step 3 appears in it.

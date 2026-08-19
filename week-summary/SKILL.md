---
name: week-summary
description: Produce a paste-ready weekly meeting summary from GitHub activity.
disable-model-invocation: true
---

Scout the authenticated user's weekly activity with `gh`, then provide a summary list of the work done in the past week.

## 1. Set the completed meeting window

Use the machine's local timezone. Find the latest Wednesday at 08:00 that has already passed. The window starts at the preceding Wednesday at 10:00 and ends at that 08:00 cutoff. Treat the start as inclusive and the end as exclusive.

Done when: you have the login and exact start/end timestamps for one completed window.

## 2. Collect every candidate

Use `gh`. Search separately for:

- PRs authored by the login and merged within the window.
- Open or draft PRs authored by the login and updated within the window.
- PRs matching `reviewed-by:<login>` and updated within the window.
- PRs matching `commenter:<login>` and updated within the window.

Paginate every search. Deduplicate by PR URL. For each candidate, fetch PR information with `gh` to establish its title, body, author, state, draft status, URL, creation/update/merge times, labels, linked PRs, commits, and review records including reviewer and submission timestamp. Also paginate `GET /repos/furiosa-ai/npu-tools/pulls/<number>/reviews`, `GET /repos/furiosa-ai/npu-tools/issues/<number>/comments`, and `GET /repos/furiosa-ai/npu-tools/pulls/<number>/comments` for every candidate. record each item's author and timestamp. Do not rely on search results alone to determine qualifying review activity.

Done when: every search result is deduplicated and has the evidence needed to classify it.

## 3. Classify from evidence

Keep only these activities that occurred inside the window:

- **Merged work**: PRs authored by the login whose `mergedAt` is in the window.
- **Active work**: Open or draft PRs authored by the login with a meaningful event in the window: creation, a pushed commit, or material review/discussion. Drop PRs that were merely observed or mechanically updated.
- **Reviews**: PRs on which the login, in the window, submitted an `APPROVED`, `CHANGES_REQUESTED`, or `COMMENTED` review, left an issue comment, or left an inline review comment. Do not count viewing or review requests.

An authored PR takes precedence over its review role. For remaining candidates, drop anything without qualifying activity.

Done when: every candidate is kept in exactly one activity class or dropped with a recorded evidence-based reason.

## 4. Form workstreams

For every kept PR, follow its PR-stack references and GitHub cross-references, including adjacent PRs that establish the shared initiative. Group kept PRs that related to each other.

Order authored merged work first, then active work, then reviews. Within each, order workstreams by their latest qualifying activity, newest first. Order URLs within a workstream newest first.

Done when: every kept PR belongs to one evidence-supported workstream and every narrative claim is supported by GitHub data.

## 5. Print the notes

Print only plain-text with indented bullets: one concise outcome-oriented workstream bullet followed by its full PR URLs. Use direct URLs. If no PR qualifies, print nothing.

Example outcome:

```text
- Improve LLVM IR diagnostics and parser errors
    - https://github.com/llvm/llvm-project/pull/12345
    - https://github.com/llvm/llvm-project/pull/12346
    - https://github.com/llvm/llvm-project/pull/12347
- Add RISC-V backend instruction-selection fixes
    - https://github.com/llvm/llvm-project/pull/12348
    - https://github.com/llvm/llvm-project/pull/12349
- Refactor Clang tooling APIs
    - https://github.com/llvm/llvm-project/pull/12350
    - https://github.com/llvm/llvm-project/pull/12351
- Review LLVM code-generation cleanup PRs
    - https://github.com/llvm/llvm-project/pull/12352
    - https://github.com/llvm/llvm-project/pull/12353
```

Done when: every kept PR URL appears exactly once in the plain-text notes, and nothing else is printed.

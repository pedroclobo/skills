---
name: review
description: Manual PR/branch review.
disable-model-invocation: true
---

Run a diff-anchored review. Inspect files, diffs, and history as needed. Make no edits and run no tests, builds, formatters, linters, benchmarks, or CI.

1. Prepare scope.
   - The user will either specify a remote PR identifier (like "#14"), or not specify anything at all, and you should review the current branch.
   - For PRs: use `gh` to create a temporary branch in `/tmp`. Also fetch the title and PR description for additional context.
   - For local branches: identify the current branch.

2. Delegate lenses in parallel.

- Always spawn **Correctness** and **Style & conventions**.
- Add **Performance & cost**, or a domain-specific lens only when the diff signals that risk or the user asks.
- Spawn various sub-agents, focused on a specific lens. Give each sub-agent the PR title and description (or equivalent for local branches).

- For every sub-agent:
  - Inspect and reason only. Do not change files.
  - Return a flat list: `severity · file:line · concrete problem and impact`, with a fix code block when useful.

2.1 **Correctness**

- Assess the implementation against PR title/body/issues, or the local branch goal.
- Treat every asserted claim in the inventory as a hypothesis, and try to break it with a concrete counterexample.

2.2 **Style & conventions**

- Audit the repo for a general guidelines file, like `CLAUDE.md` or `AGENTS.md`.
- Inspect analogous nearby code.
- Find departures from that guidance, scope creep, non-idiomatic code, inaccurate comments, unnecessary complexity, and structural problems worth refactoring.

2.3 **Performance & cost**

- Find work the change adds that it does not need.

3. Aggregate the sub-agent findings, and verify and grade them.
   - Check each claimed line in current files.
   - Keep only issues anchored to changed lines.
   - Normalize severity:
     - **Must change**: correctness issue.
     - **Should change**: maintainability, simplification, scope-creep, or risky-design issue.
     - **Nit**: tiny style, comment, naming, or readability issue.
   - Attribute an identifier to each item, i.e, "F1", "F2", etc.
   - Drop any finding whose impact cannot be stated concretely.
   - Merge duplicate reports from several lenses.

4. Report the found items concisely, grouped by root cause and ordered **Must change**, **Should change**, then **Nit**.
   For each item you should include:
   - Unique identifier for the issue,
   - Relevant file/line location and the relevant code,
   - Code diff with the fix, if relevant,
   - A concise draft of a GitHub comment that can be posted as a review comment. Never post comments yourself.

If no findings, say `No review findings.`

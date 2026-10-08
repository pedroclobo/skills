---
name: review
description: Manual PR/branch review, triaged with the user and staged as a pending GitHub review.
disable-model-invocation: true
---

Run a diff-anchored review, triage the findings with the user, and stage the agreed comments as a pending GitHub review. Inspect files, diffs, and history as needed. Make no file edits and run no tests, builds, formatters, linters, benchmarks, or CI.

1. Prepare scope.
   - The user will either specify a remote PR identifier (like "#14"), or not specify anything at all, and you should review the current branch.
   - For PRs: use `gh` to create a temporary branch in `/tmp`. Also fetch the title and PR description for additional context.
     Review the diff from `git merge-base HEAD origin/<base branch>`. That is the diff GitHub shows, and the only lines a review comment can anchor to. Stacked PRs make this matter.
   - For local branches: identify the current branch.

2. Delegate lenses in parallel.

- Always spawn **Correctness** and **Style & conventions**.
- Add **Performance & cost**, or a domain-specific lens only when the diff signals that risk or the user asks.
- Spawn various sub-agents, focused on a specific lens. Give each sub-agent the PR title and description (or equivalent for local branches).

- For every sub-agent:
  - Inspect and reason only. Do not change files.
  - Return a flat list with the severity, file:line, concrete problem and impact, code diff for the fix and a short and concise GitHub review comment to anchor in the given file:line.

2.1 **Correctness**

- Assess the implementation against PR title/body/issues, or the local branch goal.
- Treat every asserted claim in the inventory as a hypothesis, and try to break it with a concrete counterexample.

2.2 **Style & conventions**

- Audit the repo for a general guidelines file, like `CLAUDE.md` or `AGENTS.md`.
- Inspect analogous nearby code.
- Find departures from that guidance, scope creep, non-idiomatic code, inaccurate comments, unnecessary complexity, and structural problems worth refactoring.

2.3 **Performance & cost**

- Find work the change adds that it does not need.

3. Aggregate the sub-agent findings and grade them.
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
   First, you should provide a short summary of the goal of the PR. Base yourself on the PR description for this.
   For each item you should include:
   - Unique identifier for the issue,
   - A short title for the issue, summarizing on what the issue is about.
   - Relevant file/line location and the relevant code,
   - Code diff with the fix. This should be an actual code diff, not just an estimated on the number of lines changed.

   If no findings, say `No review findings.`

5. Triage with the user.
   - Invoke the $interview skill and run the triage as its rounds. The first round asks:
     - which findings to include, by identifier, with your recommendation,
     - whether the user has findings of their own to discuss.
   - Investigate each user finding yourself before asking about it, and turn it into a question with a recommendation and a diff.
   - When the user asks about an unfamiliar domain concept, explain it concretely: name the module, the data, and what flows where.

6. Stage the pending review. For local branches, end with the agreed list from step 5 instead.
   - Draft one comment per included item: a `path:line` anchor on the right side of the diff, a short body, and a short code diff of the fix.
       - When possible, use a `suggestion` block instead of a `diff` block.
   - Check that every anchor lies inside a hunk of the step 1 diff.
   - Find the user's pending review. GitHub returns only the viewer's own pending review. If none exists, create one.
   - Add each draft as a new thread on that review.
   - Post new threads only. Reply in other reviewers' threads only when the user asks.
   - Keep the review pending. The user confirms the comments and submits the review.

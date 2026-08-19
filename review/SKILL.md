---
name: review
description: Manual PR/branch review.
disable-model-invocation: true
---

Run a diff-anchored review. Inspect files, diffs, and history as needed. Make no edits and run no tests, builds, formatters, linters, benchmarks, or CI.

1. Prepare scope.
   - Read repository instructions and conventions applicable to the changed paths.
   - For PRs: use `gh` to fetch the title, body, linked issues, diff, and exact base/head.
   - For local branches: identify base branch, then inspect diff against merge-base.
   Done when the goal, base/head, changed files, and changed line ranges are recorded.

2. Build the inventory.
   Read the diff and enumerate the concrete units under review:
   - new/changed **data shape**: type, class, schema, or interface, and its fields
   - new/changed **exported signature**, and every change to an existing one
   - a safety or invariant comment, a documented precondition, a load-bearing assertion

   Done when every changed hunk is represented by at least one inventory entry.

3. Delegate lenses in parallel. Always spawn **Correctness** and **Style & conventions**. Add **Tests**, **Type-driven design**, **Performance & cost**, or a domain-specific lens only when the diff signals that risk or the user asks. Give each agent the scope, inventory, lens, and reporting contract.

   **Correctness**
   - Assess the implementation against PR title/body/issues, or the local branch goal.
   - Find bugs, regressions, and API/behavior breaks.
   - Treat every asserted claim in the inventory as a hypothesis, and try to break it with a concrete counterexample.

   **Style & conventions**
   - Inspect analogous nearby code.
   - Find departures from that guidance, non-idiomatic code, scope creep, inaccurate or inadequate comments, unnecessary complexity, and structural problems worth refactoring.
   - Audit newtype/wrapper plumbing specifically. When existing generated or standard `From`/`TryFrom` conversions support the target type, prefer a direct conversion such as `usize::from(value)` or `usize::try_from(value)?` over inner-field access (`value.0`), one-line `get`/`value` helpers, chained conversions such as `usize::from(u8::from(value))`, or `as` casts.
   - Audit accessors and boilerplate made redundant by the canonical conversion. When an operation genuinely belongs on every wrapper, implement it once in the existing derive or shared abstraction and remove the per-type variants.

   **Tests**
   - Judge coverage of the behavior this diff changed, including where it is absent.
   - Ask of each new test whether it would still pass with the change reverted.

   **Type-driven design**
   - Ask throughout whether the type system can reject the mistake instead of a reviewer catching it.
   - Look for illegal states representable, product types that want to be sum types, primitive obsession, and invariants enforced by convention rather than by the type.

   **Performance & cost**
   - Find work the change adds that it does not need.
   - Name both the cost and the context that makes it matter. A finding that cannot name both is speculation, so drop it.

   Reporting contract for every subagent:
   - Inspect and reason only. The read-only restrictions above apply.
   - Check every relevant inventory entry and report coverage.
   - Return a flat list: `severity · file:line · concrete problem and impact`, with a fix code block only when useful.
   - Return `none` when the lens finds no findings.
   - Do not cluster.

   Done when every agent has reported and the combined coverage accounts for every inventory entry.

4. Verify and grade findings yourself.
   - Check each claimed line in current files.
   - Keep only issues anchored to changed lines.
   - Drop pre-existing issues unless made worse by this diff.
   - Treat subagent severity as advisory.
   - Normalize severity:
     - Must change: concrete correctness, security, data-loss, or breaking-behavior issue.
     - Should change: concrete maintainability, simplification, scope-creep, or risky-design issue.
     - Nit: tiny style, comment, naming, or readability issue.
   - Drop any finding whose impact cannot be stated concretely.
   - Rate an invariant **Must change** only with a concrete counterexample or proof. If a specific unproven risk remains, rate it **Should change** and tag it `unverified, lock it with a test`. Otherwise drop it.

   Done when every inventory unit has been looked at, every surviving finding is placed, and each carries an accurate filename, line/range, severity, and concrete impact.

5. Report concise, actionable, negative findings only, grouped by root cause and ordered **Must change**, **Should change**, then **Nit**.
   - Head each cluster `Severity: root cause`. List findings as `file:line: problem and concrete impact`.
   - Merge duplicate reports from several lenses. Add a fix code block only when useful.
   - A finding may carry a `Check:` line naming the A/B or falsifying check that would settle it. Propose it for the author, do not run it.
   - Close with a `Nits` block for nit findings.

If no findings, say `No review findings.`

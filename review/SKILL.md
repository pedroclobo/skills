---
name: review
description: Manual PR/branch review.
disable-model-invocation: true
---

Run a diff-anchored review. Do not edit files.

1. Resolve target.
   - For PRs: fetch PR title/body/diff with `gh`.
   - For local branches: identify base branch, then inspect diff against merge-base.
   Done when PR goal, changed files, and changed line ranges are known.

2. Spawn at least 2 read-only subagents in parallel:
   - Correctness: assess implementation against PR title/body/issues, local branch goal, and diff; find bugs, regressions, and API/behavior breaks.
   - Code style: read every repository instruction and convention file applicable to the changed paths (for example `CLAUDE.md`, `AGENTS.md`, and coding-convention docs), then inspect analogous nearby code. Find departures from those conventions, non-idiomatic code, scope creep, inaccurate or inadequate comments, and unnecessary complexity. Audit newtype/wrapper plumbing specifically: when existing generated or standard `From`/`TryFrom` conversions support the target type, prefer a direct conversion such as `usize::from(value)` or `usize::try_from(value)?` over inner-field access (`value.0`), one-line `get`/`value` helpers, chained conversions such as `usize::from(u8::from(value))`, or `as` casts. Delete accessors and boilerplate made redundant by the canonical conversion; when an operation genuinely belongs on every wrapper, implement it once in the existing derive or shared abstraction and remove per-type variants.
   - Spawn more domain-specific agents only when user requests.
   Done when the code-style agent names the guidance and analogues it consulted, every changed hunk has been checked, and every agent reports findings with file, line, and severity.

3. Verify and grade findings yourself.
   - Check each claimed line in current files.
   - Keep only issues anchored to changed lines.
   - Drop pre-existing issues unless made worse by this diff.
   - Treat subagent severity as advisory.
   - Normalize severity:
     - Must change: concrete correctness, security, data-loss, or breaking-behavior issue.
     - Should change: concrete maintainability, simplification, scope-creep, or risky-design issue.
     - Nit: tiny style, comment, naming, or readability issue.
   - Drop any finding whose impact cannot be stated concretely.
   Done when every surviving item has accurate filename, line/range, severity, and concrete impact.

4. Once all subagents have finished, report concise, actionable, negative findings only, grouped by normalized severity from most to least severe: Must change, Should change, Nit.

If no findings, say `No blocking review findings.`
Do not run CI or full test suites unless user asks.

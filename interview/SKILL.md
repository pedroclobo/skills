---
name: interview
description: Interview the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking.
---

Interview the user relentlessly about every aspect of this plan until we reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Ask the questions one at a time, waiting for feedback on each question before continuing.

Each question should be formatted like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Finding facts is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it. Don't ask the user for anything you could look up yourself.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed.
Do not act on it until the user confirms you have reached a shared understanding.

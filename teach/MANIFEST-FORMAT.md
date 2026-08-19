# Manifest Format

Two manifests hold all the structure of the teach workspaces. They are plain
scripts rather than JSON, because a page opened over `file://` cannot fetch a
JSON file. `teach.js` reads them and renders every list, sidebar and prev/next
bar from them.

Keeping them current is not optional. A stale manifest breaks navigation.

## `<course>/course.js`

One per course. It is the single source of truth for the course structure.

```js
window.COURSE = {
  title: "Understanding How LLMs Work",
  chapters: [
    {
      name: "The pipeline",
      lessons: [
        { n: "01", file: "0001-how-an-llm-works.html", title: "How an LLM works",
          summary: "The map from text to next token, end to end." },
        { n: "02", file: "0002-attention.html", title: "Attention",
          summary: "Query, key and value, the scaled dot product, and causal masking." }
      ]
    },
    {
      name: "Systems and performance",
      lessons: [
        { n: "03", file: "0003-kv-cache.html", title: "KV cache",
          summary: "Why generation reuses keys and values instead of recomputing them." }
      ]
    }
  ],
  reference: [
    { title: "Glossary", file: "reference/glossary.html" },
    { title: "Attention cheat sheet", file: "reference/attention.html" }
  ]
};
```

Rules:

- **`n` is the display number**, two digits, matching the file's `NNNN` prefix.
- **`file` is the file name only**, no directory. The lesson pages and the course
  page both resolve it relative to themselves.
- **`title` matches the lesson's `h1` exactly.** `summary` is one authored line,
  written for someone deciding whether to open it.
- **Lesson order is the order in the manifest**, flattened across chapters. That
  order is what prev/next follows, so it must run from 01 upward.
- **Chapters are optional.** A course with no natural grouping uses one chapter
  with `name` omitted, and the lists render flat.
- **Chapter names are authored, not scraped.** When `MISSION.md` has a `## Phases`
  section, its phases are the obvious starting point.
- **`reference` paths are relative to the course root**, and the array may be empty.
- **Archived lessons are left out.** Anything under `lessons/archive/` is invisible
  to the manifest.

## `~/teach/courses.js`

One for the whole workspace. Refresh it at the start of a session, and whenever a
course gains a lesson.

```js
window.COURSES = [
  {
    slug: "deep-learning",
    title: "Understanding How LLMs Work",
    why: "How a modern LLM turns a piece of text into a next-token prediction.",
    lessons: 8,
    latest: "08 · Serving metrics"
  },
  {
    slug: "tcl",
    title: "tcl",
    why: "The workspace exists, but nothing is in it yet.",
    idle: true,
    tag: "not started",
    note: "empty"
  }
];
```

Rules:

- **Order by how recently the course was worked on**, most recent first. That
  makes the top of the page the thing the user most likely wants.
- **`why` is one line**, compressed from `MISSION.md`'s `## Why`. Not the whole
  paragraph.
- **`latest` points at the newest lesson**, formatted `NN · Title`. Omit it for a
  course with no lessons.
- **`idle: true`** greys the entry out. Use it for a course with no `MISSION.md`
  or no lessons. Pair it with `tag` for the reason and `note` to replace the
  lesson count.
- **Every directory under `~/teach` appears**, including the unstarted ones. A
  course the user has forgotten about is one they cannot pick up.

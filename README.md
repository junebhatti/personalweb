# Personal site

Junaid Bhatti's personal website. Astro, statically generated, no client-side JavaScript.

## Running it

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:4321`. `npm run build` writes the static site to `dist/`.

## Adding content

Writing and notes are Markdown files. Drop a new file in the right directory and it appears on
its index page, sorted newest first, with its own page at `/writing/<filename>` or `/notes/<filename>`.

Writing — `src/content/writing/some-title.md`:

```markdown
---
title: Some title
date: 2026-04-03
---

First paragraph.

Second paragraph.
```

Notes have no title; the body is the entry:

```markdown
---
date: 2026-08-05
---

The note text.
```

Projects and videos are still hardcoded arrays at the top of `src/pages/projects.astro` and
`src/pages/videos.astro`. Coursework, favorites, and interests are written directly into their
own page files.

## Course rankings

Courses live in `src/data/coursework.ts` — one object each, holding the name,
the comment, whether it counts as important or loved, and a 0–1 score on every
dimension. Adding a course is appending to that list; nothing else to touch.

The dimensions and their weights are in `DIMENSIONS` at the top of the same
file. Applicability and surprise count half; the rest count full. The number in
front of a course is the weighted average on a 0–5 scale — straight 1s land on
exactly 5 whatever the weights sum to, so adding or dropping a dimension does
not shift what a 4.1 means.

Every dimension points the same way: a higher number is a better course. That
rules out difficulty and rigor, which a class can have plenty of without being
any better for it.

The page renders both orderings and a small inline script swaps between them,
so it stays static and ships no bundled JavaScript. Without JS it shows the
section view.

## Layout

```
src/
  content/writing/   long-form posts (title + date)
  content/notes/     short-form notes (date only)
  pages/             one file per route
  layouts/Base.astro shared html shell
  styles/global.css  the entire stylesheet
```

Design tokens — colors, type scale, spacing — live at the top of `global.css`. There is one
stylesheet on purpose.

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

Each course on `/coursework` is scored 0–1 across the dimensions defined in
`src/data/coursework.ts`, shown as a single 0–4 number. Editing the dimension
list there updates the sliders, the legend, and the score together — no other
file needs to change.

`src/data/coursework-scores.json` holds the seed values. Where the live values
come from depends on whether Supabase is configured:

| Setup | Ranking in the browser saves to | Visible to |
|---|---|---|
| No Supabase | the JSON file (dev server only) | you, after committing |
| Supabase | the database, immediately | everyone, at once |

### Connecting Supabase

1. Run `supabase/schema.sql` in the Supabase SQL editor.
2. Create your own user under Authentication → Users, then **turn off public
   sign-ups** (Authentication → Sign In / Providers). That switch is the entire
   security boundary — with it on, a stranger could register and rewrite your
   rankings.
3. Copy `.env.example` to `.env` and fill in the project URL and anon key from
   Project Settings → API. Add the same two variables in Vercel.

Both values are meant to be public; row-level security is what protects writes.
The `service_role` key must never go in either file.

### What visitors see

Nothing about editing. No sign-in, no account, no ranking controls — just the
scored list with the filters, the sort, and the legend. The page is public and
shareable as-is.

The editor appears only when you are signed in. To sign in, visit
`/coursework?edit`. The session persists and refreshes itself, so that is a
one-time step per device rather than something you do on each visit.

Reading uses a plain REST call, so the ~220 kB Supabase SDK is never sent to
visitors; it loads on demand only when you sign in or save. The coursework page
ships about 8 kB of JavaScript to everyone else.

The build bakes current values into the HTML, and the page re-checks the
database on load, so a stale deploy never shows stale numbers. If Supabase is
unreachable the seed JSON is used instead and the build still succeeds.

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

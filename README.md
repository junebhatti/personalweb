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

## Notes from Obsidian

Short notes live in the vault at
`~/Documents/Obsidian/Junaid/junaidb/Writing/Brain Dump`. That folder is the
source of truth for `/notes`:

```bash
npm run notes
```

**Everything in the folder gets published unless it is marked a draft.** A note
with `draft: true` in its frontmatter is held back; remove that line — or untick
the box in Obsidian's Properties panel — and it goes live on the next sync. That
is the confirmation step, so a piece you are still writing does not publish
itself mid-sentence.

To take a published note off the site, delete it or move it elsewhere in the
vault; the next run removes it. Empty files are skipped.

New notes get `draft: true` automatically if you set
`scripts/quick-thought.template.md` as a Templater folder template for Brain
Dump. Without that, **a note created with no frontmatter publishes on its first
save** — so either install the template, or draft in a different folder and move
the note in when it is done. Moving it in is the more foolproof of the two,
since a note outside the folder cannot publish whatever its frontmatter says.

**A note is dated when you publish it** — the moment you untick draft — not when
the file was created or last edited. The sync watches the folder, so it sees
that moment directly instead of inferring it from filesystem timestamps, which
a restore or a sync can rewrite. Once published the date is fixed, so editing a
note never shuffles it to the top; only a rewrite that keeps under half the old
text re-dates it.

To override, put `date: YYYY-MM-DD` in the note's frontmatter — that pins it
permanently. The slug comes from the filename.

On the way out the script fixes what would otherwise not survive the trip:
`%%comments%%`, `![[embeds]]` and callout headers are stripped, `[[wikilinks]]`
become their label, and single line breaks become hard breaks so a note reads
the way it looks in Obsidian rather than collapsing into one paragraph.

Notes it writes carry `source: obsidian`, and it only deletes files carrying
that marker — a note written by hand in `src/content/notes/` is never touched.

Use `--dry-run` to see what would change without writing anything:

```bash
npm run notes -- --dry-run
```

### Drafting from the phone

`/draft` is an unlisted page — nothing links to it and it asks search engines
away. Writing there posts to a Supabase table; `scripts/pull-drafts.mjs` drains
that table into Brain Dump next time the Mac runs the agent, and marks the rows
claimed so nothing arrives twice.

Two buttons. **Save as draft** lands the note in Obsidian with `draft: true`,
waiting to be read back. **Publish** lands it with `draft: false`, so it goes
to the site on that same run without review.

Either way the note reaches the site only once the Mac has run the agent —
the site is static, so nothing appears until a build. Publishing from the
phone skips the review step, not the wait.

Setup:

1. Run `supabase/drafts.sql` in the SQL editor of the Supabase project
   (`mmvxezaabgzvifadozth`), replacing `CHANGE-ME` with a long random string.
2. Copy `.env.example` to `.env` and fill it in. The same random string goes in
   `PUBLIC_DRAFT_KEY`; put the `PUBLIC_` values in Vercel too.
3. Add `/draft` to your phone's home screen.

The phone can only INSERT, and only with that key — it cannot read the table,
so finding the page exposes nothing you wrote. The `service_role` key, which
can read, lives only in `.env` on the Mac and must never become a `PUBLIC_`
variable.

### Vault backup

`scripts/backup-vault.sh` snapshots the whole Obsidian vault into a git repo at
`~/Library/Application Support/obsidian-vault-backup`, and the launchd agent
runs it before every sync. Recovering a deleted note:

```bash
cd ~/Library/Application\ Support/obsidian-vault-backup
git log --oneline                    # find a commit from before the loss
git show <commit>:"Writing/Brain Dump/note.md" > /path/in/vault/note.md
```

Snapshots are local and frequent; the push to the **private** GitHub repo
`junebhatti/obsidian_backup` is throttled to every 3 days, so ordinary note
writing doesn't spend a network round trip. Change `PUSH_EVERY_DAYS` in the
script to adjust.

The repo sits **outside iCloud on purpose**. A `.git` directory inside a synced
folder gets its internals rewritten mid-operation and corrupts.

The remote must stay private — the vault holds Career, School, and 90 files of
People & Networking.

This exists because iCloud is a mirror, not a backup: on 2026-08-06 the Brain
Dump folder was deleted and vanished everywhere at once. It turned up in
iCloud's own trash at `~/Library/Mobile Documents/.Trash`, which is separate
from the Finder Trash and purges after 30 days — worth checking first if
something disappears.

### Making it automatic

`scripts/publish-notes.sh` syncs, commits and pushes in one go, and
`scripts/com.junaid.personal-site-notes.plist` is a launchd agent that runs it
whenever the Brain Dump folder changes (plus hourly, in case a change lands
while the Mac is asleep). Install it with:

```bash
cp scripts/com.junaid.personal-site-notes.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.junaid.personal-site-notes.plist
```

**It needs Full Disk Access to work.** Both the vault and this repo live under
`~/Documents`, which macOS protects, and launchd agents get no access to it by
default — the agent will fire and immediately fail with "Operation not
permitted". Grant it under System Settings → Privacy & Security → Full Disk
Access by adding `/bin/bash`. That is a broad permission: it applies to every
shell script run on the machine, not just this one.

Logs land in `~/Library/Logs/personal-site-notes.log`. To stop it:

```bash
launchctl unload ~/Library/LaunchAgents/com.junaid.personal-site-notes.plist
```

The script only ever stages `src/content/notes`, so work in progress elsewhere
in the repo is never swept into an automatic commit. If the push fails it stops
and says so rather than trying to resolve anything itself.

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

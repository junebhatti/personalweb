# To do

Roughly in priority order.

## 1. Obsidian → notes

Publish short thoughts by writing them in Obsidian, without touching the repo
by hand. A single "quick thoughts" / brain-dump folder in the vault is the
source; everything else in the vault stays private.

- [ ] Pick the vault folder that feeds `/notes`
- [ ] Decide how it syncs — **open question**, see below
- [ ] Add `date` to each note (an Obsidian template can do this automatically)
- [ ] Add a `publish: true` flag so only flagged notes go public
- [ ] Handle Obsidian-only syntax before it reaches the site: `[[wikilinks]]`,
      `![[embeds]]`, `#tags`, and callouts do not render as Markdown and will
      show up as literal text
- [ ] Replace the four placeholder notes currently in `src/content/notes/`

**Open question — git or Supabase?** Both were discussed; they are different
trades, and the site currently has neither.

- *Git* (Obsidian Git plugin commits the folder into `src/content/notes/`):
  no infrastructure, no keys, no database. A note is live about a minute after
  it syncs. Notes are already Markdown with frontmatter, which is exactly what
  the site reads — nothing needs converting.
- *Supabase*: lets notes appear without a rebuild and could be written from
  anywhere, but reintroduces a database, keys, and a sign-in that was
  deliberately removed to keep the site a shareable static portfolio.

Git looks like the better fit unless posting from a phone matters.

## 2. Projects

`/projects` is still two placeholder entries in `src/pages/projects.astro`.

- [ ] Coding dashboard
- [ ] This website
- [ ] The YouTube video / channel as a project entry
- [ ] Anything else worth listing
- [ ] Decide what each links to — repo, live demo, or a write-up
- [ ] Consider whether projects should be Markdown-backed like writing, or stay
      a hardcoded list (fine while it is short)

## 3. Favorites

`/favorites` has real books; the other three sections still read
"Add a few here."

- [ ] Podcasts
- [ ] Movies & Shows
- [ ] Music
- [ ] Add any more books

## 4. Interests

Worth a rewrite. The current text came from the design handoff rather than from
you, so it reads like someone's guess at your interests — "proofs over
computation", "Los Angeles vs. New York, endlessly", and so on.

- [ ] Rewrite all three columns in your own words
- [ ] Check the column headings still fit (Numbers / Words / Everything else)

## 5. Headshot on the home page

- [ ] Add a photo of yourself somewhere on `/`
- [ ] Decide where it sits without breaking the two rules the home page keeps:
      it never scrolls at any viewport, and the five index links stay the first
      thing you see
- [ ] The site has no images at all so far, so this also sets the convention —
      size, whether it is cropped, and whether it appears anywhere else

## Also open

Not asked for, but outstanding.

- [ ] Deploy to Vercel — the repo is pushed but nothing is hosted yet
- [ ] Decide what happens to `junebhatti.github.io` once this replaces it
- [ ] More videos: `/videos` has the one entry
- [ ] Post bodies are real for all eight essays, but check formatting on the
      longer ones once they are live

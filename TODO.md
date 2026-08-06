# To do

Roughly in priority order.

## 1. Obsidian → notes

Pipeline is built — `npm run notes` copies flagged notes from
`Writing/Brain Dump` into the site. See the README. What is left:

- [ ] Decide which notes to publish and add `publish: true` to them
- [ ] Sort out the four already-published essays sitting in Brain Dump
      (be courageous / ramadan / judging religion / stop optimizing) — they are
      live under `/writing`, so publishing them as notes would duplicate them
- [ ] Delete the four placeholder notes in `src/content/notes/` once real ones exist
- [ ] Install the Templater template so new notes get frontmatter automatically
- [ ] Set up the launchd agent or cron job if the manual `npm run notes` gets old
- [ ] `is it more noble to question or to accept.md` is empty — write it or bin it

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

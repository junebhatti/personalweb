# To do

Roughly in priority order.

## 1. Obsidian → notes

Done — `Writing/Brain Dump` mirrors to `/notes` via `npm run notes`. Eleven
notes are live. Remaining:

- [ ] Set up the launchd agent or cron job so it runs without being asked
- [ ] Install the Templater template if you want `created` stamped automatically
- [ ] `is it more noble to question or to accept.md` is empty, so it is skipped —
      write it or bin it
- [ ] `identity vs environment.md` ends with a stray "I've" that publishes as its
      own line

## 2. Projects

Done — Personal Dashboard, PodNotes, and this website are in
`src/pages/projects.astro`. Remaining:

- [ ] Years are all "2026" from folder dates — correct any that are wrong
- [ ] Dashboard and PodNotes have nothing to link to; add repos or demos if
      they ever get public homes
- [ ] The YouTube channel as a project entry, if wanted

## 3. Favorites

Everything from the old site is in, in `src/pages/favorites.astro`. You said you
want to condense it — each entry is one object in the `sections` array, so
cutting is deleting lines.

- [ ] Trim it down to what you actually want to keep
- [ ] Decide whether Restaurants and "Blogs, videos, channels" stay — neither was
      in the design, and the latter has a single entry (Keith D)
- [ ] `The Motorcycle Diaries` and `Casablanca` carry no comment, unlike the rest

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

- [x] Deployed — live at junaidrbhatti.com (Vercel + Cloudflare DNS);
      the vercel.app URL redirects there
- [ ] Decide what happens to `junebhatti.github.io` now that this replaces it
- [ ] Optional: make www redirect to the bare domain (remove + re-add the www
      domain in Vercel, choosing "Redirect")
- [ ] Cloudflare auto-renew is on by default — confirm it stays on
- [ ] More videos: `/videos` has the one entry
- [ ] Post bodies are real for all eight essays, but check formatting on the
      longer ones once they are live

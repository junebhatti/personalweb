#!/usr/bin/env node
/**
 * Mirrors an Obsidian folder into src/content/notes.
 *
 * The folder is the source of truth: everything in it is published, and taking
 * a note out — deleting it, or moving it elsewhere in the vault — removes it
 * from the site on the next run. To keep a note in the folder but off the site,
 * put `publish: false` in its frontmatter.
 *
 *   node scripts/sync-notes.mjs            # write changes
 *   node scripts/sync-notes.mjs --dry-run  # report only
 */
import { readdir, readFile, writeFile, unlink, mkdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const VAULT =
  process.env.OBSIDIAN_NOTES_DIR ??
  '/Users/junaid/Documents/Obsidian/Junaid/junaidb/Writing/Brain Dump';

const OUT = fileURLToPath(new URL('../src/content/notes/', import.meta.url));

/** Marks a file as ours, so the sync never deletes a hand-written note. */
const MARKER = 'obsidian';

const dryRun = process.argv.includes('--dry-run');

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: raw };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim().replace(/^["']|["']$/g, '');
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    data[kv[1]] = value;
  }
  return { data, body: raw.slice(match[0].length) };
}

/** Obsidian-only syntax that would otherwise render as literal text. */
function toMarkdown(body) {
  return body
    .replace(/%%[\s\S]*?%%/g, '') // inline comments
    .replace(/!\[\[[^\]]*\]\]/g, '') // embeds — the asset isn't published
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2') // [[target|label]] -> label
    .replace(/\[\[([^\]]+)\]\]/g, '$1') // [[target]] -> target
    // Callout headers. The leading class is [ \t] rather than \s so it cannot
    // swallow the blank line above and weld two paragraphs together.
    .replace(/^[ \t]*>[ \t]*\[!\w+\][^\n]*\n/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    // Obsidian shows a single newline as a line break; Markdown folds it into
    // the paragraph. Make it an explicit hard break so a note reads on the site
    // the way it was written in the vault.
    .replace(/(\S)[ \t]*\n(?![\n\s]*$)(?=[^\n])/g, '$1  \n')
    .trim();
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['‘’]/g, '') // weren't -> werent, not weren-t
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}

function isoDate(value) {
  // A bare YYYY-MM-DD passes through untouched — new Date() would read it as
  // UTC midnight and formatting it locally would shift it back a day.
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  const d = new Date(value);
  if (Number.isNaN(d.valueOf())) return null;
  // Local day, not UTC — a note written at 11:27 PM belongs to that evening,
  // not to tomorrow.
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function collect() {
  let entries;
  try {
    entries = await readdir(VAULT);
  } catch {
    console.error(`Cannot read the vault folder:\n  ${VAULT}\n`);
    console.error('Set OBSIDIAN_NOTES_DIR if it lives somewhere else.');
    process.exit(1);
  }

  const published = [];
  const skipped = [];

  for (const entry of entries.filter((e) => e.endsWith('.md'))) {
    const path = join(VAULT, entry);
    const raw = await readFile(path, 'utf-8');
    const { data, body } = parseFrontmatter(raw);
    const name = basename(entry, '.md');

    // Everything publishes unless it opts out.
    if (data.publish === false || data.draft === true) {
      skipped.push(name);
      continue;
    }

    const text = toMarkdown(body);
    if (!text) {
      console.warn(`  ! "${name}" is empty — skipping`);
      continue;
    }

    // A note published from the phone carries the moment Publish was pressed
    // there. Anything else is dated by this run.
    const stamped = data.published ? new Date(data.published) : null;

    published.push({
      slug: data.slug || slugify(name),
      // `date` in the vault pins a note permanently; nothing else moves it.
      pinned: isoDate(data.date),
      at: stamped && !Number.isNaN(stamped.valueOf()) ? stamped : null,
      text,
      name,
    });
  }

  return { published, skipped };
}

async function existingGenerated() {
  await mkdir(OUT, { recursive: true });
  const files = (await readdir(OUT)).filter((f) => f.endsWith('.md'));
  const mine = new Map();
  for (const file of files) {
    const { data, body } = parseFrontmatter(await readFile(join(OUT, file), 'utf-8'));
    if (data.source === MARKER) {
      mine.set(basename(file, '.md'), {
        file,
        date: data.date,
        order: data.order !== undefined ? Number(data.order) : undefined,
        body: body.trim(),
      });
    }
  }
  return mine;
}

/**
 * How much two versions of a note have in common, 0 to 1, comparing bags of
 * words. Fixing a typo scores near 1; a rewrite that keeps the subject but
 * little else scores low.
 */
function similarity(a, b) {
  const words = (s) => s.toLowerCase().match(/[a-z0-9']+/g) ?? [];
  const A = words(a);
  const B = words(b);
  if (!A.length && !B.length) return 1;
  if (!A.length || !B.length) return 0;

  const counts = new Map();
  for (const w of A) counts.set(w, (counts.get(w) ?? 0) + 1);
  let common = 0;
  for (const w of B) {
    const n = counts.get(w) ?? 0;
    if (n > 0) {
      common++;
      counts.set(w, n - 1);
    }
  }
  return (2 * common) / (A.length + B.length);
}

/** Above this, two versions of a note are the same note however it was edited. */
const SAME_NOTE_ABOVE = 0.5;

/**
 * Pairs each note with the file it was generated from last time.
 *
 * Usually that is the file at the same slug. But the slug comes from the
 * filename, and in Obsidian giving a note a title *is* renaming the file — so
 * a note you have just titled arrives looking brand new, and would be dated
 * today. Matching the leftovers on their text finds it again.
 *
 * Text at least half the same is the same note, whatever it is now called.
 */
function pairWithPrevious(published, generated) {
  const previousFor = new Map();
  const orphans = new Map(generated);

  // Exact slug matches first, so a rename can never steal a file that a
  // still-present note is using.
  for (const note of published) {
    const exact = orphans.get(note.slug);
    if (exact) {
      previousFor.set(note.slug, { entry: exact });
      orphans.delete(note.slug);
    }
  }

  for (const note of published) {
    if (previousFor.has(note.slug)) continue;

    let bestSlug = null;
    let bestScore = 0;
    for (const [slug, entry] of orphans) {
      const score = similarity(entry.body, note.text);
      if (score > bestScore) {
        bestScore = score;
        bestSlug = slug;
      }
    }

    if (bestSlug !== null && bestScore >= SAME_NOTE_ABOVE) {
      previousFor.set(note.slug, { entry: orphans.get(bestSlug), renamedFrom: bestSlug });
      orphans.delete(bestSlug);
    }
  }

  return { previousFor, orphans };
}

/** The moment this run is publishing. */
const NOW = new Date();
const today = isoDate(NOW);

/**
 * A note is dated when it is published — the moment you untick draft — not
 * when the file was created or last touched. The sync watches the folder, so
 * it sees that moment directly rather than inferring it from the filesystem,
 * whose timestamps a restore or a sync can rewrite.
 *
 * Once published the date is fixed. Editing the note does not move it, nor
 * does titling it, nor does adding to it for a week — none of that is
 * publishing. Three things set a date: `date` in the vault frontmatter pins
 * it for good, `published` carries the moment it went out from the phone, and
 * ticking draft then unticking it publishes the note again from scratch.
 */
function resolveDate(note, previous) {
  if (note.pinned) return note.pinned;
  // Published from the phone — that moment is the publish, however long the
  // note then sat waiting for this machine to come online and collect it.
  if (note.at) return isoDate(note.at);
  // Already out. Editing it — a word, a title, ten more paragraphs — is not
  // publishing it again, so the date stands. To deliberately re-date a note,
  // tick draft and untick it: that takes it off the site and publishes it
  // afresh, which is the one thing that means "this is new now".
  if (previous?.date) return previous.date;
  return today;
}

const { published, skipped } = await collect();
const generated = await existingGenerated();

const { previousFor, orphans } = pairWithPrevious(published, generated);

let written = 0;
for (const note of published) {
  const match = previousFor.get(note.slug);
  const previous = match?.entry;
  const date = resolveDate(note, previous);

  // Within a day, notes order by when they were published. A note keeps its
  // order for as long as it stays published. A phone note orders by its own
  // stamp, so it lands at the hour it was actually written.
  const order = note.at ? note.at.valueOf() : previous?.order ?? NOW.valueOf();

  // The display time is fixed here, in this machine's timezone, because the
  // production build runs in UTC and would shift it.
  const time = new Date(order).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const front = `---\ndate: ${date}\norder: ${order}\ntime: ${time}\nsource: ${MARKER}\n---\n\n`;
  const target = join(OUT, `${note.slug}.md`);
  const next = front + note.text + '\n';

  let current = null;
  try {
    current = await readFile(target, 'utf-8');
  } catch {}

  if (current !== next) {
    if (!dryRun) await writeFile(target, next, 'utf-8');
    console.log(`  ${current === null ? '+' : '~'} ${note.slug}`);
    if (match?.renamedFrom) {
      console.log(`      renamed from "${match.renamedFrom}" — kept its ${date} date`);
    }
    written++;
  }

  // A renamed note is written under its new slug, so the file it used to live
  // in has to go. It was claimed above rather than left to the sweep below —
  // that is what kept its date — so nothing else will remove it, and the site
  // would carry the note twice, once under each name.
  const stale = match?.renamedFrom ? match.entry.file : null;
  if (stale && stale !== `${note.slug}.md`) {
    if (!dryRun) await unlink(join(OUT, stale));
    console.log(`      removed ${stale}`);
  }
}

// Anything we generated before and is no longer flagged gets pulled down.
// A note that was merely renamed is not in here — it was claimed above.
for (const [slug, entry] of orphans) {
  if (!dryRun) await unlink(join(OUT, entry.file));
  console.log(`  - ${slug} (no longer published)`);
}

for (const name of skipped) console.log(`  · "${name}" is a draft`);

console.log(
  `\n${published.length} published · ${skipped.length} held back · ` +
    `${written} changed · ${orphans.size} removed${dryRun ? '  [dry run]' : ''}`
);

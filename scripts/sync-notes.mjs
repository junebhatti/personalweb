#!/usr/bin/env node
/**
 * Copies flagged notes out of the Obsidian vault and into src/content/notes.
 *
 * Publishing is opt-in: a note ships only if its frontmatter says
 * `publish: true`. The Brain Dump folder is a drafting space — it holds essay
 * drafts, unfinished fragments, and pieces already published under /writing —
 * so syncing it wholesale would be wrong. Nothing leaves the vault by default.
 *
 *   node scripts/sync-notes.mjs            # write changes
 *   node scripts/sync-notes.mjs --dry-run  # report only
 */
import { readdir, readFile, writeFile, unlink, stat, mkdir } from 'node:fs/promises';
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
    .trim();
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function isoDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.valueOf()) ? null : d.toISOString().slice(0, 10);
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

    if (data.publish !== true) {
      skipped.push(name);
      continue;
    }

    const text = toMarkdown(body);
    if (!text) {
      console.warn(`  ! "${name}" is flagged but empty — skipping`);
      continue;
    }

    // Prefer an explicit date, then Obsidian's created field, then the file.
    const date =
      isoDate(data.date) ??
      isoDate(data.created) ??
      isoDate((await stat(path)).birthtime);

    published.push({ slug: data.slug || slugify(name), date, text, name });
  }

  return { published, skipped };
}

async function existingGenerated() {
  await mkdir(OUT, { recursive: true });
  const files = (await readdir(OUT)).filter((f) => f.endsWith('.md'));
  const mine = new Map();
  for (const file of files) {
    const { data } = parseFrontmatter(await readFile(join(OUT, file), 'utf-8'));
    if (data.source === MARKER) mine.set(basename(file, '.md'), file);
  }
  return mine;
}

const { published, skipped } = await collect();
const generated = await existingGenerated();

let written = 0;
for (const note of published) {
  const front = `---\ndate: ${note.date}\nsource: ${MARKER}\n---\n\n`;
  const target = join(OUT, `${note.slug}.md`);
  const next = front + note.text + '\n';

  let current = null;
  try {
    current = await readFile(target, 'utf-8');
  } catch {}

  if (current !== next) {
    if (!dryRun) await writeFile(target, next, 'utf-8');
    console.log(`  ${current === null ? '+' : '~'} ${note.slug}`);
    written++;
  }
  generated.delete(note.slug);
}

// Anything we generated before and is no longer flagged gets pulled down.
for (const [slug, file] of generated) {
  if (!dryRun) await unlink(join(OUT, file));
  console.log(`  - ${slug} (no longer published)`);
}

console.log(
  `\n${published.length} published · ${skipped.length} not flagged · ` +
    `${written} changed · ${generated.size} removed${dryRun ? '  [dry run]' : ''}`
);
if (!published.length) {
  console.log(`\nNothing is flagged yet. Add this to a note's frontmatter:\n`);
  console.log(`  ---\n  publish: true\n  ---\n`);
}

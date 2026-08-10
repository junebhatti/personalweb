#!/usr/bin/env node
/**
 * Pulls notes written on the phone into the Obsidian vault.
 *
 * The phone posts to a Supabase table; this drains it. Each note becomes a
 * markdown file in Brain Dump with `draft: true`, so nothing written on a
 * phone publishes itself — you read it back on the Mac, edit if you want, and
 * untick draft when it is ready. That also means the note is dated when you
 * publish it, which is the rule the rest of the pipeline follows.
 *
 * Needs SUPABASE_URL and SUPABASE_SERVICE_KEY in the environment. The service
 * key bypasses row-level security, which is why it lives only on this machine
 * and never in the website.
 *
 *   node scripts/pull-drafts.mjs            # write notes
 *   node scripts/pull-drafts.mjs --dry-run  # report only
 */
import { writeFile, readdir, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const VAULT =
  process.env.OBSIDIAN_NOTES_DIR ??
  '/Users/junaid/Documents/Obsidian/Junaid/junaidb/Writing/Brain Dump';

const URL_BASE = process.env.SUPABASE_URL ?? '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? '';
const dryRun = process.argv.includes('--dry-run');

if (!URL_BASE || !SERVICE_KEY) {
  // Silent when unconfigured: this runs from the same agent as the publish
  // step, and a missing key should not spam the log every hour.
  process.exit(0);
}

const headers = {
  apikey: SERVICE_KEY,
  authorization: `Bearer ${SERVICE_KEY}`,
  'content-type': 'application/json',
};

/** First few words of the note, which is all a filename needs to be. */
function titleFrom(body) {
  const firstLine = body.trim().split(/\r?\n/)[0] ?? '';
  const words = firstLine.split(/\s+/).slice(0, 8).join(' ');
  const clean = words
    .replace(/[\/\\:*?"<>|]/g, '') // illegal in filenames
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
  return clean || 'note';
}

async function uniquePath(title) {
  const existing = new Set(await readdir(VAULT).catch(() => []));
  let name = `${title}.md`;
  let n = 2;
  while (existing.has(name)) name = `${title} ${n++}.md`;
  return join(VAULT, name);
}

const response = await fetch(
  `${URL_BASE}/rest/v1/drafts?claimed_at=is.null&select=id,body,created_at&order=created_at.asc`,
  { headers }
);

if (!response.ok) {
  console.error(`  ! could not read drafts (${response.status})`);
  process.exit(1);
}

const drafts = await response.json();
if (!drafts.length) process.exit(0);

await mkdir(VAULT, { recursive: true });

const claimed = [];
for (const draft of drafts) {
  const title = titleFrom(draft.body);
  const path = await uniquePath(title);
  const created = new Date(draft.created_at);
  const pad = (n) => String(n).padStart(2, '0');
  const day = `${created.getFullYear()}-${pad(created.getMonth() + 1)}-${pad(created.getDate())}`;

  // draft: true so it lands quietly. `created` records when it was written on
  // the phone; the published date still comes from unticking draft.
  const file = `---\ncreated: ${day}\ndraft: true\nfrom: phone\n---\n\n${draft.body.trim()}\n`;

  if (!dryRun) await writeFile(path, file, 'utf-8');
  console.log(`  + ${path.split('/').pop().replace(/\.md$/, '')}`);
  claimed.push(draft.id);
}

// Only mark rows claimed once their files exist, so a crash mid-run leaves
// them to be pulled again rather than losing them.
if (!dryRun && claimed.length) {
  const mark = await fetch(`${URL_BASE}/rest/v1/drafts?id=in.(${claimed.join(',')})`, {
    method: 'PATCH',
    headers: { ...headers, prefer: 'return=minimal' },
    body: JSON.stringify({ claimed_at: new Date().toISOString() }),
  });
  if (!mark.ok) {
    console.error(`  ! wrote ${claimed.length} note(s) but could not mark them claimed`);
    console.error('    they will arrive again on the next run — delete the duplicates');
  }
}

console.log(
  `\n${claimed.length} note(s) pulled from phone${dryRun ? '  [dry run]' : ''}`
);

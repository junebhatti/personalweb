// Morning Brief issues. The Apps Script sender (github.com/junebhatti/morning-brief)
// commits each day's public copy to src/briefs/YYYY-MM-DD.html after emailing it,
// with the calendar and reaction links already taken out. A push redeploys the
// site, so /brief always shows the newest one.
//
// Each file is a complete email document: tables and inline styles, plus one
// <style> block (the phone layout) and a fonts link in its <head>. The pages
// keep those two and drop the rest of the head.

const files = import.meta.glob<string>('../briefs/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export type Brief = {
  date: string;
  /** "Morning Brief — Oct 21: Iran prolongs talks…" */
  title: string;
  /** The part after the colon: the day's hook. */
  hook: string;
  head: string;
  body: string;
};

export const briefs: Brief[] = Object.entries(files)
  .map(([file, html]) => {
    const date = file.match(/(\d{4}-\d{2}-\d{2})\.html$/)?.[1] ?? '';
    const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1].trim() || 'Morning Brief';
    const hook = title.includes(':') ? title.slice(title.indexOf(':') + 1).trim() : title;
    const head =
      (html.match(/<link [^>]*fonts\.googleapis\.com[^>]*>/)?.[0] ?? '') +
      (html.match(/<style>[\s\S]*?<\/style>/)?.[0] ?? '');
    const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] ?? '';
    return { date, title, hook, head, body };
  })
  .filter((b) => b.date && b.body)
  .sort((a, b) => b.date.localeCompare(a.date));

/** "2026-10-21" → "October 21, 2026" */
export function briefDate(date: string): string {
  return new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

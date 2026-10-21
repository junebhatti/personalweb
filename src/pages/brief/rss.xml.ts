import { briefs, briefDate } from '../../lib/briefs';

// Hand-written RSS 2.0 so the site doesn't need @astrojs/rss for one feed.
// Each item carries the whole issue, so readers can read it in their app.
const SITE = 'https://junaidrbhatti.com';

const cdata = (s: string) => `<![CDATA[${s.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;

export function GET() {
  const items = briefs
    .slice(0, 30)
    .map((b) => {
      const url = `${SITE}/brief/${b.date}`;
      return `<item>
  <title>${cdata(b.title)}</title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  <pubDate>${new Date(b.date + 'T12:00:00Z').toUTCString()}</pubDate>
  <description>${cdata(briefDate(b.date) + ': ' + b.hook)}</description>
  <content:encoded>${cdata(b.body)}</content:encoded>
</item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>Morning Brief</title>
  <link>${SITE}/brief</link>
  <description>Junaid Bhatti's daily brief: the world and why, markets, essays, and something to build.</description>
  <language>en-us</language>
${items}
</channel>
</rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}

import { defineConfig } from 'astro/config';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const SCORES_PATH = fileURLToPath(new URL('./src/data/coursework-scores.json', import.meta.url));

/**
 * Lets the coursework ranker save straight into coursework-scores.json while
 * the dev server is running, so a change made in the browser is a real edit to
 * a real file rather than something stranded in localStorage.
 *
 * `configureServer` only runs under `astro dev`; the production build is
 * untouched and stays fully static. On the deployed site the POST simply fails
 * and the page falls back to saving in the browser.
 */
function courseworkScoreWriter() {
  return {
    name: 'coursework-score-writer',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/coursework-scores', (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
          if (body.length > 1_000_000) req.destroy();
        });

        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
              throw new Error('expected an object of course scores');
            }
            for (const [id, scores] of Object.entries(parsed)) {
              if (!scores || typeof scores !== 'object') {
                throw new Error(`bad scores for ${id}`);
              }
              for (const [dim, value] of Object.entries(scores)) {
                if (typeof value !== 'number' || value < 0 || value > 1) {
                  throw new Error(`${id}.${dim} must be a number from 0 to 1`);
                }
              }
            }

            await writeFile(SCORES_PATH, JSON.stringify(parsed, null, 2) + '\n', 'utf-8');
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
          } catch (error) {
            res.statusCode = 400;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: String(error.message || error) }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  output: 'static',
  vite: {
    plugins: [courseworkScoreWriter()],
  },
});

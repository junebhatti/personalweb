import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    date: z.coerce.date(),
    /** Milliseconds since epoch — orders same-day notes by time written. */
    order: z.number().optional(),
    /** Clock time the note was written, pre-formatted at sync time. */
    time: z.string().optional(),
    /** Set by scripts/sync-notes.mjs so it knows which files it owns. */
    source: z.string().optional(),
  }),
});

export const collections = { writing, notes };

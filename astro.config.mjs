import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  output: 'static',

  // Math in markdown: $inline$ and $$display$$. remark-math finds it, KaTeX
  // renders it to HTML at build time — no client-side JavaScript, which is
  // why this suits a static site. Posts and notes share one pipeline, so
  // both get it.
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },

  // Pages are a few KB each, so prefetch any internal link as soon as it
  // scrolls into view — by the time it's clicked, the page is already in the
  // cache and navigation feels instant instead of waiting on the network.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});

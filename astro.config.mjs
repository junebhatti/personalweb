import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  // Pages are a few KB each, so prefetch any internal link as soon as it
  // scrolls into view — by the time it's clicked, the page is already in the
  // cache and navigation feels instant instead of waiting on the network.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});

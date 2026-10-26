// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Für eine eigene Domain später nur `site` anpassen und `base` auf '/' setzen.
export default defineConfig({
  site: 'https://backtothestars1995.github.io',
  base: '/kompass-thueringen',
  trailingSlash: 'always',
  integrations: [sitemap()],
});

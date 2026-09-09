// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.giannibastreghigeoloco.it',
  output: 'static',
  integrations: [sitemap()],
  vite: {
    optimizeDeps: {
      include: ['gsap', 'lenis'],
    },
  },
});

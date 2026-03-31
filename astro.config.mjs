// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx    from '@astrojs/mdx';
import react  from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/static';

export default defineConfig({
  site: 'https://siriuscol.com',

  // ── Vercel static output (SSG) ──────────────────────────
  // Genera HTML estático — sin funciones serverless.
  // Vercel lo sirve desde su Edge Network global.
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: false }, // usamos GA4 manual
  }),

  integrations: [
    mdx(),
    react(),
    // sitemap() — buggy with the current @astrojs/sitemap version.
    // Fix: upgrade Astro to v5+ or manually create public/sitemap.xml
  ],

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },

  image: {
    domains: ['siriuscol.com'],
  },

  compressHTML:  true,
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});

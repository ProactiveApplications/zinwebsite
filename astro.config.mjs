import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://zincontent.com',
  output: 'static', // SSG — fully static build, correct for Cloudflare Pages
  adapter: cloudflare({
    imageService: 'compile', // Run Sharp at build time for prerendered pages
  }),
  server: {
    host: '0.0.0.0',
    port: 4321,
  },
  image: {
    domains: ['xo8h-rjxb-rsw5.e2.xano.io'],
  }
});
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'static', // Astro v5 "Static" now supports Server-Side routes automatically
  adapter: cloudflare(),
  server: {
    host: '0.0.0.0',
    port: 4321,
  },
});
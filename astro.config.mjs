import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';  // ← Add this import

export default defineConfig({
  output: 'static',  // ← Keep static (or remove this line, static is default)
  adapter: cloudflare(),  // ← Add this!
  server: {
    host: '0.0.0.0',
    port: 4321,
  },
});
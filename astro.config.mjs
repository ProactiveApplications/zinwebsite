import { defineConfig } from 'astro/config';

export default defineConfig({
  server: {
    host: '0.0.0.0',  // Listen on all IPv4 interfaces
    port: 4321,
  },
});
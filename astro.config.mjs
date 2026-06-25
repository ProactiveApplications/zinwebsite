import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
  site: 'https://zincontent.com',
  output: 'static',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  server: {
    host: '0.0.0.0',
    port: 4321,
  },
  image: {
    domains: ['xo8h-rjxb-rsw5.e2.xano.io'],
  },
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
          test: (node) => {
            const href = node.properties?.href;
            if (typeof href !== 'string' || !href.startsWith('http')) return false;
            return !href.includes('zincontent.com');
          },
        },
      ],
    ],
  },
});
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders'; // Not available with legacy API
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ 
          pattern: ['**/*.{md,mdx}'], 
          base: 'src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    date: z.date(),
    //tags: z.array(z.string()).default([]),
    // type: z.enum(["post", "insight"]),
    // draft: z.boolean().default(false),
    // featured: z.boolean().default(false),
  }),
});

export const collections = {
  posts
}
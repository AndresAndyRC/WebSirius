// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title:         z.string(),
    excerpt:       z.string(),
    description:   z.string(),   // for SEO meta
    category:      z.string(),
    publishedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser formato YYYY-MM-DD'),
    modifiedDate:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser formato YYYY-MM-DD').optional(),
    readingTime:   z.string(),
    heroImage:     z.string().optional(),
    heroImageAlt:  z.string().optional(),
    canonical:     z.string().optional(),
    author: z.object({
      name: z.string(),
      role: z.string().optional(),
    }),
    toc: z.array(
      z.object({
        id:    z.string(),
        label: z.string(),
        level: z.number().int().min(2).max(6).optional(),
      }),
    ).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};

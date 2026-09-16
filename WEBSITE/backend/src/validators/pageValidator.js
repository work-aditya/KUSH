const { z } = require('zod');

const createPageSchema = z.object({
  body: z.object({
    slug: z
      .string()
      .min(2, 'Slug must be at least 2 characters')
      .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and dashes')
      .trim(),
    title: z.string().min(2, 'Title is required').trim(),
    content: z.string().min(10, 'Content must be at least 10 characters'),
    published: z.boolean().default(true),
  }),
});

const updatePageSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Page ID required'),
  }),
  body: z.object({
    slug: z
      .string()
      .min(2)
      .regex(/^[a-z0-9-]+$/)
      .trim()
      .optional(),
    title: z.string().min(2).trim().optional(),
    content: z.string().min(10).optional(),
    published: z.boolean().optional(),
  }),
});

module.exports = {
  createPageSchema,
  updatePageSchema,
};

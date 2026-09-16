const { z } = require('zod');

const createPricingSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title is required').trim(),
    duration: z.string().min(1, 'Duration is required').trim(),
    sessions: z.number().int().positive('Sessions must be a positive integer'),
    planType: z.enum(['single', 'couple'], {
      errorMap: () => ({ message: 'Plan type must be single or couple' }),
    }),
    price: z.number().nonnegative('Price cannot be negative'),
    currency: z.string().default('INR'),
    description: z.string().min(5, 'Description is required').trim(),
    features: z.array(z.string()).default([]),
    active: z.boolean().default(true),
    sortOrder: z.number().int().default(0),
  }),
});

const updatePricingSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Pricing ID required'),
  }),
  body: z.object({
    title: z.string().min(2).trim().optional(),
    duration: z.string().min(1).trim().optional(),
    sessions: z.number().int().positive().optional(),
    planType: z.enum(['single', 'couple']).optional(),
    price: z.number().nonnegative().optional(),
    currency: z.string().optional(),
    description: z.string().min(5).trim().optional(),
    features: z.array(z.string()).optional(),
    active: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }),
});

module.exports = {
  createPricingSchema,
  updatePricingSchema,
};

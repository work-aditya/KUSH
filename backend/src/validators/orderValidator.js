const { z } = require('zod');

const createOrderSchema = z.object({
  body: z.object({
    pricingId: z.string().min(1, 'Valid pricing plan ID is required'),
    couponCode: z.string().optional(),
  }),
});

module.exports = {
  createOrderSchema,
};

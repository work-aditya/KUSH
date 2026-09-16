const { z } = require('zod');

const contactSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    phone: z.string().max(20).optional().default(''),
    message: z.string().min(5, 'Message must be at least 5 characters').max(2000).trim(),
  }),
});

module.exports = {
  contactSchema,
};

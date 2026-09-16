const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Email or username is required').trim(),
    password: z.string().min(1, 'Password is required'),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};

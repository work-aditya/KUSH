const dotenv = require('dotenv');
const path = require('path');
const { z } = require('zod');

// Load .env from backend root or workspace root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  FRONTEND_URL: z.string().default('http://localhost:5173'),

  // Database
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  // Auth
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
  JWT_EXPIRES_IN: z.string().default('1d'),

  // Admin Bootstrap
  ADMIN_USERNAME: z.string().min(3).default('admin'),
  ADMIN_PASSWORD: z.string().min(4).default('admin123'),

  // WhatsApp
  WHATSAPP_CONTACT_URL: z.string().default('https://wa.me/917042858524'),

  // SMTP Email (Optional in dev, required in prod if emails are sent)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional().transform((val) => val ? parseInt(val, 10) : 587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().default('noreply@coachkush.com'),
  SMTP_FROM_NAME: z.string().default('CoachKush'),

  // PhonePe Gateway (Standard Checkout V2 & Legacy)
  PHONEPE_ENVIRONMENT: z.enum(['SANDBOX', 'PRODUCTION']).default('SANDBOX'),
  PHONEPE_CLIENT_ID: z.string().optional(),
  PHONEPE_CLIENT_SECRET: z.string().optional(),
  PHONEPE_CLIENT_VERSION: z.string().default('1'),
  PHONEPE_MERCHANT_ID: z.string().default('PGTESTPAYUAT'),
  PHONEPE_SALT_KEY: z.string().default('099eb0cd-02cf-4e2a-8aca-3e6c6aff0399'),
  PHONEPE_SALT_INDEX: z.string().default('1'),
  PHONEPE_CALLBACK_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment Variable Validation Errors:', JSON.stringify(parsed.error.format(), null, 2));
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const env = parsed.success ? parsed.data : {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/coachkush',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_must_be_overridden_in_prod_at_least_32_chars',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
  WHATSAPP_CONTACT_URL: process.env.WHATSAPP_CONTACT_URL || 'https://wa.me/919999999999',
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || 'noreply@coachkush.com',
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'CoachKush',
  PHONEPE_ENVIRONMENT: process.env.PHONEPE_ENVIRONMENT || 'SANDBOX',
  PHONEPE_CLIENT_ID: process.env.PHONEPE_CLIENT_ID,
  PHONEPE_CLIENT_SECRET: process.env.PHONEPE_CLIENT_SECRET,
  PHONEPE_CLIENT_VERSION: process.env.PHONEPE_CLIENT_VERSION || '1',
  PHONEPE_MERCHANT_ID: process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT',
  PHONEPE_SALT_KEY: process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399',
  PHONEPE_SALT_INDEX: process.env.PHONEPE_SALT_INDEX || '1',
  PHONEPE_CALLBACK_URL: process.env.PHONEPE_CALLBACK_URL || 'http://localhost:5000/api/payments/webhook',
};

module.exports = env;

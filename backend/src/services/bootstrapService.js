const User = require('../models/User');
const Pricing = require('../models/Pricing');
const Page = require('../models/Page');
const Coupon = require('../models/Coupon');
const { hashPassword } = require('../utils/hash');
const env = require('../config/env');
const logger = require('../config/logger');

const INITIAL_PLANS = [
  {
    title: 'Session 12 - Single',
    duration: '1 Month',
    sessions: 12,
    planType: 'single',
    price: 8999,
    currency: 'INR',
    active: true,
    sortOrder: 1,
    description: '12 high-intensity 1-on-1 virtual personal training sessions via Google Meet or Zoom.',
    features: [
      '12 Live 1-on-1 Video Sessions',
      'Personalized Workout Program',
      'Nutrition & Calorie Guidance',
      'Weekly Form Review & Adjustments',
      'Direct WhatsApp Support with Kush',
    ],
  },
  {
    title: 'Session 12 - Couple',
    duration: '1 Month',
    sessions: 12,
    planType: 'couple',
    price: 14999,
    currency: 'INR',
    active: true,
    sortOrder: 2,
    description: '12 live interactive partner coaching sessions for couples or workout partners.',
    features: [
      '12 Joint Video Sessions',
      'Custom Programs for Both Individuals',
      'Dual Nutrition & Habit Tracking',
      'Partner Motivation & Accountability',
      'Dedicated WhatsApp Group with Kush',
    ],
  },
  {
    title: 'Session 24 - Single',
    duration: '2 Months',
    sessions: 24,
    planType: 'single',
    price: 14999,
    currency: 'INR',
    active: true,
    sortOrder: 3,
    description: '24 comprehensive 1-on-1 coaching sessions spanning 2 full months of transformation.',
    features: [
      '24 Live 1-on-1 Video Sessions',
      'Complete Periodized Transformation Plan',
      'Macro & Meal Plan Optimization',
      'Bi-weekly Body Composition Check-ins',
      'Priority Schedule Slots & 24/7 WhatsApp',
    ],
  },
  {
    title: 'Session 24 - Couple',
    duration: '2 Months',
    sessions: 24,
    planType: 'couple',
    price: 24999,
    currency: 'INR',
    active: true,
    sortOrder: 4,
    description: '24 couple/partner video sessions over 2 months for double the accountability and results.',
    features: [
      '24 Joint Video Coaching Sessions',
      'Dual Transformation Periodization',
      'Sync\'d Nutrition Strategy',
      'Shared Milestone Tracking & Form Audits',
      'VIP WhatsApp Support with Kush',
    ],
  },
];

/**
 * Ensures initial admin account exists
 */
const bootstrapAdmin = async () => {
  try {
    const adminEmail = env.ADMIN_USERNAME.includes('@')
      ? env.ADMIN_USERNAME.toLowerCase()
      : `${env.ADMIN_USERNAME.toLowerCase()}@coachkush.internal`;

    let existingAdmin = await User.findOne({
      $or: [{ role: 'admin' }, { email: adminEmail }],
    });

    const passwordHash = await hashPassword(env.ADMIN_PASSWORD);

    if (!existingAdmin) {
      await User.create({
        name: 'Coach Kush (Admin)',
        email: adminEmail,
        phone: '+919999999999',
        passwordHash,
        role: 'admin',
        active: true,
      });
      logger.info('Admin user bootstrapped successfully', { email: adminEmail });
    } else {
      // Keep credentials and role synchronized with .env
      existingAdmin.passwordHash = passwordHash;
      existingAdmin.role = 'admin';
      existingAdmin.active = true;
      if (!existingAdmin.email) {
        existingAdmin.email = adminEmail;
      }
      await existingAdmin.save();
      logger.info('Admin user synchronized with environment settings', { email: existingAdmin.email });
    }
  } catch (error) {
    logger.error('Error bootstrapping admin account', { error: error.message });
  }
};

/**
 * Seeds default pricing plans if empty
 */
const seedPricing = async () => {
  try {
    const count = await Pricing.countDocuments();
    if (count === 0) {
      await Pricing.insertMany(INITIAL_PLANS);
      logger.info(`Seeded ${INITIAL_PLANS.length} default pricing plans`);
    }
  } catch (error) {
    logger.error('Error seeding pricing plans', { error: error.message });
  }
};

const seedDefaultPages = async () => {
  try {
    const defaultPrivacy = {
      slug: 'privacy',
      title: 'Privacy Policy',
      content: `Coach Kush Fitness ("we", "our", or "us") is dedicated to safeguarding your personal information, physical progress details, and training data. This Privacy Policy details how we collect, use, and protect your information across our live virtual coaching services.

1. INFORMATION WE COLLECT
- Account Data: Name, email address, phone number (for WhatsApp coaching support), and account credentials.
- Coaching & Fitness Profile: Age, gender, fitness goals, exercise history, injuries, and dietary preferences shared during onboarding.
- Payment Information: All payments are processed securely through Razorpay. We do not store credit card, debit card, or UPI PIN numbers on our servers. Razorpay provides us with verified transaction identifiers and payment status confirmations.
- Communication Logs: WhatsApp interactions, Zoom / Google Meet training attendance, and progress assessments with Kush.

2. HOW WE USE YOUR INFORMATION
- Delivering customized 1-on-1 and couple video coaching sessions.
- Generating tax invoices and automated email confirmations for memberships.
- Tailoring progressive workout routines, caloric targets, and recovery schedules.
- Direct trainer-to-client accountability checks and milestone follow-ups via WhatsApp.

3. DATA RETENTION & SECURITY
We implement industry-standard encryption, tokenized sessions, and secure HTTPS connections to safeguard your data. Your workout routines and personal details are strictly confidential between you and Coach Kush.

4. THIRD-PARTY SERVICES
- Razorpay Payment Gateway: For end-to-end encrypted payment processing.
- Google Meet / Zoom: For live interactive video training sessions.
- Nodemailer / SMTP: For transactional invoice delivery and account notifications.

5. YOUR RIGHTS & CONTROL
You may update your profile information, request an export of your training invoices, or request account deletion at any time by reaching out directly to coach Kush or emailing support.

6. CONTACT US
If you have any questions regarding this Privacy Policy or your data, please message Kush directly on WhatsApp or through our Contact Form.`,
      published: true,
    };

    const defaultTerms = {
      slug: 'terms',
      title: 'Terms of Coaching',
      content: `Welcome to Coach Kush Virtual Fitness Coaching. By enrolling in any 1-on-1 or couple coaching membership, you agree to the following terms:

1. VIRTUAL SESSIONS
- Sessions are conducted live via Google Meet or Zoom.
- Trainees are requested to join on time with adequate space and device camera positioned so Kush can observe exercise form.

2. RESCHEDULING & CANCELLATIONS
- We value your time and Coach Kush's scheduling commitments. Rescheduling requires a minimum of 24 hours advance notice via WhatsApp.
- Sessions canceled with less than 24 hours notice may be forfeited at the coach's discretion.

3. PHYSICAL READINESS
- You certify that you are in good physical health and have received medical clearance if necessary before beginning any high-intensity exercise program.

4. PAYMENTS & REFUNDS
- Memberships are billed upfront via Razorpay.
- Because custom programs and dedicated schedule slots are locked immediately upon enrollment, membership fees are non-refundable once the training program commences.`,
      published: true,
    };

    const privacyExists = await Page.findOne({ slug: 'privacy' });
    if (!privacyExists) {
      await Page.create(defaultPrivacy);
      logger.info('Default Privacy Policy seeded successfully');
    }

    const termsExists = await Page.findOne({ slug: 'terms' });
    if (!termsExists) {
      await Page.create(defaultTerms);
      logger.info('Default Terms of Coaching seeded successfully');
    }
  } catch (error) {
    logger.error('Error seeding default CMS pages', { error: error.message });
  }
};

const seedDefaultCoupons = async () => {
  try {
    const count = await Coupon.countDocuments();
    if (count === 0) {
      await Coupon.create({
        code: 'KUSH10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 5000,
        maxDiscount: 2000,
        description: '10% Welcome Discount on all memberships above ₹5,000',
        active: true,
      });
      logger.info('Seeded default welcome coupon KUSH10');
    }
  } catch (error) {
    logger.error('Error seeding default coupon', { error: error.message });
  }
};

const runBootstrap = async () => {
  await bootstrapAdmin();
  await seedPricing();
  await seedDefaultPages();
  await seedDefaultCoupons();
};

module.exports = {
  bootstrapAdmin,
  seedPricing,
  seedDefaultPages,
  seedDefaultCoupons,
  runBootstrap,
  INITIAL_PLANS,
};

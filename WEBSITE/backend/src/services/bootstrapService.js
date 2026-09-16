const User = require('../models/User');
const Pricing = require('../models/Pricing');
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

const runBootstrap = async () => {
  await bootstrapAdmin();
  await seedPricing();
};

module.exports = {
  bootstrapAdmin,
  seedPricing,
  runBootstrap,
  INITIAL_PLANS,
};

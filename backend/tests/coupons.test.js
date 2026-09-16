const request = require('supertest');
const app = require('../src/app');
const { setupTestDB } = require('./setup');
const Coupon = require('../src/models/Coupon');
const Pricing = require('../src/models/Pricing');
const User = require('../src/models/User');
const Order = require('../src/models/Order');
const { generateToken } = require('../src/utils/jwt');

setupTestDB();

describe('Coupon Management & Checkout Integration', () => {
  let adminUser;
  let adminToken;
  let regularUser;
  let userToken;
  let pricingPlan;

  beforeEach(async () => {
    adminUser = await User.create({
      name: 'Admin Kush',
      email: 'admin@coachkush.test',
      phone: '+919999999999',
      passwordHash: 'dummy',
      role: 'admin',
      active: true,
    });
    adminToken = generateToken({ userId: adminUser._id, email: adminUser.email, role: 'admin' });

    regularUser = await User.create({
      name: 'Trainee Alex',
      email: 'alex@coachkush.test',
      phone: '+919876543210',
      passwordHash: 'dummy',
      role: 'user',
      active: true,
    });
    userToken = generateToken({ userId: regularUser._id, email: regularUser.email, role: 'user' });

    pricingPlan = await Pricing.create({
      title: 'Session 12 - Single',
      duration: '1 Month',
      sessions: 12,
      planType: 'single',
      price: 10000,
      currency: 'INR',
      description: 'Test plan for coupon tests',
      active: true,
    });
  });

  it('should allow admin to create a new coupon and list it', async () => {
    const res = await request(app)
      .post('/api/admin/coupons')
      .set('Cookie', `coachkush_session=${adminToken}`)
      .send({
        code: 'TEST20',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 5000,
        maxDiscount: 3000,
        description: '20% off test coupon',
        active: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('TEST20');
    expect(res.body.data.discountValue).toBe(20);

    const listRes = await request(app)
      .get('/api/admin/coupons')
      .set('Cookie', `coachkush_session=${adminToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
    expect(listRes.body.data[0].code).toBe('TEST20');
  });

  it('should allow admin to delete a coupon', async () => {
    const coupon = await Coupon.create({
      code: 'TO_DELETE',
      discountType: 'flat',
      discountValue: 500,
      active: true,
    });

    const delRes = await request(app)
      .delete(`/api/admin/coupons/${coupon._id}`)
      .set('Cookie', `coachkush_session=${adminToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    const check = await Coupon.findById(coupon._id);
    expect(check).toBeNull();
  });

  it('should validate an active coupon and return computed discount', async () => {
    await Coupon.create({
      code: 'SAVE15',
      discountType: 'percentage',
      discountValue: 15,
      active: true,
    });

    const res = await request(app)
      .post('/api/coupons/validate')
      .send({
        code: 'save15', // test case insensitivity
        pricingId: pricingPlan._id.toString(),
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('SAVE15');
    expect(res.body.data.discountAmount).toBe(1500); // 15% of 10000 = 1500
    expect(res.body.data.finalAmount).toBe(8500);
  });

  it('should reject coupon if minimum order amount is not met', async () => {
    await Coupon.create({
      code: 'BIGSPENDER',
      discountType: 'flat',
      discountValue: 2000,
      minOrderAmount: 20000, // higher than plan price 10000
      active: true,
    });

    const res = await request(app)
      .post('/api/coupons/validate')
      .send({
        code: 'BIGSPENDER',
        pricingId: pricingPlan._id.toString(),
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('Minimum order amount');
  });

  it('should create order applying coupon discount authoritatively on the backend', async () => {
    await Coupon.create({
      code: 'FLAT1000',
      discountType: 'flat',
      discountValue: 1000,
      active: true,
    });

    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', `coachkush_session=${userToken}`)
      .send({
        pricingId: pricingPlan._id.toString(),
        couponCode: 'FLAT1000',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(9000); // 10000 - 1000
    expect(res.body.data.originalAmount).toBe(10000);
    expect(res.body.data.discountAmount).toBe(1000);
    expect(res.body.data.couponCode).toBe('FLAT1000');
    expect(res.body.data.razorpayOrderId).toBeDefined();

    const orderInDb = await Order.findById(res.body.data.orderId);
    expect(orderInDb.amount).toBe(9000);
    expect(orderInDb.provider).toBe('Razorpay');
  });
});

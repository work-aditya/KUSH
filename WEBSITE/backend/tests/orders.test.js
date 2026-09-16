const request = require('supertest');
const app = require('../src/app');
const { setupTestDB } = require('./setup');
const Pricing = require('../src/models/Pricing');
const User = require('../src/models/User');
const Order = require('../src/models/Order');
const { generateToken } = require('../src/utils/jwt');

setupTestDB();

describe('Orders & Server-side Pricing Validation', () => {
  let user;
  let userToken;
  let otherUser;
  let otherUserToken;
  let pricingPlan;

  beforeEach(async () => {
    user = await User.create({
      name: 'Test Buyer',
      email: 'buyer@example.com',
      phone: '9876543210',
      passwordHash: 'dummy',
      role: 'user',
      active: true,
    });
    userToken = generateToken({ userId: user._id, email: user.email, role: 'user' });

    otherUser = await User.create({
      name: 'Other Trainee',
      email: 'other@example.com',
      phone: '9111111111',
      passwordHash: 'dummy',
      role: 'user',
      active: true,
    });
    otherUserToken = generateToken({ userId: otherUser._id, email: otherUser.email, role: 'user' });

    pricingPlan = await Pricing.create({
      title: 'Session 12 - Single',
      duration: '1 Month',
      sessions: 12,
      planType: 'single',
      price: 8999,
      currency: 'INR',
      description: 'Official test plan',
      active: true,
    });
  });

  it('should create order calculating amount strictly from database pricing, ignoring any client price', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', `coachkush_session=${userToken}`)
      .send({
        pricingId: pricingPlan._id.toString(),
        amount: 1, // Malicious client attempt to manipulate price
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // Price MUST be 8999 from the DB, not 1!
    expect(res.body.data.amount).toBe(8999);
    expect(res.body.data.merchantTransactionId).toBeDefined();

    const savedOrder = await Order.findById(res.body.data.orderId);
    expect(savedOrder.amount).toBe(8999);
  });

  it('should enforce IDOR protection preventing access to another user\'s order', async () => {
    const order = await Order.create({
      userId: user._id,
      pricingId: pricingPlan._id,
      amount: 8999,
      status: 'pending',
      merchantTransactionId: 'CK_TEST_ORDER_123',
    });

    // Request made by otherUserToken
    const res = await request(app)
      .get(`/api/orders/${order._id}`)
      .set('Cookie', `coachkush_session=${otherUserToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

const request = require('supertest');
const app = require('../src/app');
const { setupTestDB } = require('./setup');
const Pricing = require('../src/models/Pricing');
const User = require('../src/models/User');
const { generateToken } = require('../src/utils/jwt');

setupTestDB();

describe('Pricing & Admin Authorization Tests', () => {
  let adminToken;
  let userToken;

  beforeEach(async () => {
    // Create an Admin user
    const admin = await User.create({
      name: 'Admin Kush',
      email: 'admin@coachkush.internal',
      phone: '9999999999',
      passwordHash: 'dummy_hash',
      role: 'admin',
      active: true,
    });
    adminToken = generateToken({ userId: admin._id, email: admin.email, role: 'admin' });

    // Create a regular User
    const user = await User.create({
      name: 'Regular Trainee',
      email: 'user@example.com',
      phone: '8888888888',
      passwordHash: 'dummy_hash',
      role: 'user',
      active: true,
    });
    userToken = generateToken({ userId: user._id, email: user.email, role: 'user' });

    // Seed one pricing plan
    await Pricing.create({
      title: 'Session 12 - Single',
      duration: '1 Month',
      sessions: 12,
      planType: 'single',
      price: 8999,
      currency: 'INR',
      description: '12 1-on-1 virtual sessions',
      features: ['12 Live Sessions', 'Form Review'],
      active: true,
      sortOrder: 1,
    });
  });

  it('should fetch public active pricing plans without auth', async () => {
    const res = await request(app).get('/api/pricing');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Session 12 - Single');
  });

  it('should allow admin to create a new pricing plan', async () => {
    const res = await request(app)
      .post('/api/admin/pricing')
      .set('Cookie', `coachkush_session=${adminToken}`)
      .send({
        title: 'Session 24 - Couple',
        duration: '2 Months',
        sessions: 24,
        planType: 'couple',
        price: 24999,
        currency: 'INR',
        description: '24 joint partner sessions',
        features: ['24 Joint Sessions', 'Dual Plans'],
        active: true,
        sortOrder: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Session 24 - Couple');
  });

  it('should reject normal user from admin pricing endpoint (403)', async () => {
    const res = await request(app)
      .post('/api/admin/pricing')
      .set('Cookie', `coachkush_session=${userToken}`)
      .send({
        title: 'Hacked Plan',
        duration: '1 Month',
        sessions: 10,
        planType: 'single',
        price: 1,
        description: 'Should fail',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should reject unauthenticated request from admin endpoints (401)', async () => {
    const res = await request(app).post('/api/admin/pricing').send({});
    expect(res.status).toBe(401);
  });
});

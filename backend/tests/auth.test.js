const request = require('supertest');
const app = require('../src/app');
const { setupTestDB } = require('./setup');
const User = require('../src/models/User');

setupTestDB();

describe('Auth API Integration Tests', () => {
  const testUser = {
    name: 'Trainee Alex',
    email: 'alex@example.com',
    phone: '9876543210',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  it('should register a new user and set HTTP-only cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('alex@example.com');
    expect(res.body.data.user.role).toBe('user');
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('coachkush_session');
  });

  it('should prevent registration with existing email', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_EXISTS');
  });

  it('should login an existing user with valid password', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex@example.com',
        password: 'WrongPassword999!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return profile on /api/auth/me when authenticated via cookie', async () => {
    const regRes = await request(app).post('/api/auth/register').send(testUser);
    const cookie = regRes.headers['set-cookie'];

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('alex@example.com');
  });

  it('should reject /api/auth/me without authentication cookie', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

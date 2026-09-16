const request = require('supertest');
const app = require('../src/app');
const { setupTestDB } = require('./setup');
const phonepeService = require('../src/services/phonepeService');

setupTestDB();

describe('Security & Payment Checksum Verification', () => {
  it('should return health check ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.checks.api).toBe('ok');
  });

  it('should accurately compute and verify PhonePe webhook signatures', () => {
    const mockPayload = Buffer.from(JSON.stringify({ code: 'PAYMENT_SUCCESS', data: { amount: 899900 } })).toString('base64');
    const validSignature = phonepeService.generateChecksum(mockPayload);

    const isVerified = phonepeService.verifyWebhookSignature(mockPayload, validSignature);
    expect(isVerified).toBe(true);

    const isFakeVerified = phonepeService.verifyWebhookSignature(mockPayload, 'invalid_signature_12345###1');
    expect(isFakeVerified).toBe(false);
  });

  it('should accept valid contact inquiries', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        name: 'Jordan',
        email: 'jordan@example.com',
        phone: '9876543210',
        message: 'Interested in the couple transformation package!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

const request = require('supertest');
const app = require('../src/app');
const { setupTestDB } = require('./setup');
const razorpayService = require('../src/services/razorpayService');

setupTestDB();

describe('Security & Payment Signature Verification', () => {
  it('should return health check ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.checks.api).toBe('ok');
  });

  it('should accurately compute and verify Razorpay payment HMAC-SHA256 signatures', () => {
    const orderId = 'order_test_987654321';
    const paymentId = 'pay_test_123456789';
    const validSignature = razorpayService.generateTestSignature(orderId, paymentId);

    const isVerified = razorpayService.verifyPaymentSignature({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
    });
    expect(isVerified).toBe(true);

    const isFakeVerified = razorpayService.verifyPaymentSignature({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: 'tampered_signature_hex_value_1234567890abcdef',
    });
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

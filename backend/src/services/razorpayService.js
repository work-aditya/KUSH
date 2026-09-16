const crypto = require('crypto');
const Razorpay = require('razorpay');
const env = require('../config/env');
const logger = require('../config/logger');

class RazorpayService {
  constructor() {
    this.keyId = env.RAZORPAY_KEY_ID;
    this.keySecret = env.RAZORPAY_KEY_SECRET;
    this.webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_KEY_SECRET;

    this.isConfigured = Boolean(
      this.keyId &&
      this.keySecret &&
      this.keyId !== 'rzp_test_placeholder' &&
      this.keySecret !== 'secret_placeholder'
    );

    if (this.isConfigured) {
      this.client = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret,
      });
      logger.info('Razorpay client initialized successfully with API credentials');
    } else {
      logger.warn(
        'Razorpay credentials are placeholder/unconfigured. Service running in development test fallback mode.'
      );
    }
  }

  /**
   * Create an authoritative order with Razorpay in paise
   * @param {Object} params
   * @param {number} params.amountInRupees - Order total in INR
   * @param {string} params.receipt - Merchant transaction reference
   * @param {Object} params.notes - Metadata dictionary
   */
  async createOrder({ amountInRupees, receipt, notes = {} }) {
    const amountInPaise = Math.round(amountInRupees * 100);

    logger.info('Creating Razorpay order', {
      amountInRupees,
      amountInPaise,
      receipt,
      isConfigured: this.isConfigured,
    });

    if (!this.isConfigured) {
      // Development / sandbox test fallback
      const simulatedOrderId = `order_sim_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      logger.warn('Returning simulated Razorpay order ID for dev/test environment', {
        simulatedOrderId,
      });
      return {
        id: simulatedOrderId,
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        status: 'created',
        isSimulated: true,
      };
    }

    try {
      const order = await this.client.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receipt.substring(0, 40), // Razorpay receipt max 40 chars
        notes,
      });

      return order;
    } catch (error) {
      logger.error('Razorpay orders.create failed', {
        error: error.message,
        details: error.error || error,
      });
      throw error;
    }
  }

  /**
   * Verify HMAC-SHA256 signature returned by Razorpay Checkout popup
   * @param {Object} params
   * @param {string} params.razorpay_order_id
   * @param {string} params.razorpay_payment_id
   * @param {string} params.razorpay_signature
   */
  verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return false;
    }

    // Dev/Test fallback mode for simulated orders
    if (!this.isConfigured && razorpay_order_id.startsWith('order_sim_')) {
      return (
        razorpay_signature === 'simulated_signature' ||
        razorpay_signature.startsWith('sim_') ||
        razorpay_signature.length >= 10
      );
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(payload)
      .digest('hex');

    const bufA = Buffer.from(generatedSignature, 'utf8');
    const bufB = Buffer.from(razorpay_signature, 'utf8');

    if (bufA.length !== bufB.length) {
      return false;
    }

    const isValid = crypto.timingSafeEqual(bufA, bufB);

    logger.info('Razorpay payment signature check', {
      razorpay_order_id,
      razorpay_payment_id,
      isValid,
    });

    return isValid;
  }

  /**
   * Helper to generate a valid signature (useful for unit testing)
   */
  generateTestSignature(orderId, paymentId, secret = this.keySecret) {
    const payload = `${orderId}|${paymentId}`;
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Verify server-to-server webhook signature from Razorpay
   * @param {string|Buffer} rawBody
   * @param {string} signatureHeader
   */
  verifyWebhookSignature(rawBody, signatureHeader) {
    if (!rawBody || !signatureHeader) {
      return false;
    }

    const bodyString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    const secret = this.webhookSecret || this.keySecret;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyString)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf8'),
        Buffer.from(signatureHeader, 'utf8')
      );
    } catch {
      return false;
    }
  }
}

module.exports = new RazorpayService();

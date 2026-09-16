const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Pricing = require('../models/Pricing');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const razorpayService = require('../services/razorpayService');
const invoiceService = require('../services/invoiceService');
const emailService = require('../services/emailService');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../config/logger');

/**
 * Shared helper to mark order as paid, generate invoice, and dispatch email idempotently
 */
const finalizeVerifiedPayment = async (order, providerTxnId, rawResponse, rzpDetails = {}) => {
  if (order.status === 'paid') {
    return; // Idempotent: already processed
  }

  // Update order status
  order.status = 'paid';
  await order.save();

  // If order was discounted using a coupon, increment coupon redemption count
  if (order.couponId) {
    try {
      await Coupon.findByIdAndUpdate(order.couponId, { $inc: { timesUsed: 1 } });
      logger.info('Incremented coupon usage count', { couponCode: order.couponCode, couponId: order.couponId });
    } catch (couponErr) {
      logger.error('Failed to increment coupon usage count', { error: couponErr.message });
    }
  }

  // Create or update Payment record
  let payment = await Payment.findOne({ merchantTransactionId: order.merchantTransactionId });
  if (!payment) {
    payment = await Payment.create({
      orderId: order._id,
      merchantTransactionId: order.merchantTransactionId,
      provider: 'Razorpay',
      providerTransactionId: providerTxnId || rzpDetails.razorpay_payment_id || 'VERIFIED',
      razorpayPaymentId: rzpDetails.razorpay_payment_id,
      razorpayOrderId: rzpDetails.razorpay_order_id || order.razorpayOrderId,
      razorpaySignature: rzpDetails.razorpay_signature,
      amount: order.amount,
      status: 'SUCCESS',
      verified: true,
      rawResponse,
    });
  } else {
    payment.status = 'SUCCESS';
    payment.verified = true;
    payment.provider = 'Razorpay';
    payment.providerTransactionId = providerTxnId || payment.providerTransactionId;
    payment.razorpayPaymentId = rzpDetails.razorpay_payment_id || payment.razorpayPaymentId;
    payment.razorpayOrderId = rzpDetails.razorpay_order_id || payment.razorpayOrderId;
    payment.razorpaySignature = rzpDetails.razorpay_signature || payment.razorpaySignature;
    payment.rawResponse = rawResponse;
    await payment.save();
  }

  // Fetch full details for invoice & email
  const user = await User.findById(order.userId);
  const pricing = await Pricing.findById(order.pricingId);

  // Generate Invoice PDF
  let invoice;
  try {
    invoice = await invoiceService.generateInvoice({
      order,
      user,
      pricing,
      payment,
    });
  } catch (invErr) {
    logger.error('Failed to generate invoice PDF', { error: invErr.message, orderId: order._id });
  }

  // Dispatch Confirmation Email with attached invoice
  if (invoice) {
    try {
      await emailService.sendPaymentConfirmation({
        user,
        order,
        pricing,
        invoiceNumber: invoice.invoiceNumber,
        pdfPath: invoice.pdfPath,
      });
    } catch (emailErr) {
      logger.error('Failed to send confirmation email', { error: emailErr.message, orderId: order._id });
    }
  }

  logger.info('Payment verified and order finalized successfully with Razorpay', {
    orderId: order._id,
    merchantTransactionId: order.merchantTransactionId,
  });
};

/**
 * Verify Razorpay payment signature from client checkout modal
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return sendError(res, 'MISSING_PAYMENT_DATA', 'Missing required Razorpay verification payload', 400);
    }

    const order = await Order.findById(orderId)
      .populate('pricingId', 'title duration sessions planType')
      .populate('userId', 'name email phone');

    if (!order) {
      return sendError(res, 'ORDER_NOT_FOUND', 'Coaching order not found', 404);
    }

    // IDOR Protection: Must be order owner or admin
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'FORBIDDEN', 'Access denied to verify this order', 403);
    }

    // Cryptographic signature check
    const isValidSignature = razorpayService.verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValidSignature) {
      logger.warn('Razorpay signature mismatch detected', {
        orderId,
        razorpay_order_id,
        razorpay_payment_id,
      });
      return sendError(res, 'INVALID_SIGNATURE', 'Payment signature verification failed', 400);
    }

    await finalizeVerifiedPayment(
      order,
      razorpay_payment_id,
      { razorpay_order_id, razorpay_payment_id, razorpay_signature },
      { razorpay_order_id, razorpay_payment_id, razorpay_signature }
    );

    return sendSuccess(
      res,
      {
        status: 'paid',
        verified: true,
        orderId: order._id,
        merchantTransactionId: order.merchantTransactionId,
        amount: order.amount,
        planTitle: order.pricingId?.title,
      },
      'Payment verified and membership activated'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Check payment status by merchantTransactionId
 */
const getPaymentStatus = async (req, res, next) => {
  try {
    const { merchantTransactionId } = req.params;

    const order = await Order.findOne({ merchantTransactionId })
      .populate('pricingId', 'title duration sessions planType')
      .populate('userId', 'name email phone');

    if (!order) {
      return sendError(res, 'ORDER_NOT_FOUND', 'Order not found for transaction reference', 404);
    }

    // IDOR check: Only owner or admin can query status
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'FORBIDDEN', 'Access denied to payment status', 403);
    }

    return sendSuccess(res, {
      status: order.status,
      verified: order.status === 'paid',
      orderId: order._id,
      merchantTransactionId: order.merchantTransactionId,
      amount: order.amount,
      planTitle: order.pricingId?.title,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Razorpay server-to-server webhook
 */
const handleWebhook = async (req, res, next) => {
  try {
    const signatureHeader = req.headers['x-razorpay-signature'];
    const rawBody = req.body;

    logger.info('Razorpay Webhook Received', { hasSignature: !!signatureHeader });

    if (!signatureHeader) {
      return sendError(res, 'INVALID_WEBHOOK', 'Missing signature header', 400);
    }

    const isValid = razorpayService.verifyWebhookSignature(rawBody, signatureHeader);
    if (!isValid) {
      logger.warn('Razorpay Webhook Signature Verification Failed');
      return sendError(res, 'INVALID_SIGNATURE', 'Signature mismatch', 403);
    }

    const event = req.body;
    const eventType = event.event;

    if (eventType === 'order.paid' || eventType === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const order = await Order.findOne({ razorpayOrderId });
        if (order && order.status !== 'paid') {
          await finalizeVerifiedPayment(order, razorpayPaymentId, event, {
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
          });
        }
      }
    }

    return sendSuccess(res, { received: true }, 'Webhook processed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyPayment,
  getPaymentStatus,
  handleWebhook,
};

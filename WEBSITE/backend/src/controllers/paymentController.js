const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Pricing = require('../models/Pricing');
const User = require('../models/User');
const phonepeService = require('../services/phonepeService');
const invoiceService = require('../services/invoiceService');
const emailService = require('../services/emailService');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../config/logger');

/**
 * Shared helper to mark order as paid, generate invoice, and dispatch email idempotently
 */
const finalizeVerifiedPayment = async (order, providerTxnId, rawResponse) => {
  if (order.status === 'paid') {
    return; // Idempotent: already processed
  }

  // Update order status
  order.status = 'paid';
  await order.save();

  // Create or update Payment record
  let payment = await Payment.findOne({ merchantTransactionId: order.merchantTransactionId });
  if (!payment) {
    payment = await Payment.create({
      orderId: order._id,
      merchantTransactionId: order.merchantTransactionId,
      providerTransactionId: providerTxnId || 'VERIFIED',
      amount: order.amount,
      status: 'SUCCESS',
      verified: true,
      rawResponse,
    });
  } else {
    payment.status = 'SUCCESS';
    payment.verified = true;
    payment.providerTransactionId = providerTxnId || payment.providerTransactionId;
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

  logger.info('Payment verified and order finalized successfully', {
    orderId: order._id,
    merchantTransactionId: order.merchantTransactionId,
  });
};

/**
 * Check and verify payment status from PhonePe gateway
 * Never trust client payment status!
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

    // If order is already verified and marked paid in our DB
    if (order.status === 'paid') {
      return sendSuccess(res, {
        status: 'paid',
        verified: true,
        orderId: order._id,
        merchantTransactionId: order.merchantTransactionId,
        amount: order.amount,
        planTitle: order.pricingId?.title,
      });
    }

    // Verify payment status with PhonePe
    const phonepeStatus = await phonepeService.checkPaymentStatus(merchantTransactionId);

    if (phonepeStatus.status === 'paid') {
      await finalizeVerifiedPayment(order, phonepeStatus.transactionId, phonepeStatus.rawResponse);

      return sendSuccess(res, {
        status: 'paid',
        verified: true,
        orderId: order._id,
        merchantTransactionId: order.merchantTransactionId,
        amount: order.amount,
        planTitle: order.pricingId?.title,
      });
    } else if (phonepeStatus.status === 'failed') {
      order.status = 'failed';
      await order.save();

      return sendSuccess(res, {
        status: 'failed',
        verified: false,
        orderId: order._id,
        merchantTransactionId: order.merchantTransactionId,
        message: 'Payment was declined or failed by gateway',
      });
    }

    // Otherwise still pending
    return sendSuccess(res, {
      status: 'pending',
      verified: false,
      orderId: order._id,
      merchantTransactionId: order.merchantTransactionId,
      message: 'Payment verification is currently pending',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle PhonePe server-to-server webhook
 */
const handleWebhook = async (req, res, next) => {
  try {
    const signatureHeader = req.headers['x-phonepe-checksum-signature'] || req.headers['x-verify'];
    const base64Response = req.body?.response;

    logger.info('PhonePe Webhook Received', { hasSignature: !!signatureHeader });

    if (!base64Response || !signatureHeader) {
      return sendError(res, 'INVALID_WEBHOOK', 'Missing response payload or signature header', 400);
    }

    // Strict Webhook Signature Verification (V2 HMAC or V1 Checksum)
    const isValidSignature = phonepeService.verifyWebhookSignature(base64Response, signatureHeader);
    if (!isValidSignature) {
      logger.warn('PhonePe Webhook Signature Verification Failed', { signatureHeader });
      return sendError(res, 'INVALID_SIGNATURE', 'Signature mismatch', 403);
    }

    // Decode payload
    const decodedPayloadStr = Buffer.from(base64Response, 'base64').toString('utf8');
    const webhookData = JSON.parse(decodedPayloadStr);

    const merchantTransactionId = webhookData.data?.merchantTransactionId;
    const providerTxnId = webhookData.data?.transactionId;
    const isSuccess = webhookData.code === 'PAYMENT_SUCCESS';

    if (!merchantTransactionId) {
      return sendError(res, 'INVALID_DATA', 'Missing merchantTransactionId in webhook', 400);
    }

    const order = await Order.findOne({ merchantTransactionId });
    if (!order) {
      logger.warn('Webhook received for non-existent order', { merchantTransactionId });
      return sendError(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
    }

    if (isSuccess) {
      await finalizeVerifiedPayment(order, providerTxnId, webhookData);
    } else {
      order.status = 'failed';
      await order.save();
      logger.info('Order marked as failed via webhook', { merchantTransactionId });
    }

    // PhonePe expects 200 OK
    return sendSuccess(res, { received: true }, 'Webhook processed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPaymentStatus,
  handleWebhook,
};

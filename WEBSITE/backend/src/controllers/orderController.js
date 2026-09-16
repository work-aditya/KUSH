const crypto = require('crypto');
const Order = require('../models/Order');
const Pricing = require('../models/Pricing');
const phonepeService = require('../services/phonepeService');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../config/logger');

/**
 * Create a new coaching order and initiate PhonePe transaction
 * Master Security Principle: Frontend sends ONLY pricingId. Backend resolves authoritative price.
 */
const createOrder = async (req, res, next) => {
  try {
    const { pricingId } = req.body;
    const userId = req.user._id;

    const pricing = await Pricing.findOne({ _id: pricingId, active: true });
    if (!pricing) {
      return sendError(res, 'PRICING_NOT_FOUND', 'Selected pricing plan is no longer active or available', 404);
    }

    // Generate unique merchantTransactionId: CK_<timestamp>_<hex>
    const uniqueSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    const merchantTransactionId = `CK_${Date.now()}_${uniqueSuffix}`;

    // Create Order in MongoDB with authoritative price
    const order = await Order.create({
      userId,
      pricingId: pricing._id,
      amount: pricing.price,
      currency: pricing.currency || 'INR',
      status: 'created',
      merchantTransactionId,
      provider: 'PhonePe',
    });

    logger.info('Order created in database', {
      orderId: order._id,
      merchantTransactionId,
      amount: order.amount,
      userId,
    });

    // Initiate transaction with PhonePe
    const phonePeResult = await phonepeService.initiatePayment({
      merchantTransactionId,
      merchantUserId: userId,
      amountInRupees: order.amount,
      userPhone: req.user.phone,
    });

    if (!phonePeResult.success && !phonePeResult.isSimulated) {
      order.status = 'failed';
      await order.save();
      return sendError(res, 'PAYMENT_INIT_FAILED', phonePeResult.message || 'Failed to initiate payment gateway session', 502);
    }

    // Update order status to pending
    order.status = 'pending';
    await order.save();

    // Return only safe checkout details to frontend (never secrets or raw keys)
    return sendSuccess(
      res,
      {
        orderId: order._id,
        merchantTransactionId: order.merchantTransactionId,
        amount: order.amount,
        currency: order.currency,
        planTitle: pricing.title,
        redirectUrl: phonePeResult.redirectUrl,
      },
      'Order created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get order details by ID with IDOR protection
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('pricingId', 'title duration sessions planType')
      .populate('userId', 'name email phone');

    if (!order) {
      return sendError(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
    }

    // IDOR Protection: User can only access their own order unless admin
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'FORBIDDEN', 'Access denied to this order', 403);
    }

    return sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
};

/**
 * Get orders of the currently authenticated trainee
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('pricingId', 'title duration sessions planType')
      .sort({ createdAt: -1 });

    return sendSuccess(res, orders);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
};

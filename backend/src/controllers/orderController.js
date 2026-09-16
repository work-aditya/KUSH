const crypto = require('crypto');
const Order = require('../models/Order');
const Pricing = require('../models/Pricing');
const Coupon = require('../models/Coupon');
const razorpayService = require('../services/razorpayService');
const env = require('../config/env');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../config/logger');

/**
 * Create a new coaching order and initiate Razorpay transaction with optional coupon
 * Master Security Principle: Frontend sends ONLY pricingId and optional couponCode. Backend resolves authoritative prices.
 */
const createOrder = async (req, res, next) => {
  try {
    const { pricingId, couponCode } = req.body;
    const userId = req.user._id;

    const pricing = await Pricing.findOne({ _id: pricingId, active: true });
    if (!pricing) {
      return sendError(res, 'PRICING_NOT_FOUND', 'Selected pricing plan is no longer active or available', 404);
    }

    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const normalizedCode = couponCode.trim().toUpperCase();
      appliedCoupon = await Coupon.findOne({ code: normalizedCode });

      if (!appliedCoupon) {
        return sendError(res, 'INVALID_COUPON', `Coupon "${normalizedCode}" was not found`, 404);
      }

      const validity = appliedCoupon.isValidForAmount(pricing.price);
      if (!validity.valid) {
        return sendError(res, 'COUPON_INVALID', validity.reason, 400);
      }

      discountAmount = appliedCoupon.calculateDiscount(pricing.price);
    }

    const finalAmount = Math.max(0, pricing.price - discountAmount);

    // Generate unique merchantTransactionId: CK_<timestamp>_<hex>
    const uniqueSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    const merchantTransactionId = `CK_${Date.now()}_${uniqueSuffix}`;

    // Create Razorpay Order
    let razorpayOrder;
    try {
      razorpayOrder = await razorpayService.createOrder({
        amountInRupees: finalAmount,
        receipt: merchantTransactionId,
        notes: {
          merchantTransactionId,
          pricingId: pricing._id.toString(),
          userId: userId.toString(),
          couponCode: appliedCoupon ? appliedCoupon.code : '',
        },
      });
    } catch (rzpErr) {
      logger.error('Failed to create Razorpay order', { error: rzpErr.message });
      return sendError(res, 'PAYMENT_GATEWAY_ERROR', 'Failed to initialize payment gateway order session', 502);
    }

    // Save Order in MongoDB with authoritative pricing & coupon metadata
    const order = await Order.create({
      userId,
      pricingId: pricing._id,
      amount: finalAmount,
      originalAmount: pricing.price,
      discountAmount,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      couponId: appliedCoupon ? appliedCoupon._id : undefined,
      currency: pricing.currency || 'INR',
      status: 'pending',
      merchantTransactionId,
      razorpayOrderId: razorpayOrder.id,
      provider: 'Razorpay',
    });

    logger.info('Order created in database with Razorpay order', {
      orderId: order._id,
      merchantTransactionId,
      amount: order.amount,
      razorpayOrderId: razorpayOrder.id,
      userId,
    });

    // Return safe checkout details for Razorpay modal
    return sendSuccess(
      res,
      {
        orderId: order._id,
        merchantTransactionId: order.merchantTransactionId,
        razorpayOrderId: razorpayOrder.id,
        amount: order.amount,
        originalAmount: order.originalAmount,
        discountAmount: order.discountAmount,
        couponCode: order.couponCode,
        currency: order.currency,
        planTitle: pricing.title,
        keyId: env.RAZORPAY_KEY_ID,
        user: {
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
        },
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

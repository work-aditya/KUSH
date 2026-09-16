const Coupon = require('../models/Coupon');
const Pricing = require('../models/Pricing');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../config/logger');

/**
 * Validate a coupon code against a chosen pricing plan
 * Public / Trainee endpoint
 */
const validateCoupon = async (req, res, next) => {
  try {
    const { code, pricingId } = req.body;

    if (!code || typeof code !== 'string') {
      return sendError(res, 'INVALID_COUPON', 'Please enter a valid coupon code', 400);
    }

    if (!pricingId) {
      return sendError(res, 'MISSING_PRICING', 'Pricing plan ID is required', 400);
    }

    const pricing = await Pricing.findOne({ _id: pricingId, active: true });
    if (!pricing) {
      return sendError(res, 'PRICING_NOT_FOUND', 'Selected pricing plan is not found or inactive', 404);
    }

    const normalizedCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: normalizedCode });

    if (!coupon) {
      return sendError(res, 'COUPON_NOT_FOUND', `Coupon code "${normalizedCode}" does not exist`, 404);
    }

    const validity = coupon.isValidForAmount(pricing.price);
    if (!validity.valid) {
      return sendError(res, 'COUPON_INVALID', validity.reason, 400);
    }

    const discountAmount = coupon.calculateDiscount(pricing.price);
    const finalAmount = Math.max(0, pricing.price - discountAmount);

    return sendSuccess(res, {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      originalAmount: pricing.price,
      finalAmount,
      description: coupon.description,
    }, 'Coupon applied successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all coupons (Admin)
 */
const getAllCouponsAdmin = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return sendSuccess(res, coupons);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new coupon (Admin)
 */
const createCouponAdmin = async (req, res, next) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      validUntil,
      usageLimit,
      active,
      description,
    } = req.body;

    if (!code || !discountValue) {
      return sendError(res, 'MISSING_FIELDS', 'Coupon code and discount value are required', 400);
    }

    const normalizedCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: normalizedCode });
    if (existing) {
      return sendError(res, 'COUPON_EXISTS', `A coupon with code "${normalizedCode}" already exists`, 409);
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      active: active !== undefined ? active : true,
      description: description ? description.trim() : '',
      createdBy: req.user._id,
    });

    logger.info('Coupon created successfully by admin', { code: coupon.code, adminId: req.user._id });

    return sendSuccess(res, coupon, 'Coupon created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a coupon (Admin)
 */
const deleteCouponAdmin = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return sendError(res, 'COUPON_NOT_FOUND', 'Coupon not found', 404);
    }

    logger.info('Coupon deleted by admin', { code: coupon.code, id: req.params.id });
    return sendSuccess(res, null, `Coupon "${coupon.code}" deleted successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle active status of coupon (Admin)
 */
const toggleCouponStatusAdmin = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return sendError(res, 'COUPON_NOT_FOUND', 'Coupon not found', 404);
    }

    coupon.active = !coupon.active;
    await coupon.save();

    logger.info('Coupon active status toggled', { code: coupon.code, active: coupon.active });
    return sendSuccess(res, coupon, `Coupon is now ${coupon.active ? 'active' : 'inactive'}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCoupon,
  getAllCouponsAdmin,
  createCouponAdmin,
  deleteCouponAdmin,
  toggleCouponStatusAdmin,
};

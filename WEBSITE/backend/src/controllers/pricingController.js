const Pricing = require('../models/Pricing');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get all active pricing plans sorted by sortOrder
 */
const getPricingPlans = async (req, res, next) => {
  try {
    const plans = await Pricing.find({ active: true }).sort({ sortOrder: 1, createdAt: 1 });
    return sendSuccess(res, plans);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific pricing plan by ID
 */
const getPricingPlanById = async (req, res, next) => {
  try {
    const plan = await Pricing.findOne({ _id: req.params.id, active: true });
    if (!plan) {
      return sendError(res, 'NOT_FOUND', 'Pricing plan not found', 404);
    }
    return sendSuccess(res, plan);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPricingPlans,
  getPricingPlanById,
};

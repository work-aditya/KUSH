const User = require('../models/User');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Pricing = require('../models/Pricing');
const Page = require('../models/Page');
const ContactMessage = require('../models/ContactMessage');
const Invoice = require('../models/Invoice');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Admin Dashboard Metrics & Recent Orders
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOrders,
      paidOrdersCount,
      pendingOrdersCount,
      failedOrdersCount,
      activePlansCount,
      revenueResult,
      recentOrders,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'paid' }),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'failed' }),
      Pricing.countDocuments({ active: true }),
      Order.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
      ]),
      Order.find()
        .populate('userId', 'name email')
        .populate('pricingId', 'title planType')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    return sendSuccess(res, {
      totalUsers,
      totalOrders,
      paidOrdersCount,
      pendingOrdersCount,
      failedOrdersCount,
      activePlansCount,
      totalRevenue,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Pricing Plan Management (Admin)
 */
const getAllPricingPlansAdmin = async (req, res, next) => {
  try {
    const plans = await Pricing.find().sort({ sortOrder: 1, createdAt: 1 });
    return sendSuccess(res, plans);
  } catch (error) {
    next(error);
  }
};

const createPricingPlan = async (req, res, next) => {
  try {
    const plan = await Pricing.create(req.body);
    return sendSuccess(res, plan, 'Pricing plan created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updatePricingPlan = async (req, res, next) => {
  try {
    const plan = await Pricing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!plan) {
      return sendError(res, 'NOT_FOUND', 'Pricing plan not found', 404);
    }
    return sendSuccess(res, plan, 'Pricing plan updated successfully');
  } catch (error) {
    next(error);
  }
};

const deletePricingPlan = async (req, res, next) => {
  try {
    const plan = await Pricing.findByIdAndDelete(req.params.id);
    if (!plan) {
      return sendError(res, 'NOT_FOUND', 'Pricing plan not found', 404);
    }
    return sendSuccess(res, null, 'Pricing plan deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Dynamic Pages CMS Management (Admin)
 */
const getAllPagesAdmin = async (req, res, next) => {
  try {
    const pages = await Page.find().sort({ updatedAt: -1 });
    return sendSuccess(res, pages);
  } catch (error) {
    next(error);
  }
};

const createPage = async (req, res, next) => {
  try {
    const { slug, title, content, published } = req.body;
    const existing = await Page.findOne({ slug: slug.toLowerCase().trim() });
    if (existing) {
      return sendError(res, 'SLUG_EXISTS', 'A page with this slug already exists', 409);
    }

    const page = await Page.create({
      slug: slug.toLowerCase().trim(),
      title,
      content,
      published: published !== undefined ? published : true,
      updatedBy: req.user._id,
    });

    return sendSuccess(res, page, 'Page created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updatePage = async (req, res, next) => {
  try {
    const page = await Page.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    if (!page) {
      return sendError(res, 'PAGE_NOT_FOUND', 'Page not found', 404);
    }
    return sendSuccess(res, page, 'Page updated successfully');
  } catch (error) {
    next(error);
  }
};

const deletePage = async (req, res, next) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) {
      return sendError(res, 'PAGE_NOT_FOUND', 'Page not found', 404);
    }
    return sendSuccess(res, null, 'Page deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Orders & Payments Management (Admin)
 */
const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email phone')
      .populate('pricingId', 'title duration sessions planType')
      .sort({ createdAt: -1 });

    return sendSuccess(res, orders);
  } catch (error) {
    next(error);
  }
};

/**
 * Users Directory Management (Admin)
 */
const getAllUsersAdmin = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    return sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
};

const toggleUserActiveStatus = async (req, res, next) => {
  try {
    const { active } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    // Prevent deactivating oneself
    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 'FORBIDDEN', 'You cannot deactivate your own admin account', 400);
    }

    user.active = active;
    await user.save();

    return sendSuccess(res, { id: user._id, active: user.active }, `User ${user.active ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * Contact Messages Management (Admin)
 */
const getAllContactMessagesAdmin = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    return sendSuccess(res, messages);
  } catch (error) {
    next(error);
  }
};

const updateMessageStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!message) {
      return sendError(res, 'MESSAGE_NOT_FOUND', 'Message not found', 404);
    }
    return sendSuccess(res, message, 'Message status updated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllPricingPlansAdmin,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  getAllPagesAdmin,
  createPage,
  updatePage,
  deletePage,
  getAllOrdersAdmin,
  getAllUsersAdmin,
  toggleUserActiveStatus,
  getAllContactMessagesAdmin,
  updateMessageStatus,
};

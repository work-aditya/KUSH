const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateUser, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createPricingSchema, updatePricingSchema } = require('../validators/pricingValidator');
const { createPageSchema, updatePageSchema } = require('../validators/pageValidator');

// Strict server-side authorization: all routes require authenticated admin
router.use(authenticateUser);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Pricing Management
router.get('/pricing', adminController.getAllPricingPlansAdmin);
router.post('/pricing', validate(createPricingSchema), adminController.createPricingPlan);
router.put('/pricing/:id', validate(updatePricingSchema), adminController.updatePricingPlan);
router.delete('/pricing/:id', adminController.deletePricingPlan);

// Pages CMS Management
router.get('/pages', adminController.getAllPagesAdmin);
router.post('/pages', validate(createPageSchema), adminController.createPage);
router.put('/pages/:id', validate(updatePageSchema), adminController.updatePage);
router.delete('/pages/:id', adminController.deletePage);

// Orders & Payments
router.get('/orders', adminController.getAllOrdersAdmin);

// Users Directory
router.get('/users', adminController.getAllUsersAdmin);
router.patch('/users/:id/status', adminController.toggleUserActiveStatus);

// Contact Messages
router.get('/messages', adminController.getAllContactMessagesAdmin);
router.patch('/messages/:id/status', adminController.updateMessageStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const orderController = require('../controllers/orderController');
const { authenticateUser } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createOrderSchema } = require('../validators/orderValidator');
const { paymentLimiter } = require('../middleware/rateLimiter');

// Public webhook endpoint for Razorpay callbacks with signature verification
router.post('/webhook', paymentController.handleWebhook);

// Protected routes
router.post('/create', authenticateUser, paymentLimiter, validate(createOrderSchema), orderController.createOrder);
router.post('/verify', authenticateUser, paymentController.verifyPayment);
router.get('/status/:merchantTransactionId', authenticateUser, paymentController.getPaymentStatus);

module.exports = router;

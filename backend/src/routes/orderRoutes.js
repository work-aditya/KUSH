const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateUser } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createOrderSchema } = require('../validators/orderValidator');
const { paymentLimiter } = require('../middleware/rateLimiter');

router.use(authenticateUser);

router.post('/', paymentLimiter, validate(createOrderSchema), orderController.createOrder);
router.get('/my', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

module.exports = router;

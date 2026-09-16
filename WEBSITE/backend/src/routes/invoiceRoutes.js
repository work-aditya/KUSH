const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/:orderId', invoiceController.getInvoiceByOrderId);
router.get('/:orderId/download', invoiceController.downloadInvoicePdf);

module.exports = router;

const fs = require('fs');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get invoice metadata for an order with IDOR protection
 */
const getInvoiceByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const invoice = await Invoice.findOne({ orderId })
      .populate('userId', 'name email phone')
      .populate('orderId');

    if (!invoice) {
      return sendError(res, 'INVOICE_NOT_FOUND', 'Invoice not found for this order', 404);
    }

    // IDOR Protection: User can only access their own invoice unless admin
    if (invoice.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'FORBIDDEN', 'Access denied to this invoice', 403);
    }

    return sendSuccess(res, {
      invoiceNumber: invoice.invoiceNumber,
      orderId: invoice.orderId,
      amount: invoice.amount,
      createdAt: invoice.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download invoice PDF with IDOR verification
 */
const downloadInvoicePdf = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const invoice = await Invoice.findOne({ orderId });
    if (!invoice) {
      return sendError(res, 'INVOICE_NOT_FOUND', 'Invoice not found for this order', 404);
    }

    // IDOR Protection: User can only download their own invoice unless admin
    if (invoice.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'FORBIDDEN', 'Access denied to download this invoice', 403);
    }

    if (!fs.existsSync(invoice.pdfPath)) {
      return sendError(res, 'FILE_NOT_FOUND', 'Invoice PDF file is missing on server', 404);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CoachKush-Invoice-${invoice.invoiceNumber}.pdf"`);

    const fileStream = fs.createReadStream(invoice.pdfPath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoiceByOrderId,
  downloadInvoicePdf,
};

const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    pdfPath: {
      type: String,
      required: [true, 'PDF file path is required'],
    },
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
      index: true,
    },
    providerTransactionId: {
      type: String,
      trim: true,
    },
    merchantTransactionId: {
      type: String,
      required: [true, 'Merchant transaction ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    status: {
      type: String,
      required: [true, 'Payment status is required'],
      index: true,
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    rawResponse: {
      type: mongoose.Schema.Types.Mixed,
      select: false, // Automatically excluded from query results unless explicitly requested
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.rawResponse;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;

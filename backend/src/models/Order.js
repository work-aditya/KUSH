const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    pricingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pricing',
      required: [true, 'Pricing ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['created', 'pending', 'paid', 'failed', 'cancelled'],
      default: 'created',
      index: true,
    },
    merchantTransactionId: {
      type: String,
      required: [true, 'Merchant transaction ID is required'],
      unique: true,
      index: true,
    },
    provider: {
      type: String,
      default: 'Razorpay',
    },
    razorpayOrderId: {
      type: String,
      index: true,
    },
    originalAmount: {
      type: Number,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

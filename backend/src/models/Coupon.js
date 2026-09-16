const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      default: 'percentage',
      required: true,
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [1, 'Discount value must be greater than zero'],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order amount cannot be negative'],
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: [0, 'Maximum discount cannot be negative'],
    },
    validUntil: {
      type: Date,
      default: null,
    },
    usageLimit: {
      type: Number,
      default: null,
      min: [1, 'Usage limit must be at least 1'],
    },
    timesUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.methods.isValidForAmount = function (amount) {
  if (!this.active) {
    return { valid: false, reason: 'Coupon is inactive' };
  }

  if (this.validUntil && new Date() > new Date(this.validUntil)) {
    return { valid: false, reason: 'Coupon has expired' };
  }

  if (this.usageLimit && this.timesUsed >= this.usageLimit) {
    return { valid: false, reason: 'Coupon usage limit has been reached' };
  }

  if (this.minOrderAmount && amount < this.minOrderAmount) {
    return {
      valid: false,
      reason: `Minimum order amount of ₹${this.minOrderAmount} required for this coupon`,
    };
  }

  return { valid: true };
};

couponSchema.methods.calculateDiscount = function (amount) {
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = Math.round((amount * this.discountValue) / 100);
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else if (this.discountType === 'flat') {
    discount = Math.min(this.discountValue, amount);
  }
  return discount;
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;

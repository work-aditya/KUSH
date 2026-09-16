const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Pricing plan title is required'],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
    },
    sessions: {
      type: Number,
      required: [true, 'Number of sessions is required'],
      min: [1, 'Sessions must be at least 1'],
    },
    planType: {
      type: String,
      enum: ['single', 'couple'],
      required: [true, 'Plan type must be single or couple'],
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

pricingSchema.index({ active: 1, sortOrder: 1 });

const Pricing = mongoose.model('Pricing', pricingSchema);

module.exports = Pricing;

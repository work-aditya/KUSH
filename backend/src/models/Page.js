const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Page title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Page content is required'],
    },
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Page = mongoose.model('Page', pageSchema);

module.exports = Page;

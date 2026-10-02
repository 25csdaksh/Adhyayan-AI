const mongoose = require('mongoose');

const webSourceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference ID is required'],
      index: true,
    },
    notebookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notebook',
      required: [true, 'Notebook reference ID is required'],
      index: true,
    },
    url: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    canonicalUrl: {
      type: String,
      required: [true, 'Canonical URL is required'],
      trim: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'Untitled Web Source',
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    domain: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    content: {
      type: String,
      default: '',
    },
    contentHash: {
      type: String,
      default: '',
      index: true,
    },
    sourceType: {
      type: String,
      enum: {
        values: ['webpage'],
        message: 'Invalid web source type: {VALUE}',
      },
      default: 'webpage',
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'ready', 'failed'],
        message: 'Invalid web source status: {VALUE}',
      },
      default: 'pending',
      index: true,
    },
    httpStatus: {
      type: Number,
      default: null,
    },
    mimeType: {
      type: String,
      default: 'text/html',
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    fetchedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
webSourceSchema.index({ userId: 1, notebookId: 1 });
webSourceSchema.index({ notebookId: 1, createdAt: -1 });
webSourceSchema.index({ notebookId: 1, canonicalUrl: 1 });

const WebSource = mongoose.model('WebSource', webSourceSchema);

module.exports = WebSource;

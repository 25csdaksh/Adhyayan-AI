const mongoose = require('mongoose');

const billingEventSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ['razorpay', 'stripe', 'mock'],
      default: 'razorpay',
      required: true,
      index: true,
    },
    eventId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    processed: {
      type: Boolean,
      default: false,
      index: true,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    payloadHash: {
      type: String,
      trim: true,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for provider event auditing
billingEventSchema.index({ provider: 1, eventType: 1, createdAt: -1 });

module.exports = mongoose.model('BillingEvent', billingEventSchema);

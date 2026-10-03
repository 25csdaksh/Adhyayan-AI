const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
      index: true,
    },
    provider: {
      type: String,
      enum: ['razorpay', 'stripe', 'mock'],
      default: 'razorpay',
      required: true,
    },
    providerPaymentId: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
      default: null,
    },
    providerOrderId: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
      required: true,
      index: true,
    },
    method: {
      type: String,
      trim: true,
      default: 'card',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// High efficiency index
paymentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);

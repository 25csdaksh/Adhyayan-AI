const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['razorpay', 'stripe', 'mock'],
      default: 'razorpay',
      required: true,
    },
    providerCustomerId: {
      type: String,
      trim: true,
      default: null,
    },
    providerSubscriptionId: {
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
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
      required: true,
    },
    status: {
      type: String,
      enum: ['created', 'pending', 'active', 'past_due', 'paused', 'canceled', 'expired'],
      default: 'created',
      required: true,
      index: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly', 'lifetime', 'free'],
      default: 'monthly',
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
    },
    currentPeriodStart: {
      type: Date,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      index: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    canceledAt: {
      type: Date,
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

// Compound indexes for high performance querying
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);

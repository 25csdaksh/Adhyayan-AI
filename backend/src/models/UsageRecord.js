const mongoose = require('mongoose');

const UsageRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      index: true,
    },
    month: {
      type: String, // 'YYYY-MM'
      required: true,
      index: true,
    },
    aiRequests: {
      type: Number,
      default: 0,
    },
    embeddingRequests: {
      type: Number,
      default: 0,
    },
    researchSessions: {
      type: Number,
      default: 0,
    },
    studyToolsGenerated: {
      type: Number,
      default: 0,
    },
    chatMessages: {
      type: Number,
      default: 0,
    },
    sourceProcessingOps: {
      type: Number,
      default: 0,
    },
    approxInputTokens: {
      type: Number,
      default: 0,
    },
    approxOutputTokens: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

UsageRecordSchema.index({ userId: 1, date: 1 }, { unique: true });
UsageRecordSchema.index({ userId: 1, month: 1 });

module.exports = mongoose.model('UsageRecord', UsageRecordSchema);

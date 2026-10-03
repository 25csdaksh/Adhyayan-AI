const mongoose = require('mongoose');

const userMemorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'preference',
        'learning_goal',
        'research_interest',
        'saved_fact',
        'saved_instruction',
        'study_preference',
      ],
      default: 'preference',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, 'Memory content cannot exceed 2000 characters'],
    },
    source: {
      type: String,
      enum: ['explicit_user', 'notebook_action', 'insight_save'],
      default: 'explicit_user',
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 1.0,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
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

// Compound indexes for user scoped filtering and retrieval
userMemorySchema.index({ userId: 1, type: 1, active: 1 });
userMemorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('UserMemory', userMemorySchema);

const mongoose = require('mongoose');

const notebookMemorySchema = new mongoose.Schema(
  {
    notebookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notebook',
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    purpose: {
      type: String,
      trim: true,
      maxlength: [1000, 'Purpose cannot exceed 1000 characters'],
      default: '',
    },
    studyGoal: {
      type: String,
      trim: true,
      maxlength: [1000, 'Study goal cannot exceed 1000 characters'],
      default: '',
    },
    preferredStyle: {
      type: String,
      enum: ['standard', 'detailed', 'concise', 'bullet_points', 'academic', 'conversational'],
      default: 'standard',
    },
    customInstructions: {
      type: String,
      trim: true,
      maxlength: [2000, 'Custom instructions cannot exceed 2000 characters'],
      default: '',
    },
    researchDirection: {
      type: String,
      trim: true,
      maxlength: [1000, 'Research direction cannot exceed 1000 characters'],
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

notebookMemorySchema.index({ userId: 1, notebookId: 1 });

module.exports = mongoose.model('NotebookMemory', notebookMemorySchema);

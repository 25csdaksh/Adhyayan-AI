const mongoose = require('mongoose');

const citationReferenceSchema = new mongoose.Schema(
  {
    citationNumber: Number,
    chunkId: mongoose.Schema.Types.ObjectId,
    documentId: mongoose.Schema.Types.ObjectId,
    documentTitle: String,
    sourceType: String,
    pageNumber: Number,
    snippet: String,
  },
  { _id: false }
);

const savedInsightSchema = new mongoose.Schema(
  {
    notebookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notebook',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [10000, 'Content cannot exceed 10000 characters'],
    },
    sourceReferences: {
      type: [citationReferenceSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

savedInsightSchema.index({ notebookId: 1, userId: 1, createdAt: -1 });
savedInsightSchema.index({ notebookId: 1, pinned: -1, createdAt: -1 });

module.exports = mongoose.model('SavedInsight', savedInsightSchema);

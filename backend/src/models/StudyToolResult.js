const mongoose = require('mongoose');

const CitationItemSchema = new mongoose.Schema(
  {
    citationNumber: {
      type: Number,
      required: true,
    },
    chunkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chunk',
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    documentTitle: {
      type: String,
      default: 'Untitled Source',
    },
    sourceType: {
      type: String,
      default: 'text',
    },
    pageNumber: {
      type: Number,
      default: null,
    },
    pageStart: {
      type: Number,
      default: null,
    },
    pageEnd: {
      type: Number,
      default: null,
    },
    chunkIndex: {
      type: Number,
      default: 0,
    },
    snippet: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const StudyToolResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    notebookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notebook',
      required: [true, 'Notebook ID is required'],
      index: true,
    },
    toolType: {
      type: String,
      enum: {
        values: ['summary', 'flashcards', 'quiz', 'mindmap'],
        message: 'Invalid study tool type: {VALUE}',
      },
      required: [true, 'Tool type is required'],
    },
    title: {
      type: String,
      trim: true,
      default: 'Generated Study Material',
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    input: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Study tool result data is required'],
    },
    citations: {
      type: [CitationItemSchema],
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

// Compound indexes for user-scoped and notebook-scoped queries
StudyToolResultSchema.index({ notebookId: 1, userId: 1, createdAt: -1 });
StudyToolResultSchema.index({ notebookId: 1, toolType: 1, createdAt: -1 });

module.exports = mongoose.model('StudyToolResult', StudyToolResultSchema);

const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Document reference ID is required'],
    },
    notebookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notebook',
      required: [true, 'Notebook reference ID is required'],
    },
    chunkIndex: {
      type: Number,
      required: [true, 'Chunk index is required'],
    },
    text: {
      type: String,
      required: [true, 'Chunk text content is required'],
    },
    tokenCount: {
      type: Number,
      default: 0,
    },
    charCount: {
      type: Number,
      default: 0,
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
    embedding: {
      type: [Number],
      default: undefined,
      select: false,
    },
    embeddingModel: {
      type: String,
      default: '',
      trim: true,
    },
    embeddingDimensions: {
      type: Number,
      default: 0,
    },
    embeddedAt: {
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

// Indexes for high performance querying and vector constraints
chunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });
chunkSchema.index({ notebookId: 1 });

const Chunk = mongoose.model('Chunk', chunkSchema);

module.exports = Chunk;

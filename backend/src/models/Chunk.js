const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
      index: true,
    },
    webSourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebSource',
      default: null,
      index: true,
    },
    sourceKind: {
      type: String,
      enum: ['notebook', 'web'],
      default: 'notebook',
      index: true,
    },
    notebookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notebook',
      required: [true, 'Notebook reference ID is required'],
      index: true,
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

// Indexes for high performance querying and vector constraints with partial filters
chunkSchema.index(
  { documentId: 1, chunkIndex: 1 },
  {
    unique: true,
    partialFilterExpression: { documentId: { $exists: true, $type: 'objectId' } },
  }
);
chunkSchema.index(
  { webSourceId: 1, chunkIndex: 1 },
  {
    unique: true,
    partialFilterExpression: { webSourceId: { $exists: true, $type: 'objectId' } },
  }
);
chunkSchema.index({ notebookId: 1, sourceKind: 1 });

const Chunk = mongoose.model('Chunk', chunkSchema);

// Sync indexes in background
Chunk.syncIndexes().catch((err) => {
  console.warn('[Chunk Index Warning] Could not sync indexes automatically:', err.message);
});

module.exports = Chunk;

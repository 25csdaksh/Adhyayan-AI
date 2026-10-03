const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    notebookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notebook',
      required: [true, 'Notebook reference ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      minlength: [1, 'Document title cannot be empty'],
      maxlength: [200, 'Document title cannot exceed 200 characters'],
    },
    sourceType: {
      type: String,
      enum: {
        values: ['pdf', 'docx', 'txt', 'text', 'url'],
        message: 'Invalid source type. Must be pdf, docx, txt, text, or url',
      },
      required: [true, 'Source type is required'],
    },
    originalName: {
      type: String,
      default: '',
      trim: true,
    },
    mimeType: {
      type: String,
      default: '',
      trim: true,
    },
    fileSize: {
      type: Number,
      default: 0,
      min: [0, 'File size cannot be negative'],
    },
    storageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    storagePublicId: {
      type: String,
      default: '',
      trim: true,
    },
    sourceUrl: {
      type: String,
      default: '',
      trim: true,
    },
    rawText: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'ready', 'failed'],
        message: 'Invalid status. Must be pending, processing, ready, or failed',
      },
      default: 'pending',
    },
    processingError: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    analysis: {
      status: {
        type: String,
        enum: ['pending', 'processing', 'ready', 'failed'],
        default: 'pending',
      },
      overview: {
        type: String,
        default: '',
        maxlength: [5000, 'Overview exceeds maximum character limit'],
      },
      keyTopics: [{ type: String, trim: true }],
      keyConcepts: [
        {
          term: { type: String, trim: true },
          definition: { type: String, trim: true },
          context: { type: String, trim: true },
        },
      ],
      definitions: [
        {
          term: { type: String, trim: true },
          definition: { type: String, trim: true },
        },
      ],
      keyTakeaways: [{ type: String, trim: true }],
      importantFacts: [{ type: String, trim: true }],
      sections: [
        {
          title: { type: String, trim: true },
          summary: { type: String, trim: true },
          pageStart: { type: Number, default: null },
          pageEnd: { type: Number, default: null },
        },
      ],
      suggestedQuestions: [{ type: String, trim: true }],
      generatedAt: { type: Date, default: null },
      model: { type: String, default: '' },
      sourceChunkIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chunk' }],
      error: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance querying
documentSchema.index({ notebookId: 1, createdAt: -1 });
documentSchema.index({ notebookId: 1, status: 1 });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;

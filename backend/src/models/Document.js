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

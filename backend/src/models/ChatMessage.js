const mongoose = require('mongoose');

const citationSubSchema = new mongoose.Schema(
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
      default: 'Document',
      trim: true,
    },
    sourceType: {
      type: String,
      default: 'text',
      trim: true,
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
      trim: true,
    },
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: [true, 'Chat session ID reference is required'],
      index: true,
    },
    notebookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notebook',
      required: [true, 'Notebook ID reference is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required'],
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: [true, 'Message role (user or assistant) is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    citations: {
      type: [citationSubSchema],
      default: [],
    },
    retrieval: {
      topK: { type: Number, default: 0 },
      scoreThreshold: { type: Number, default: 0 },
      retrievedChunkCount: { type: Number, default: 0 },
    },
    model: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// High-performance compound indexes for chronological chat streams
chatMessageSchema.index({ sessionId: 1, createdAt: 1 });
chatMessageSchema.index({ notebookId: 1, createdAt: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;

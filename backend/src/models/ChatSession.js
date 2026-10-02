const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema(
  {
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
    title: {
      type: String,
      trim: true,
      default: 'New Chat',
      maxlength: [150, 'Chat title cannot exceed 150 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// High-performance compound index for notebook-scoped user sessions
chatSessionSchema.index({ userId: 1, notebookId: 1, updatedAt: -1 });

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = ChatSession;

const mongoose = require('mongoose');

const notebookSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a notebook title'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    icon: {
      type: String,
      default: 'BookOpen',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user notebooks sorted by updated time
notebookSchema.index({ ownerId: 1, updatedAt: -1 });
// Compound text-like index on title for efficient search
notebookSchema.index({ ownerId: 1, title: 'text', description: 'text' });

const Notebook = mongoose.model('Notebook', notebookSchema);

module.exports = Notebook;

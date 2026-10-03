const mongoose = require('mongoose');

const sourceReferenceSchema = new mongoose.Schema(
  {
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    sourceType: {
      type: String,
      enum: ['pdf', 'docx', 'txt', 'text', 'url', 'web'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const sourceRelationshipSchema = new mongoose.Schema(
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
    sourceA: {
      type: sourceReferenceSchema,
      required: true,
    },
    sourceB: {
      type: sourceReferenceSchema,
      required: true,
    },
    relationshipType: {
      type: String,
      enum: ['related', 'overlapping', 'supporting', 'contrasting', 'dependent'],
      required: true,
      index: true,
    },
    explanation: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Explanation cannot exceed 1000 characters'],
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.8,
    },
    sharedTopics: {
      type: [String],
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

sourceRelationshipSchema.index({ notebookId: 1, relationshipType: 1 });
sourceRelationshipSchema.index({ notebookId: 1, 'sourceA.sourceId': 1, 'sourceB.sourceId': 1 });

module.exports = mongoose.model('SourceRelationship', sourceRelationshipSchema);

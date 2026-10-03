const mongoose = require('mongoose');

const ResearchPlanStepSchema = new mongoose.Schema(
  {
    stepNumber: { type: Number, required: true },
    subQuestion: { type: String, required: true },
    purpose: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending',
    },
    evidenceCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const EvidenceItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    sourceId: { type: String, default: '' },
    documentId: { type: String, default: '' },
    chunkId: { type: String, default: '' },
    sourceTitle: { type: String, required: true },
    sourceType: { type: String, default: 'document' },
    sourceKind: { type: String, enum: ['document', 'web'], default: 'document' },
    text: { type: String, required: true },
    score: { type: Number, default: 0 },
    pageNumber: { type: Number, default: null },
    url: { type: String, default: '' },
    domain: { type: String, default: '' },
    subQuestionIndex: { type: Number, default: 0 },
  },
  { _id: false }
);

const ClaimItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    claim: { type: String, required: true },
    evidenceReferences: [{ type: String }],
    confidence: { type: Number, default: 1.0 },
    supportType: {
      type: String,
      enum: ['direct', 'indirect', 'conflicting', 'insufficient'],
      default: 'direct',
    },
    counterEvidence: [{ type: String }],
  },
  { _id: false }
);

const ContradictionItemSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    sourceA: {
      title: { type: String, required: true },
      claim: { type: String, required: true },
      citation: { type: String, default: '' },
    },
    sourceB: {
      title: { type: String, required: true },
      claim: { type: String, required: true },
      citation: { type: String, default: '' },
    },
    note: { type: String, default: 'Sources differ on this topic.' },
  },
  { _id: false }
);

const KnowledgeGapItemSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    reason: { type: String, required: true },
    recommendation: { type: String, default: '' },
  },
  { _id: false }
);

const TimelineEventSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    event: { type: String, required: true },
    sourceTitle: { type: String, default: '' },
    citation: { type: String, default: '' },
    isUncertain: { type: Boolean, default: false },
  },
  { _id: false }
);

const ResearchSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    notebookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notebook',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    originalQuestion: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    status: {
      type: String,
      enum: ['planning', 'researching', 'synthesizing', 'completed', 'failed'],
      default: 'planning',
      index: true,
    },
    sourceScope: {
      type: String,
      enum: ['notebook', 'web', 'all'],
      default: 'all',
    },
    researchIntent: {
      category: {
        type: String,
        enum: [
          'explain',
          'compare',
          'analyze',
          'summarize',
          'investigate',
          'evaluate_evidence',
          'timeline',
          'cause_effect',
          'pros_cons',
          'definition',
          'general',
        ],
        default: 'general',
      },
      confidence: { type: Number, default: 0.8 },
      entities: [{ type: String }],
      aspects: [{ type: String }],
    },
    researchPlan: [ResearchPlanStepSchema],
    evidence: [EvidenceItemSchema],
    claims: [ClaimItemSchema],
    synthesis: {
      executiveSummary: { type: String, default: '' },
      keyFindings: [{ type: String }],
      detailedAnalysis: { type: String, default: '' },
      crossSourceComparison: { type: String, default: '' },
      contradictions: [ContradictionItemSchema],
      knowledgeGaps: [KnowledgeGapItemSchema],
      timeline: [TimelineEventSchema],
      conclusion: { type: String, default: '' },
    },
    finalAnswer: {
      type: String,
      default: '',
    },
    citations: [
      {
        citationNumber: { type: Number },
        chunkId: { type: String },
        documentId: { type: String },
        documentTitle: { type: String },
        sourceType: { type: String },
        sourceKind: { type: String, enum: ['document', 'web'] },
        snippet: { type: String },
        pageNumber: { type: Number, default: null },
        url: { type: String, default: '' },
        domain: { type: String, default: '' },
      },
    ],
    references: [
      {
        id: { type: String },
        title: { type: String },
        type: { type: String },
        domain: { type: String, default: '' },
        url: { type: String, default: '' },
        page: { type: String, default: '' },
        dateFetched: { type: String, default: '' },
      },
    ],
    metadata: {
      tokensUsed: { type: Number, default: 0 },
      durationMs: { type: Number, default: 0 },
      sourceScope: { type: String, default: 'all' },
      model: { type: String, default: 'gemini-1.5-flash' },
      subQuestionsCount: { type: Number, default: 0 },
      evidenceCount: { type: Number, default: 0 },
      error: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

ResearchSessionSchema.index({ notebookId: 1, createdAt: -1 });
ResearchSessionSchema.index({ userId: 1, createdAt: -1 });
ResearchSessionSchema.index({ notebookId: 1, status: 1 });

module.exports = mongoose.model('ResearchSession', ResearchSessionSchema);

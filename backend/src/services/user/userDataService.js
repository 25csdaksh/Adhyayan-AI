const User = require('../../models/User');
const Notebook = require('../../models/Notebook');
const Document = require('../../models/Document');
const Chunk = require('../../models/Chunk');
const WebSource = require('../../models/WebSource');
const ChatSession = require('../../models/ChatSession');
const ChatMessage = require('../../models/ChatMessage');
const StudyToolResult = require('../../models/StudyToolResult');
const UserMemory = require('../../models/UserMemory');
const NotebookMemory = require('../../models/NotebookMemory');
const SavedInsight = require('../../models/SavedInsight');
const Bookmark = require('../../models/Bookmark');
const SourceRelationship = require('../../models/SourceRelationship');
const ResearchSession = require('../../models/ResearchSession');
const ActivityLog = require('../../models/ActivityLog');
const UsageRecord = require('../../models/UsageRecord');
const Subscription = require('../../models/Subscription');
const Payment = require('../../models/Payment');
const { getBillingProvider } = require('../billing/providers/providerFactory');

/**
 * Structured JSON export of all user-owned data
 *
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @returns {Promise<Object>}
 */
async function exportUserData(userId) {
  const [
    user,
    notebooks,
    documents,
    webSources,
    memories,
    insights,
    bookmarks,
    researchSessions,
    activity,
    subscriptions,
    payments,
  ] = await Promise.all([
    User.findById(userId).select('-passwordHash -__v').lean(),
    Notebook.find({ userId }).select('-__v').lean(),
    Document.find({ userId }).select('-__v -fileBuffer').lean(),
    WebSource.find({ userId }).select('-__v').lean(),
    UserMemory.find({ userId }).select('-__v').lean(),
    SavedInsight.find({ userId }).select('-__v').lean(),
    Bookmark.find({ userId }).select('-__v').lean(),
    ResearchSession.find({ userId }).select('-__v').lean(),
    ActivityLog.find({ userId }).select('-__v').limit(100).lean(),
    Subscription.find({ userId }).select('-__v -metadata').lean(),
    Payment.find({ userId }).select('-__v -metadata').lean(),
  ]);

  return {
    exportVersion: '1.0',
    exportDate: new Date().toISOString(),
    user: {
      id: user?._id,
      name: user?.name,
      email: user?.email,
      plan: user?.plan,
      createdAt: user?.createdAt,
    },
    subscription: subscriptions.map((s) => ({
      plan: s.plan,
      status: s.status,
      billingCycle: s.billingCycle,
      amount: s.amount,
      currency: s.currency,
      currentPeriodStart: s.currentPeriodStart,
      currentPeriodEnd: s.currentPeriodEnd,
      cancelAtPeriodEnd: s.cancelAtPeriodEnd,
    })),
    paymentHistory: payments.map((p) => ({
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      paidAt: p.paidAt || p.createdAt,
    })),
    notebooks: notebooks.map((nb) => ({
      id: nb._id,
      title: nb.title,
      description: nb.description,
      createdAt: nb.createdAt,
    })),
    sources: {
      documents: documents.map((d) => ({
        id: d._id,
        notebookId: d.notebookId,
        title: d.title,
        fileType: d.fileType,
        fileSize: d.fileSize,
        pageCount: d.pageCount,
        status: d.status,
        createdAt: d.createdAt,
      })),
      webSources: webSources.map((w) => ({
        id: w._id,
        notebookId: w.notebookId,
        title: w.title,
        url: w.url,
        domain: w.domain,
        createdAt: w.createdAt,
      })),
    },
    researchMemory: memories.map((m) => ({
      id: m._id,
      type: m.type,
      content: m.content,
      tags: m.tags,
      createdAt: m.createdAt,
    })),
    savedInsights: insights.map((i) => ({
      id: i._id,
      notebookId: i.notebookId,
      title: i.title,
      content: i.content,
      tags: i.tags,
      createdAt: i.createdAt,
    })),
    bookmarks: bookmarks.map((b) => ({
      id: b._id,
      notebookId: b.notebookId,
      targetType: b.targetType,
      targetId: b.targetId,
      title: b.title,
      createdAt: b.createdAt,
    })),
    researchSessions: researchSessions.map((r) => ({
      id: r._id,
      notebookId: r.notebookId,
      title: r.title,
      originalQuestion: r.originalQuestion,
      status: r.status,
      finalAnswer: r.finalAnswer,
      createdAt: r.createdAt,
    })),
    recentActivity: activity.map((a) => ({
      action: a.action,
      summary: a.summary,
      createdAt: a.createdAt,
    })),
  };
}

/**
 * Complete cascading deletion of user account and all owned assets
 *
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @returns {Promise<{ deleted: boolean, summary: Object }>}
 */
async function deleteUserAccount(userId) {
  // Cancel active subscriptions on provider
  try {
    const activeSubs = await Subscription.find({ userId, status: 'active' });
    const provider = getBillingProvider();
    for (const sub of activeSubs) {
      if (sub.providerSubscriptionId) {
        await provider.cancelSubscription(sub.providerSubscriptionId, false).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('[Account Deletion Warning] Failed to cancel provider subscription:', err.message);
  }

  // Find all user documents to get chunk IDs
  const userDocs = await Document.find({ userId }).select('_id').lean();
  const userDocIds = userDocs.map((d) => d._id);

  // Find all user notebooks
  const userNotebooks = await Notebook.find({ userId }).select('_id').lean();
  const userNbIds = userNotebooks.map((nb) => nb._id);

  // Execute parallel cascading deletion across all collections
  const [
    delChunks,
    delDocs,
    delWeb,
    delChats,
    delChatMsgs,
    delStudyTools,
    delUserMem,
    delNbMem,
    delInsights,
    delBookmarks,
    delRel,
    delResearch,
    delActivity,
    delUsage,
    delSubs,
    delPays,
    delNotebooks,
    delUser,
  ] = await Promise.all([
    Chunk.deleteMany({ documentId: { $in: userDocIds } }),
    Document.deleteMany({ userId }),
    WebSource.deleteMany({ userId }),
    ChatSession.deleteMany({ userId }),
    ChatMessage.deleteMany({ userId }),
    StudyToolResult.deleteMany({ userId }),
    UserMemory.deleteMany({ userId }),
    NotebookMemory.deleteMany({ userId }),
    SavedInsight.deleteMany({ userId }),
    Bookmark.deleteMany({ userId }),
    SourceRelationship.deleteMany({ notebookId: { $in: userNbIds } }),
    ResearchSession.deleteMany({ userId }),
    ActivityLog.deleteMany({ userId }),
    UsageRecord.deleteMany({ userId }),
    Subscription.deleteMany({ userId }),
    Payment.deleteMany({ userId }),
    Notebook.deleteMany({ userId }),
    User.findByIdAndDelete(userId),
  ]);

  return {
    deleted: true,
    summary: {
      chunksDeleted: delChunks.deletedCount,
      documentsDeleted: delDocs.deletedCount,
      webSourcesDeleted: delWeb.deletedCount,
      notebooksDeleted: delNotebooks.deletedCount,
      chatsDeleted: delChats.deletedCount,
      researchSessionsDeleted: delResearch.deletedCount,
      subscriptionsDeleted: delSubs.deletedCount,
      paymentsDeleted: delPays.deletedCount,
    },
  };
}

module.exports = {
  exportUserData,
  deleteUserAccount,
};

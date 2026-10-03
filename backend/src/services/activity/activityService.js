const ActivityLog = require('../../models/ActivityLog');
const { logger } = require('../../utils/logger');

/**
 * Record a research or study activity event non-blockingly
 *
 * @param {Object} params
 * @param {string|import('mongoose').Types.ObjectId} params.notebookId
 * @param {string|import('mongoose').Types.ObjectId} params.userId
 * @param {string} params.action
 * @param {string} params.title
 * @param {string} [params.details='']
 * @param {Object} [params.metadata={}]
 */
function logActivity({ notebookId, userId, action, title, details = '', metadata = {} }) {
  if (!notebookId || !userId || !action || !title) {
    return;
  }

  // Fire and forget to avoid delaying main response
  ActivityLog.create({
    notebookId,
    userId,
    action,
    title,
    details,
    metadata,
  }).catch((err) => {
    logger.warn(`[ActivityLog] Failed to record activity '${action}': ${err.message}`);
  });
}

/**
 * Get paginated activity timeline for a notebook
 */
async function getNotebookActivity({ notebookId, userId, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    ActivityLog.find({ notebookId, userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ActivityLog.countDocuments({ notebookId, userId }),
  ]);

  return {
    activities,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

module.exports = {
  logActivity,
  getNotebookActivity,
};

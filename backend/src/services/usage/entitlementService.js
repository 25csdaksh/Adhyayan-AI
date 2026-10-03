const UsageRecord = require('../../models/UsageRecord');
const Notebook = require('../../models/Notebook');
const Document = require('../../models/Document');
const WebSource = require('../../models/WebSource');
const User = require('../../models/User');
const { PLANS, getPlan } = require('../../config/plans');

/**
 * Get plan configuration for a user plan
 */
function getPlanConfig(plan = 'free') {
  const p = getPlan(plan);
  return {
    name: p.name,
    maxNotebooks: p.quotas.maxNotebooks,
    maxSourcesPerNotebook: p.quotas.maxSourcesPerNotebook,
    maxFileSizeMB: p.quotas.maxFileSizeMB,
    monthlyAiRequests: p.quotas.monthlyAiRequests,
    monthlyResearchSessions: p.quotas.monthlyResearchSessions,
    monthlyStudyTools: p.quotas.monthlyStudyTools,
    features: p.features,
  };
}

/**
 * Check if a user can use a specific feature
 */
function canUseFeature(user, featureName) {
  const plan = user?.plan || 'free';
  const config = getPlanConfig(plan);
  return Boolean(config.features?.[featureName]);
}

/**
 * Record usage metric safely
 *
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @param {'aiRequests'|'embeddingRequests'|'researchSessions'|'studyToolsGenerated'|'chatMessages'|'sourceProcessingOps'} metric
 * @param {number} [delta=1]
 * @param {Object} [metadata={}]
 */
async function recordUsage(userId, metric, delta = 1, metadata = {}) {
  if (!userId || !metric) return null;

  try {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const month = date.slice(0, 7); // YYYY-MM

    const inc = { [metric]: delta };
    if (metadata.inputTokens) inc.approxInputTokens = metadata.inputTokens;
    if (metadata.outputTokens) inc.approxOutputTokens = metadata.outputTokens;

    return await UsageRecord.findOneAndUpdate(
      { userId, date },
      {
        $setOnInsert: { userId, date, month },
        $inc: inc,
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    // Non-blocking usage record logging failure
    return null;
  }
}

/**
 * Get user monthly aggregated usage
 */
async function getUserMonthlyUsage(userId, targetMonth) {
  const month = targetMonth || new Date().toISOString().slice(0, 7);
  const records = await UsageRecord.find({ userId, month }).lean();

  const totals = {
    month,
    aiRequests: 0,
    embeddingRequests: 0,
    researchSessions: 0,
    studyToolsGenerated: 0,
    chatMessages: 0,
    sourceProcessingOps: 0,
    approxInputTokens: 0,
    approxOutputTokens: 0,
  };

  for (const r of records) {
    totals.aiRequests += r.aiRequests || 0;
    totals.embeddingRequests += r.embeddingRequests || 0;
    totals.researchSessions += r.researchSessions || 0;
    totals.studyToolsGenerated += r.studyToolsGenerated || 0;
    totals.chatMessages += r.chatMessages || 0;
    totals.sourceProcessingOps += r.sourceProcessingOps || 0;
    totals.approxInputTokens += r.approxInputTokens || 0;
    totals.approxOutputTokens += r.approxOutputTokens || 0;
  }

  return totals;
}

/**
 * Check if a user has exceeded their monthly usage limit for a metric
 */
async function checkUsageLimit(userId, metric) {
  const user = await User.findById(userId).select('plan').lean();
  const plan = user?.plan || 'free';
  const planConfig = getPlanConfig(plan);

  const usage = await getUserMonthlyUsage(userId);

  switch (metric) {
    case 'aiRequests': {
      const allowed = planConfig.monthlyAiRequests;
      const current = usage.aiRequests;
      return { allowed: current < allowed, current, limit: allowed };
    }
    case 'researchSessions': {
      const allowed = planConfig.monthlyResearchSessions;
      const current = usage.researchSessions;
      return { allowed: current < allowed, current, limit: allowed };
    }
    case 'studyTools': {
      const allowed = planConfig.monthlyStudyTools;
      const current = usage.studyToolsGenerated;
      return { allowed: current < allowed, current, limit: allowed };
    }
    case 'notebooks': {
      const current = await Notebook.countDocuments({ userId });
      const allowed = planConfig.maxNotebooks;
      return { allowed: current < allowed, current, limit: allowed };
    }
    default:
      return { allowed: true, current: 0, limit: Infinity };
  }
}

/**
 * Comprehensive user usage summary for the Usage Dashboard
 */
async function getUserUsageSummary(userId) {
  const user = await User.findById(userId).select('name email plan createdAt').lean();
  const plan = user?.plan || 'free';
  const planConfig = getPlanConfig(plan);

  const [monthlyUsage, notebookCount, docCount, webCount] = await Promise.all([
    getUserMonthlyUsage(userId),
    Notebook.countDocuments({ userId }),
    Document.countDocuments({ userId }),
    WebSource.countDocuments({ userId }),
  ]);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      plan,
      planName: planConfig.name,
      memberSince: user.createdAt,
    },
    planConfig,
    usage: {
      notebooks: {
        current: notebookCount,
        limit: planConfig.maxNotebooks,
        percent: Math.min(100, Math.round((notebookCount / planConfig.maxNotebooks) * 100)),
      },
      sources: {
        current: docCount + webCount,
        documents: docCount,
        web: webCount,
        maxPerNotebook: planConfig.maxSourcesPerNotebook,
      },
      aiRequests: {
        current: monthlyUsage.aiRequests,
        limit: planConfig.monthlyAiRequests,
        percent: Math.min(100, Math.round((monthlyUsage.aiRequests / planConfig.monthlyAiRequests) * 100)),
      },
      researchSessions: {
        current: monthlyUsage.researchSessions,
        limit: planConfig.monthlyResearchSessions,
        percent: Math.min(100, Math.round((monthlyUsage.researchSessions / planConfig.monthlyResearchSessions) * 100)),
      },
      studyTools: {
        current: monthlyUsage.studyToolsGenerated,
        limit: planConfig.monthlyStudyTools,
        percent: Math.min(100, Math.round((monthlyUsage.studyToolsGenerated / planConfig.monthlyStudyTools) * 100)),
      },
      chatMessages: monthlyUsage.chatMessages,
      sourceOperations: monthlyUsage.sourceProcessingOps,
      approxTokens: {
        input: monthlyUsage.approxInputTokens,
        output: monthlyUsage.approxOutputTokens,
        total: monthlyUsage.approxInputTokens + monthlyUsage.approxOutputTokens,
      },
    },
  };
}

const PLAN_CONFIGS = PLANS;

module.exports = {
  PLANS,
  PLAN_CONFIGS,
  getPlan,
  getPlanConfig,
  canUseFeature,
  recordUsage,
  getUserMonthlyUsage,
  checkUsageLimit,
  getUserUsageSummary,
};

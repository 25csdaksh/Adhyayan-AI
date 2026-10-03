const { canUseFeature, checkUsageLimit } = require('../services/usage/entitlementService');
const { getPlan } = require('../config/plans');

/**
 * Middleware to enforce feature gates on API endpoints
 *
 * @param {string} featureName - e.g. 'deepResearch', 'webResearch', 'teamCollaboration'
 */
function requireFeature(featureName) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required to access this feature',
      });
    }

    const allowed = canUseFeature(user, featureName);
    if (!allowed) {
      const planConfig = getPlan(user.plan);
      return res.status(403).json({
        error: 'FEATURE_NOT_AVAILABLE',
        message: `The feature '${featureName}' is not available on your current plan (${planConfig.name}). Please upgrade your plan to continue.`,
        feature: featureName,
        plan: user.plan || 'free',
        upgradeAvailable: true,
      });
    }

    next();
  };
}

/**
 * Middleware to enforce server-side usage quotas
 *
 * @param {'aiRequests'|'researchSessions'|'studyTools'|'notebooks'} metric
 */
function requireQuota(metric) {
  return async (req, res, next) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    try {
      const check = await checkUsageLimit(userId, metric);
      if (!check.allowed) {
        const planConfig = getPlan(req.user?.plan);
        return res.status(429).json({
          error: 'PLAN_LIMIT_REACHED',
          message: `You have reached your monthly limit of ${check.limit} ${metric} on the ${planConfig.name} plan.`,
          metric,
          currentUsage: check.current,
          limit: check.limit,
          plan: req.user?.plan || 'free',
          upgradeAvailable: true,
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  requireFeature,
  requireQuota,
};

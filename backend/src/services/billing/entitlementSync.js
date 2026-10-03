const Subscription = require('../../models/Subscription');
const User = require('../../models/User');
const { getPlan } = require('../../config/plans');

/**
 * Synchronize user's plan and entitlements based on verified subscription state
 *
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @returns {Promise<{ plan: string, status: string, subscription: Object|null }>}
 */
async function syncUserEntitlement(userId) {
  if (!userId) return { plan: 'free', status: 'none', subscription: null };

  const now = new Date();

  // Find most recent active or non-expired canceled subscription
  const sub = await Subscription.findOne({
    userId,
    status: { $in: ['active', 'canceled', 'pending', 'past_due'] },
  })
    .sort({ createdAt: -1 })
    .lean();

  let effectivePlan = 'free';
  let effectiveStatus = 'none';

  if (sub) {
    const isPeriodValid = !sub.currentPeriodEnd || new Date(sub.currentPeriodEnd) > now;

    if (sub.status === 'active' && !sub.cancelAtPeriodEnd && isPeriodValid) {
      effectivePlan = sub.plan;
      effectiveStatus = 'active';
    } else if ((sub.cancelAtPeriodEnd || sub.status === 'canceled') && isPeriodValid) {
      // Grace / remaining paid period until currentPeriodEnd
      effectivePlan = sub.plan;
      effectiveStatus = 'canceled_grace_period';
    } else if (sub.status === 'past_due' && isPeriodValid) {
      // Short grace period during retry
      effectivePlan = sub.plan;
      effectiveStatus = 'past_due';
    } else {
      // Expired or period ended
      effectivePlan = 'free';
      effectiveStatus = 'expired';

      // Update subscription record to expired if it was active/canceled
      if (sub.status !== 'expired') {
        await Subscription.findByIdAndUpdate(sub._id, { status: 'expired' });
      }
    }
  }

  // Atomically update user document if plan changed
  const user = await User.findById(userId).select('plan').lean();
  if (user && user.plan !== effectivePlan) {
    await User.findByIdAndUpdate(userId, { plan: effectivePlan });
  }

  return {
    plan: effectivePlan,
    status: effectiveStatus,
    subscription: sub,
  };
}

module.exports = {
  syncUserEntitlement,
};

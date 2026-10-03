const crypto = require('crypto');
const User = require('../../models/User');
const Subscription = require('../../models/Subscription');
const Payment = require('../../models/Payment');
const BillingEvent = require('../../models/BillingEvent');
const { getBillingProvider } = require('./providers/providerFactory');
const { getPlan } = require('../../config/plans');
const { syncUserEntitlement } = require('./entitlementSync');
const BillingNotificationService = require('./billingNotificationService');

/**
 * Initialize a secure, server-authoritative checkout session
 *
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @param {string} requestedPlanKey
 * @param {string} [billingCycle='monthly']
 * @returns {Promise<Object>} Safe checkout payload for client
 */
async function createCheckout(userId, requestedPlanKey, billingCycle = 'monthly') {
  if (!userId) {
    throw new Error('User ID is required to create checkout');
  }

  const plan = getPlan(requestedPlanKey);
  if (!plan || plan.key === 'free') {
    throw new Error('Invalid subscription plan specified');
  }

  const user = await User.findById(userId).select('name email plan').lean();
  if (!user) {
    throw new Error('User not found');
  }

  const provider = getBillingProvider();
  const session = await provider.createCheckoutSession({
    userId,
    userEmail: user.email,
    userName: user.name,
    plan,
    billingCycle,
  });

  // Calculate 30-day billing cycle dates
  const periodStart = new Date();
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Upsert or create pending Subscription record
  const subscription = await Subscription.findOneAndUpdate(
    { userId, providerOrderId: session.orderId },
    {
      $set: {
        userId,
        provider: provider.name,
        providerOrderId: session.orderId,
        plan: plan.key,
        status: 'created',
        billingCycle,
        amount: plan.price,
        currency: plan.currency,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
    },
    { upsert: true, new: true }
  );

  // Create initial pending payment record
  await Payment.create({
    userId,
    subscriptionId: subscription._id,
    provider: provider.name,
    providerOrderId: session.orderId,
    amount: plan.price,
    currency: plan.currency,
    status: 'created',
    metadata: {
      planKey: plan.key,
      billingCycle,
    },
  });

  return {
    orderId: session.orderId,
    amount: session.amount,
    amountInPaise: session.amountInPaise,
    currency: session.currency,
    keyId: session.keyId,
    planKey: plan.key,
    planName: plan.name,
    prefill: session.prefill,
    provider: provider.name,
  };
}

/**
 * Verify client-side checkout completion and activate subscription
 *
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @param {Object} verificationData
 * @param {string} verificationData.orderId
 * @param {string} verificationData.paymentId
 * @param {string} verificationData.signature
 * @param {string} [verificationData.planKey]
 * @returns {Promise<Object>}
 */
async function verifyPayment(userId, { orderId, paymentId, signature, planKey }) {
  if (!userId || !orderId || !paymentId || !signature) {
    throw new Error('Missing required payment verification parameters');
  }

  const provider = getBillingProvider();
  const isValid = provider.verifyPaymentSignature({ orderId, paymentId, signature });

  if (!isValid) {
    // Record failed payment attempt
    await Payment.findOneAndUpdate(
      { providerOrderId: orderId },
      {
        $set: {
          providerPaymentId: paymentId,
          status: 'failed',
          failureReason: 'Invalid payment signature verification',
        },
      }
    );
    throw new Error('Payment signature verification failed');
  }

  // Find associated subscription
  let subscription = await Subscription.findOne({ providerOrderId: orderId });
  const resolvedPlanKey = planKey || subscription?.plan || 'pro';
  const plan = getPlan(resolvedPlanKey);

  const now = new Date();
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  if (subscription) {
    subscription.status = 'active';
    subscription.plan = plan.key;
    subscription.currentPeriodStart = now;
    subscription.currentPeriodEnd = periodEnd;
    subscription.cancelAtPeriodEnd = false;
    subscription.canceledAt = null;
    await subscription.save();
  } else {
    subscription = await Subscription.create({
      userId,
      provider: provider.name,
      providerOrderId: orderId,
      plan: plan.key,
      status: 'active',
      billingCycle: 'monthly',
      amount: plan.price,
      currency: plan.currency,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    });
  }

  // Record captured payment
  await Payment.findOneAndUpdate(
    { providerOrderId: orderId },
    {
      $set: {
        userId,
        subscriptionId: subscription._id,
        provider: provider.name,
        providerPaymentId: paymentId,
        providerOrderId: orderId,
        amount: plan.price,
        currency: plan.currency,
        status: 'captured',
        paidAt: now,
      },
    },
    { upsert: true, new: true }
  );

  // Synchronize user entitlements
  await syncUserEntitlement(userId);

  // Send notification hook
  await BillingNotificationService.notify('payment.success', {
    userId,
    plan: plan.key,
    amount: plan.price,
    currency: plan.currency,
    paymentId,
  });

  return {
    success: true,
    plan: plan.key,
    planName: plan.name,
    subscriptionId: subscription._id,
    periodEnd: subscription.currentPeriodEnd,
  };
}

/**
 * Handle incoming payment provider webhook idempotently
 *
 * @param {string|Buffer} rawBody
 * @param {string} signature
 * @param {Object} parsedBody
 * @returns {Promise<Object>}
 */
async function handleWebhook(rawBody, signature, parsedBody = {}) {
  const provider = getBillingProvider();

  // 1. Cryptographic signature check
  const isValid = provider.verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    const err = new Error('Invalid webhook signature');
    err.status = 400;
    throw err;
  }

  // 2. Extract standardized event data
  const body = typeof parsedBody === 'object' && Object.keys(parsedBody).length > 0
    ? parsedBody
    : JSON.parse(rawBody.toString('utf8'));

  const event = provider.parseWebhookEvent(body);
  const payloadHash = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');

  // 3. Check idempotency in BillingEvent collection
  const existingEvent = await BillingEvent.findOne({ eventId: event.eventId });
  if (existingEvent && existingEvent.processed) {
    return {
      received: true,
      idempotent: true,
      message: `Event ${event.eventId} already processed at ${existingEvent.processedAt}`,
    };
  }

  // Create or record pending billing event
  const billingEvent = existingEvent || (await BillingEvent.create({
    provider: provider.name,
    eventId: event.eventId,
    eventType: event.eventType,
    payloadHash,
    payload: body,
  }));

  try {
    const now = new Date();
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // 4. Handle event types
    switch (event.eventType) {
      case 'payment.captured':
      case 'order.paid': {
        if (event.userId) {
          const plan = getPlan(event.planKey);

          let sub = event.orderId ? await Subscription.findOne({ providerOrderId: event.orderId }) : null;
          if (!sub) {
            sub = await Subscription.create({
              userId: event.userId,
              provider: provider.name,
              providerOrderId: event.orderId,
              plan: plan.key,
              status: 'active',
              billingCycle: 'monthly',
              amount: event.amount || plan.price,
              currency: event.currency || plan.currency,
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
            });
          } else {
            sub.status = 'active';
            sub.plan = plan.key;
            sub.currentPeriodStart = now;
            sub.currentPeriodEnd = periodEnd;
            await sub.save();
          }

          await Payment.findOneAndUpdate(
            { providerPaymentId: event.paymentId },
            {
              $set: {
                userId: event.userId,
                subscriptionId: sub._id,
                provider: provider.name,
                providerPaymentId: event.paymentId,
                providerOrderId: event.orderId,
                amount: event.amount || plan.price,
                currency: event.currency || 'INR',
                status: 'captured',
                paidAt: now,
              },
            },
            { upsert: true }
          );

          await syncUserEntitlement(event.userId);
          await BillingNotificationService.notify('payment.success', {
            userId: event.userId,
            plan: plan.key,
            amount: event.amount,
            currency: event.currency,
          });
        }
        break;
      }

      case 'payment.failed': {
        if (event.userId && event.paymentId) {
          await Payment.findOneAndUpdate(
            { providerPaymentId: event.paymentId },
            {
              $set: {
                userId: event.userId,
                provider: provider.name,
                providerPaymentId: event.paymentId,
                providerOrderId: event.orderId,
                amount: event.amount || 0,
                currency: event.currency || 'INR',
                status: 'failed',
                failureReason: 'Payment gateway reported failure',
              },
            },
            { upsert: true }
          );

          await BillingNotificationService.notify('payment.failed', {
            userId: event.userId,
            paymentId: event.paymentId,
          });
        }
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.canceled': {
        if (event.userId || event.subscriptionId) {
          const query = event.subscriptionId
            ? { providerSubscriptionId: event.subscriptionId }
            : { userId: event.userId, status: 'active' };

          const sub = await Subscription.findOne(query);
          if (sub) {
            sub.status = 'canceled';
            sub.canceledAt = now;
            sub.cancelAtPeriodEnd = true;
            await sub.save();
            await syncUserEntitlement(sub.userId);
            await BillingNotificationService.notify('subscription.canceled', {
              userId: sub.userId,
              plan: sub.plan,
            });
          }
        }
        break;
      }

      default:
        // Generic acknowledgment for other events
        break;
    }

    // Mark billing event as processed
    billingEvent.processed = true;
    billingEvent.processedAt = new Date();
    await billingEvent.save();

    return {
      received: true,
      processed: true,
      eventId: event.eventId,
      eventType: event.eventType,
    };
  } catch (err) {
    billingEvent.error = err.message;
    await billingEvent.save();
    throw err;
  }
}

/**
 * Get user's active subscription information
 *
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @returns {Promise<Object>}
 */
async function getUserSubscription(userId) {
  if (!userId) return null;

  // Sync entitlement first to ensure accuracy
  const { plan: effectivePlan, status: effectiveStatus, subscription: sub } = await syncUserEntitlement(userId);
  const planConfig = getPlan(effectivePlan);

  const now = new Date();
  let daysRemaining = null;
  if (sub?.currentPeriodEnd) {
    const msDiff = new Date(sub.currentPeriodEnd).getTime() - now.getTime();
    daysRemaining = Math.max(0, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
  }

  return {
    plan: effectivePlan,
    planName: planConfig.name,
    status: effectiveStatus,
    amount: sub?.amount ?? planConfig.price,
    currency: sub?.currency ?? planConfig.currency,
    billingCycle: sub?.billingCycle ?? 'monthly',
    currentPeriodStart: sub?.currentPeriodStart ?? null,
    currentPeriodEnd: sub?.currentPeriodEnd ?? null,
    daysRemaining,
    cancelAtPeriodEnd: Boolean(sub?.cancelAtPeriodEnd),
    canceledAt: sub?.canceledAt ?? null,
    isPaid: effectivePlan !== 'free',
  };
}

/**
 * Get user's payment transaction history
 *
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @returns {Promise<Array<Object>>}
 */
async function getUserPayments(userId) {
  if (!userId) return [];

  const payments = await Payment.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return payments.map((p) => ({
    id: p._id,
    orderId: p.providerOrderId,
    paymentId: p.providerPaymentId,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    paidAt: p.paidAt || p.createdAt,
    failureReason: p.failureReason,
    createdAt: p.createdAt,
  }));
}

/**
 * Cancel an active user subscription
 *
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @param {Object} [options]
 * @param {boolean} [options.cancelImmediately=false]
 * @returns {Promise<Object>}
 */
async function cancelSubscription(userId, { cancelImmediately = false } = {}) {
  const sub = await Subscription.findOne({
    userId,
    status: 'active',
  });

  if (!sub) {
    throw new Error('No active subscription found to cancel');
  }

  const provider = getBillingProvider();
  if (sub.providerSubscriptionId) {
    try {
      await provider.cancelSubscription(sub.providerSubscriptionId, !cancelImmediately);
    } catch (err) {
      console.warn('[Billing Warning] Failed to cancel at provider:', err.message);
    }
  }

  const now = new Date();
  if (cancelImmediately) {
    sub.status = 'canceled';
    sub.canceledAt = now;
    sub.currentPeriodEnd = now;
  } else {
    sub.cancelAtPeriodEnd = true;
    sub.canceledAt = now;
  }

  await sub.save();
  await syncUserEntitlement(userId);

  await BillingNotificationService.notify('subscription.canceled', {
    userId,
    plan: sub.plan,
    cancelImmediately,
  });

  return {
    canceled: true,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    effectiveUntil: sub.currentPeriodEnd,
  };
}

/**
 * Resume a subscription that was scheduled to cancel at period end
 *
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @returns {Promise<Object>}
 */
async function resumeSubscription(userId) {
  const sub = await Subscription.findOne({
    userId,
    cancelAtPeriodEnd: true,
  });

  if (!sub) {
    throw new Error('No pending canceled subscription found to resume');
  }

  const provider = getBillingProvider();
  if (sub.providerSubscriptionId) {
    try {
      await provider.resumeSubscription(sub.providerSubscriptionId);
    } catch (err) {
      console.warn('[Billing Warning] Failed to resume at provider:', err.message);
    }
  }

  sub.cancelAtPeriodEnd = false;
  sub.canceledAt = null;
  sub.status = 'active';
  await sub.save();

  await syncUserEntitlement(userId);

  return {
    resumed: true,
    plan: sub.plan,
    currentPeriodEnd: sub.currentPeriodEnd,
  };
}

module.exports = {
  createCheckout,
  verifyPayment,
  handleWebhook,
  getUserSubscription,
  getUserPayments,
  cancelSubscription,
  resumeSubscription,
};

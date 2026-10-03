const billingService = require('../services/billing/billingService');
const { getAllPlans } = require('../config/plans');

/**
 * Get all available plans
 */
async function getPlans(req, res, next) {
  try {
    const plans = getAllPlans();
    return res.status(200).json({
      success: true,
      plans,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get active user subscription
 */
async function getSubscription(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const subscription = await billingService.getUserSubscription(userId);
    return res.status(200).json({
      success: true,
      subscription,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get user payment history
 */
async function getPaymentHistory(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const payments = await billingService.getUserPayments(userId);
    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Initialize checkout session
 */
async function checkout(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { plan, billingCycle } = req.body;

    if (!plan) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'Plan is required to initialize checkout',
      });
    }

    const session = await billingService.createCheckout(userId, plan, billingCycle);
    return res.status(200).json({
      success: true,
      checkout: session,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Verify client payment completion
 */
async function verifyPayment(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { orderId, paymentId, signature, planKey } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'Missing orderId, paymentId, or signature for payment verification',
      });
    }

    const result = await billingService.verifyPayment(userId, {
      orderId,
      paymentId,
      signature,
      planKey,
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified and subscription activated successfully',
      result,
    });
  } catch (err) {
    return res.status(400).json({
      error: 'PAYMENT_VERIFICATION_FAILED',
      message: err.message,
    });
  }
}

/**
 * Cancel active subscription
 */
async function cancelSubscription(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { cancelImmediately } = req.body;

    const result = await billingService.cancelSubscription(userId, {
      cancelImmediately: Boolean(cancelImmediately),
    });

    return res.status(200).json({
      success: true,
      message: 'Subscription canceled successfully',
      result,
    });
  } catch (err) {
    return res.status(400).json({
      error: 'CANCELLATION_FAILED',
      message: err.message,
    });
  }
}

/**
 * Resume a canceled subscription
 */
async function resumeSubscription(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const result = await billingService.resumeSubscription(userId);

    return res.status(200).json({
      success: true,
      message: 'Subscription resumed successfully',
      result,
    });
  } catch (err) {
    return res.status(400).json({
      error: 'RESUME_FAILED',
      message: err.message,
    });
  }
}

/**
 * Handle incoming payment provider webhook
 */
async function handleWebhook(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'] || req.headers['stripe-signature'] || req.headers['x-webhook-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const result = await billingService.handleWebhook(rawBody, signature, req.body);
    return res.status(200).json({
      status: 'ok',
      result,
    });
  } catch (err) {
    console.error('[Billing Webhook Error]:', err.message);
    return res.status(err.status || 400).json({
      error: 'WEBHOOK_PROCESSING_FAILED',
      message: err.message,
    });
  }
}

module.exports = {
  getPlans,
  getSubscription,
  getPaymentHistory,
  checkout,
  verifyPayment,
  cancelSubscription,
  resumeSubscription,
  handleWebhook,
};

/**
 * Provider-Agnostic Billing Notification Service
 * Supports development mock logging and extensible email/webhook integrations.
 */
class BillingNotificationService {
  /**
   * Send notification for billing lifecycle events
   *
   * @param {string} event - e.g. 'payment.success', 'payment.failed', 'subscription.activated', 'subscription.canceled'
   * @param {Object} data - event context
   */
  static async notify(event, data = {}) {
    const timestamp = new Date().toISOString();
    const payload = {
      event,
      timestamp,
      userId: data.userId || null,
      email: data.email || null,
      plan: data.plan || null,
      amount: data.amount || null,
      currency: data.currency || 'INR',
      status: data.status || 'success',
    };

    // Structured observability logging
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[Billing Notification] [${timestamp}] ${event}:`, JSON.stringify(payload));
    }

    return { sent: true, payload };
  }
}

module.exports = BillingNotificationService;

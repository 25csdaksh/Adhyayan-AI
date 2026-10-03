const crypto = require('crypto');
const BillingProviderInterface = require('./billingProviderInterface');

/**
 * Mock Billing Provider for Unit/Integration Testing and Zero-Credentials Local Dev
 */
class MockBillingProvider extends BillingProviderInterface {
  constructor() {
    super('mock');
    this.mockSecret = 'mock_studylm_webhook_secret_for_tests';
  }

  async createCheckoutSession({ userId, userEmail, userName, plan, billingCycle }) {
    const orderId = `mock_order_${crypto.randomBytes(6).toString('hex')}`;
    return {
      provider: 'mock',
      orderId,
      amount: plan.price,
      amountInPaise: Math.round(plan.price * 100),
      currency: plan.currency || 'INR',
      keyId: 'mock_key_id',
      planKey: plan.key,
      planName: plan.name,
      prefill: {
        name: userName || '',
        email: userEmail || '',
      },
      notes: {
        userId: userId.toString(),
        planKey: plan.key,
        billingCycle,
      },
    };
  }

  verifyPaymentSignature({ orderId, paymentId, signature }) {
    if (!orderId || !paymentId || !signature) return false;
    // In mock mode, if signature equals the HMAC or starts with 'mock_valid_sig', it passes
    if (signature.startsWith('mock_valid_sig')) return true;
    const text = `${orderId}|${paymentId}`;
    const expected = crypto.createHmac('sha256', this.mockSecret).update(text).digest('hex');
    return expected === signature;
  }

  verifyWebhookSignature(rawBody, signature) {
    if (!rawBody || !signature) return false;
    if (signature === 'mock_valid_webhook_sig') return true;
    try {
      const bodyStr = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
      const expected = crypto.createHmac('sha256', this.mockSecret).update(bodyStr).digest('hex');
      return expected === signature;
    } catch {
      return false;
    }
  }

  parseWebhookEvent(body) {
    const event = body.event || body.eventType || 'payment.captured';
    const eventId = body.id || body.eventId || `mock_evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const payload = body.payload || body;

    return {
      eventId,
      eventType: event,
      paymentId: payload.paymentId || payload.payment?.entity?.id || `mock_pay_${Date.now()}`,
      orderId: payload.orderId || payload.payment?.entity?.order_id || null,
      subscriptionId: payload.subscriptionId || payload.subscription?.entity?.id || null,
      amount: payload.amount || (payload.payment?.entity?.amount ? payload.payment.entity.amount / 100 : 999),
      currency: payload.currency || 'INR',
      status: payload.status || 'captured',
      userId: payload.userId || payload.notes?.userId || payload.payment?.entity?.notes?.userId || null,
      planKey: payload.planKey || payload.notes?.planKey || payload.payment?.entity?.notes?.planKey || 'pro',
      raw: body,
    };
  }

  async retrieveSubscription(providerSubscriptionId) {
    return {
      id: providerSubscriptionId,
      status: 'active',
      current_end: Math.floor(Date.now() / 1000) + 30 * 86400,
    };
  }

  async cancelSubscription(providerSubscriptionId, atPeriodEnd = true) {
    return {
      id: providerSubscriptionId,
      status: 'canceled',
      cancel_at_period_end: atPeriodEnd,
    };
  }

  async resumeSubscription(providerSubscriptionId) {
    return {
      id: providerSubscriptionId,
      status: 'active',
    };
  }
}

module.exports = MockBillingProvider;

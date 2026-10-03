const crypto = require('crypto');
const https = require('https');
const BillingProviderInterface = require('./billingProviderInterface');
const config = require('../../../config/env');

/**
 * Production Razorpay Billing Provider Implementation
 */
class RazorpayProvider extends BillingProviderInterface {
  constructor(options = {}) {
    super('razorpay');
    this.keyId = options.keyId || config.billing.razorpay.keyId;
    this.keySecret = options.keySecret || config.billing.razorpay.keySecret;
    this.webhookSecret = options.webhookSecret || config.billing.razorpay.webhookSecret;
  }

  /**
   * Helper to execute authenticated Razorpay REST requests
   */
  async _request(method, endpoint, data = null) {
    if (!this.keyId || !this.keySecret) {
      throw new Error('Razorpay API credentials not configured');
    }

    return new Promise((resolve, reject) => {
      const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
      const payload = data ? JSON.stringify(data) : null;

      const options = {
        hostname: 'api.razorpay.com',
        port: 443,
        path: `/v1${endpoint}`,
        method,
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body || '{}');
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(parsed.error?.description || `Razorpay API error ${res.statusCode}`));
            }
          } catch (err) {
            reject(new Error(`Failed to parse Razorpay API response: ${err.message}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(15000, () => {
        req.destroy(new Error('Razorpay request timeout'));
      });

      if (payload) {
        req.write(payload);
      }
      req.end();
    });
  }

  /**
   * Create Razorpay Order for Checkout
   */
  async createCheckoutSession({ userId, userEmail, userName, plan, billingCycle }) {
    const amountInPaise = Math.round(plan.price * 100);
    const receipt = `rcpt_${userId.toString().slice(-8)}_${Date.now().toString().slice(-6)}`;

    // If live credentials exist, create Razorpay Order via API; else generate deterministic orderId
    let orderId;
    if (this.keyId && this.keySecret) {
      const order = await this._request('POST', '/orders', {
        amount: amountInPaise,
        currency: plan.currency || 'INR',
        receipt,
        notes: {
          userId: userId.toString(),
          planKey: plan.key,
          billingCycle,
        },
      });
      orderId = order.id;
    } else {
      // Deterministic fallback for dev/sandbox mode without real secrets
      orderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    }

    return {
      provider: 'razorpay',
      orderId,
      amount: plan.price,
      amountInPaise,
      currency: plan.currency || 'INR',
      keyId: this.keyId || 'rzp_test_mock_key',
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

  /**
   * Verify Payment Signature from client checkout completion
   */
  verifyPaymentSignature({ orderId, paymentId, signature }) {
    if (!orderId || !paymentId || !signature) return false;
    const secret = this.keySecret || 'rzp_test_mock_secret';
    const text = `${orderId}|${paymentId}`;
    const expected = crypto.createHmac('sha256', secret).update(text).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }

  /**
   * Verify Razorpay Webhook Signature
   */
  verifyWebhookSignature(rawBody, signature) {
    if (!rawBody || !signature) return false;
    const secret = this.webhookSecret || 'rzp_test_webhook_secret';
    try {
      const bodyStr = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
      const expected = crypto.createHmac('sha256', secret).update(bodyStr).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  /**
   * Parse Razorpay Webhook Event
   */
  parseWebhookEvent(body) {
    const event = body.event || 'unknown';
    const eventId = body.id || `evt_${crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex').slice(0, 16)}`;
    const payload = body.payload || {};

    let extracted = {
      eventId,
      eventType: event,
      paymentId: payload.payment?.entity?.id || null,
      orderId: payload.payment?.entity?.order_id || payload.order?.entity?.id || null,
      subscriptionId: payload.subscription?.entity?.id || null,
      amount: payload.payment?.entity?.amount ? payload.payment.entity.amount / 100 : null,
      currency: payload.payment?.entity?.currency || 'INR',
      status: payload.payment?.entity?.status || null,
      userId: payload.payment?.entity?.notes?.userId || payload.subscription?.entity?.notes?.userId || null,
      planKey: payload.payment?.entity?.notes?.planKey || payload.subscription?.entity?.notes?.planKey || 'pro',
      raw: body,
    };

    return extracted;
  }

  /**
   * Retrieve Subscription status
   */
  async retrieveSubscription(providerSubscriptionId) {
    if (this.keyId && this.keySecret && providerSubscriptionId) {
      return await this._request('GET', `/subscriptions/${providerSubscriptionId}`);
    }
    return { id: providerSubscriptionId, status: 'active' };
  }

  /**
   * Cancel subscription on Razorpay
   */
  async cancelSubscription(providerSubscriptionId, atPeriodEnd = true) {
    if (this.keyId && this.keySecret && providerSubscriptionId) {
      return await this._request('POST', `/subscriptions/${providerSubscriptionId}/cancel`, {
        cancel_at_cycle_end: atPeriodEnd ? 1 : 0,
      });
    }
    return { id: providerSubscriptionId, status: 'cancelled' };
  }

  /**
   * Resume / re-enable subscription on Razorpay
   */
  async resumeSubscription(providerSubscriptionId) {
    if (this.keyId && this.keySecret && providerSubscriptionId) {
      return await this._request('POST', `/subscriptions/${providerSubscriptionId}/resume`);
    }
    return { id: providerSubscriptionId, status: 'active' };
  }
}

module.exports = RazorpayProvider;

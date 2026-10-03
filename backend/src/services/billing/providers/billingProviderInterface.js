/**
 * Abstract Billing Provider Interface
 */
class BillingProviderInterface {
  constructor(name) {
    this.name = name;
  }

  /**
   * Create checkout session or order on the payment provider
   *
   * @param {Object} params
   * @param {string} params.userId
   * @param {string} params.userEmail
   * @param {string} params.userName
   * @param {Object} params.plan
   * @param {string} params.billingCycle
   * @returns {Promise<{ orderId: string, amount: number, currency: string, keyId: string, [key: string]: any }>}
   */
  async createCheckoutSession(params) {
    throw new Error('Method createCheckoutSession() must be implemented');
  }

  /**
   * Verify client payment confirmation signature
   *
   * @param {Object} params
   * @param {string} params.orderId
   * @param {string} params.paymentId
   * @param {string} params.signature
   * @returns {boolean}
   */
  verifyPaymentSignature(params) {
    throw new Error('Method verifyPaymentSignature() must be implemented');
  }

  /**
   * Verify incoming webhook cryptographic signature
   *
   * @param {string|Buffer} rawBody
   * @param {string} signature
   * @returns {boolean}
   */
  verifyWebhookSignature(rawBody, signature) {
    throw new Error('Method verifyWebhookSignature() must be implemented');
  }

  /**
   * Parse webhook payload and extract standardized event
   *
   * @param {Object} body
   * @returns {{ eventId: string, eventType: string, data: any }}
   */
  parseWebhookEvent(body) {
    throw new Error('Method parseWebhookEvent() must be implemented');
  }

  /**
   * Retrieve subscription status from provider
   *
   * @param {string} providerSubscriptionId
   * @returns {Promise<Object>}
   */
  async retrieveSubscription(providerSubscriptionId) {
    throw new Error('Method retrieveSubscription() must be implemented');
  }

  /**
   * Cancel subscription on provider
   *
   * @param {string} providerSubscriptionId
   * @param {boolean} atPeriodEnd
   * @returns {Promise<Object>}
   */
  async cancelSubscription(providerSubscriptionId, atPeriodEnd = true) {
    throw new Error('Method cancelSubscription() must be implemented');
  }

  /**
   * Resume subscription on provider
   *
   * @param {string} providerSubscriptionId
   * @returns {Promise<Object>}
   */
  async resumeSubscription(providerSubscriptionId) {
    throw new Error('Method resumeSubscription() must be implemented');
  }
}

module.exports = BillingProviderInterface;

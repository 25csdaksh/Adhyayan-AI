import apiClient from './apiClient';

/**
 * Frontend Billing API Service
 */
export const billingService = {
  /**
   * Fetch all available plans
   */
  async getPlans() {
    const res = await apiClient.get('/billing/plans');
    return res.plans || [];
  },

  /**
   * Fetch user's active subscription
   */
  async getSubscription() {
    const res = await apiClient.get('/billing/subscription');
    return res.subscription || null;
  },

  /**
   * Fetch user payment transaction history
   */
  async getPayments() {
    const res = await apiClient.get('/billing/payments');
    return res.payments || [];
  },

  /**
   * Initialize a checkout session
   *
   * @param {string} plan - 'pro' | 'enterprise'
   * @param {string} [billingCycle='monthly']
   */
  async checkout(plan, billingCycle = 'monthly') {
    const res = await apiClient.post('/billing/checkout', { plan, billingCycle });
    return res.checkout;
  },

  /**
   * Verify client payment confirmation
   */
  async verifyPayment({ orderId, paymentId, signature, planKey }) {
    return await apiClient.post('/billing/verify', {
      orderId,
      paymentId,
      signature,
      planKey,
    });
  },

  /**
   * Cancel active subscription
   */
  async cancelSubscription(cancelImmediately = false) {
    return await apiClient.post('/billing/cancel', { cancelImmediately });
  },

  /**
   * Resume subscription
   */
  async resumeSubscription() {
    return await apiClient.post('/billing/resume');
  },
};

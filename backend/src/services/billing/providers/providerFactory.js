const RazorpayProvider = require('./razorpayProvider');
const MockBillingProvider = require('./mockBillingProvider');
const config = require('../../../config/env');

let currentProvider = null;

/**
 * Get active payment provider instance
 *
 * @returns {import('./billingProviderInterface')}
 */
function getBillingProvider() {
  if (currentProvider) return currentProvider;

  const providerName = (config.billing.provider || 'razorpay').toLowerCase();

  if (providerName === 'mock' || process.env.NODE_ENV === 'test') {
    currentProvider = new MockBillingProvider();
  } else if (providerName === 'razorpay') {
    currentProvider = new RazorpayProvider();
  } else {
    // Default fallback to Razorpay or Mock
    currentProvider = config.billing.razorpay.keyId
      ? new RazorpayProvider()
      : new MockBillingProvider();
  }

  return currentProvider;
}

/**
 * Set custom provider instance (used during unit testing)
 *
 * @param {import('./billingProviderInterface')} provider
 */
function setBillingProvider(provider) {
  currentProvider = provider;
}

module.exports = {
  getBillingProvider,
  setBillingProvider,
};

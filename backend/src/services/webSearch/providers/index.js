const { searchDuckDuckGo } = require('./duckduckgo');
const config = require('../../../config/env');

const providers = {
  duckduckgo: searchDuckDuckGo,
  none: async () => [],
};

/**
 * Get active search provider
 * @param {string} [name]
 * @returns {Function}
 */
function getProvider(name = config.webSearch?.provider || 'none') {
  const cleanName = (name || 'none').toLowerCase();
  return providers[cleanName] || providers.none;
}

module.exports = {
  getProvider,
  providers,
};

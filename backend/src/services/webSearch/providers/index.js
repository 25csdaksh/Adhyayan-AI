const { searchDuckDuckGo } = require('./duckduckgo');
const config = require('../../../config/env');

const providers = {
  duckduckgo: searchDuckDuckGo,
};

/**
 * Get active search provider
 * @param {string} [name]
 * @returns {Function}
 */
function getProvider(name = config.webSearch?.provider || 'duckduckgo') {
  return providers[name.toLowerCase()] || searchDuckDuckGo;
}

module.exports = {
  getProvider,
  providers,
};

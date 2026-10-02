const config = require('../../config/env');
const { getProvider } = require('./providers');
const { validateUrlForSsrf } = require('../web/webSecurity');

/**
 * Execute web search query and return normalized, SSRF-validated results
 *
 * @param {string} query
 * @param {Object} [options]
 * @param {number} [options.limit]
 * @returns {Promise<Array<{ title: string, url: string, snippet: string, domain: string, publishedAt: Date|null }>>}
 */
async function searchWeb(query, options = {}) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return [];
  }

  const cleanQuery = query.trim();
  const maxLimit = Math.min(
    config.research?.maxSearchResults || 5,
    Math.max(1, options.limit || 5)
  );

  const providerFn = getProvider();
  let rawResults = [];

  try {
    rawResults = await providerFn(cleanQuery, { limit: maxLimit });
  } catch (err) {
    console.warn('[WebSearch Warning] Search provider error:', err.message);
    return [];
  }

  if (!Array.isArray(rawResults)) {
    return [];
  }

  const validatedResults = [];

  for (const item of rawResults) {
    if (!item || !item.url || !item.title) continue;

    // Fast protocol check
    if (!item.url.startsWith('http://') && !item.url.startsWith('https://')) {
      continue;
    }

    // SSRF validation on search result URL before exposing or fetching
    const validation = await validateUrlForSsrf(item.url);
    if (validation.valid) {
      validatedResults.push({
        title: item.title.trim().slice(0, 300),
        url: item.url.trim(),
        snippet: (item.snippet || '').trim().slice(0, 1000),
        domain: item.domain || '',
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
      });
    }

    if (validatedResults.length >= maxLimit) {
      break;
    }
  }

  return validatedResults;
}

module.exports = {
  searchWeb,
};

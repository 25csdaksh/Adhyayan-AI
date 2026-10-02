const crypto = require('crypto');

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'msclkid',
  'mc_cid',
  'mc_eid',
  'ref',
  'ref_src',
  '_ga',
  '_gl',
]);

/**
 * Normalize and canonicalize a URL
 * @param {string} rawUrl
 * @returns {string}
 */
function canonicalizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';

  try {
    const parsed = new URL(rawUrl.trim());

    // Normalize protocol & hostname
    parsed.protocol = parsed.protocol.toLowerCase();
    parsed.hostname = parsed.hostname.toLowerCase();

    // Strip default ports
    if ((parsed.protocol === 'http:' && parsed.port === '80') ||
        (parsed.protocol === 'https:' && parsed.port === '443')) {
      parsed.port = '';
    }

    // Strip fragment/hash
    parsed.hash = '';

    // Strip tracking query parameters
    const paramsToDelete = [];
    for (const [key] of parsed.searchParams.entries()) {
      if (TRACKING_PARAMS.has(key.toLowerCase()) || key.toLowerCase().startsWith('utm_')) {
        paramsToDelete.push(key);
      }
    }
    for (const key of paramsToDelete) {
      parsed.searchParams.delete(key);
    }

    // Normalize path trailing slash (unless it's just root '/')
    let path = parsed.pathname;
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    parsed.pathname = path;

    return parsed.toString();
  } catch {
    return rawUrl.trim();
  }
}

/**
 * Extract clean domain name from URL
 * @param {string} urlString
 * @returns {string}
 */
function extractDomain(urlString) {
  try {
    const parsed = new URL(urlString);
    return parsed.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Generate SHA-256 hash of extracted text content
 * @param {string} text
 * @returns {string}
 */
function computeContentHash(text) {
  if (!text || typeof text !== 'string') return '';
  return crypto.createHash('sha256').update(text.trim()).digest('hex');
}

module.exports = {
  canonicalizeUrl,
  extractDomain,
  computeContentHash,
};

const dns = require('dns').promises;
const ipaddr = require('ipaddr.js');

// Blocked special and cloud metadata hosts
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  'metadata.internal',
  'instance-data',
  '169.254.169.254',
]);

/**
 * Check whether an IP string is private, loopback, link-local, or reserved
 * @param {string} ipString
 * @returns {boolean}
 */
function isRestrictedIp(ipString) {
  try {
    const parsed = ipaddr.process(ipString);
    const range = parsed.range();

    const blockedRanges = [
      'loopback',
      'private',
      'linkLocal',
      'carrierGradeNat',
      'multicast',
      'reserved',
      'broadcast',
      'uniqueLocal',
    ];

    if (blockedRanges.includes(range)) {
      return true;
    }

    // Explicit check for cloud metadata IP 169.254.169.254
    if (parsed.kind() === 'ipv4' && parsed.toString() === '169.254.169.254') {
      return true;
    }

    return false;
  } catch {
    return true; // If IP fails parsing, reject for safety
  }
}

/**
 * Validate URL scheme, hostname, and resolve DNS to prevent SSRF
 * @param {string} urlString
 * @returns {Promise<{ valid: boolean, parsedUrl: URL, ip: string, error?: string }>}
 */
async function validateUrlForSsrf(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    return { valid: false, error: 'URL string is required' };
  }

  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    return { valid: false, error: 'Malformed URL format' };
  }

  // Scheme verification: strictly allow http and https
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return {
      valid: false,
      error: `Unsupported protocol scheme: ${parsed.protocol}. Only http and https are allowed.`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Hostname blocklist
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
    return {
      valid: false,
      error: 'Access to localhost, local network, or cloud metadata endpoints is strictly blocked.',
    };
  }

  // If hostname is directly an IP literal
  if (ipaddr.isValid(hostname)) {
    if (isRestrictedIp(hostname)) {
      return {
        valid: false,
        error: 'Access to private or restricted IP addresses is strictly blocked.',
      };
    }
    return { valid: true, parsedUrl: parsed, ip: hostname };
  }

  // Perform DNS resolution lookup
  try {
    const lookupResult = await dns.lookup(hostname, { all: true });
    if (!lookupResult || lookupResult.length === 0) {
      return { valid: false, error: 'Failed to resolve hostname DNS' };
    }

    for (const record of lookupResult) {
      if (isRestrictedIp(record.address)) {
        return {
          valid: false,
          error: `Resolved IP address ${record.address} is restricted (SSRF protection).`,
        };
      }
    }

    return { valid: true, parsedUrl: parsed, ip: lookupResult[0].address };
  } catch (dnsErr) {
    return { valid: false, error: `DNS resolution failed: ${dnsErr.message}` };
  }
}

module.exports = {
  isRestrictedIp,
  validateUrlForSsrf,
};

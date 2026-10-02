const axios = require('axios');
const cheerio = require('cheerio');
const dns = require('dns').promises;
const ipaddr = require('ipaddr.js');
const { cleanText } = require('./textCleaner');
const config = require('../../config/env');

/**
 * Check if a hostname or IP address is private/internal (SSRF Prevention)
 * @param {string} hostname
 * @returns {Promise<boolean>} - true if safe/public, false if private/blocked
 */
async function validateSafeHostname(hostname) {
  if (!hostname || typeof hostname !== 'string') return false;

  const lowerHost = hostname.toLowerCase();

  // Block local names
  if (
    lowerHost === 'localhost' ||
    lowerHost.endsWith('.localhost') ||
    lowerHost.endsWith('.local') ||
    lowerHost.endsWith('.internal') ||
    lowerHost === 'metadata.google.internal'
  ) {
    return false;
  }

  // Resolve DNS to verify all returned IPs are public
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    if (!addresses || addresses.length === 0) return false;

    for (const addr of addresses) {
      const ipStr = addr.address;
      if (!ipaddr.isValid(ipStr)) return false;

      const parsed = ipaddr.parse(ipStr);
      const range = parsed.range();

      // Block any non-unicast/private IP ranges
      const blockedRanges = [
        'unspecified',
        'broadcast',
        'linkLocal',
        'loopback',
        'private',
        'reserved',
        'carrierGradeNat',
      ];

      if (blockedRanges.includes(range)) {
        return false;
      }

      // Check specific cloud metadata IPs
      if (ipStr === '169.254.169.254' || ipStr === '169.254.170.2') {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch and extract text from a web page URL
 * @param {string} rawUrl
 * @returns {Promise<{ fullText: string, title: string, pages: null, pageCount: null }>}
 */
async function processUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('Web URL is required for URL processing');
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl.trim());
  } catch {
    throw new Error('Invalid web URL format provided');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Only HTTP and HTTPS web URLs are supported');
  }

  // Perform SSRF validation
  const isSafe = await validateSafeHostname(parsedUrl.hostname);
  if (!isSafe) {
    throw new Error('Access to local, private, or internal network URLs is strictly blocked for security');
  }

  const timeoutMs = config.processing?.urlFetchTimeoutMs || 15000;
  const maxBytes = (config.processing?.maxUrlResponseMb || 5) * 1024 * 1024;

  let html = '';
  try {
    const response = await axios.get(parsedUrl.href, {
      timeout: timeoutMs,
      maxContentLength: maxBytes,
      maxBodyLength: maxBytes,
      maxRedirects: 3,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) StudyLM-Research/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    html = response.data;
  } catch (fetchErr) {
    if (fetchErr.code === 'ECONNABORTED' || fetchErr.message?.includes('timeout')) {
      throw new Error(`Web page request timed out after ${timeoutMs / 1000}s`);
    }
    throw new Error(`Failed to fetch web page: ${fetchErr.message}`);
  }

  if (typeof html !== 'string' || !html.trim()) {
    throw new Error('The web page returned an empty response');
  }

  // Parse HTML with Cheerio
  const $ = cheerio.load(html);

  // Remove scripts, styles, iframes, navigation, ads, and footers
  $(
    'script, style, noscript, svg, iframe, nav, footer, header, form, dialog, .cookie-banner, .advertisement, .ad, .sidebar, .menu'
  ).remove();

  // Extract page title
  const pageTitle = $('title').first().text().trim() || $('h1').first().text().trim() || parsedUrl.hostname;

  // Prefer main or article content if present
  let mainContent = $('main, article, [role="main"], .content, #content, .post-content').text();
  if (!mainContent || mainContent.trim().length < 100) {
    mainContent = $('body').text();
  }

  const cleanedText = cleanText(mainContent);

  if (!cleanedText || cleanedText.length < 20) {
    throw new Error('The web page contains insufficient readable text content');
  }

  return {
    fullText: `${pageTitle ? `# ${pageTitle}\n\n` : ''}${cleanedText}`,
    title: pageTitle,
    pages: null,
    pageCount: null,
  };
}

module.exports = {
  processUrl,
  validateSafeHostname,
};

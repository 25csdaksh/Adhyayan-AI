const config = require('../../config/env');
const { validateUrlForSsrf } = require('./webSecurity');

const ALLOWED_MIME_PREFIXES = ['text/html', 'text/plain', 'application/xhtml+xml', 'text/markdown', 'application/xml'];

const BLOCKED_MIME_TYPES = new Set([
  'application/octet-stream',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-executable',
  'application/x-msdownload',
  'application/x-sh',
  'application/pdf',
]);

/**
 * Safely fetch web page with strict SSRF validation on every redirect hop,
 * timeout controls, and response body byte bounds.
 *
 * @param {string} initialUrl
 * @param {Object} [options]
 * @param {number} [options.timeoutMs]
 * @param {number} [options.maxBytes]
 * @param {number} [options.maxRedirects]
 * @returns {Promise<{ html: string, finalUrl: string, httpStatus: number, contentType: string }>}
 */
async function safeFetchWebPage(initialUrl, options = {}) {
  const timeoutMs = options.timeoutMs || config.web?.fetchTimeoutMs || 15000;
  const maxBytes = options.maxBytes || config.web?.maxResponseBytes || 5000000;
  const maxRedirects = options.maxRedirects || config.web?.maxRedirects || 5;

  let currentUrl = initialUrl;
  let redirectCount = 0;

  while (redirectCount <= maxRedirects) {
    // 1. Validate URL and resolve IP for SSRF protection
    const validation = await validateUrlForSsrf(currentUrl);
    if (!validation.valid) {
      throw new Error(`Security validation failed for URL ${currentUrl}: ${validation.error}`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let res;
    try {
      res = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual', // Manually handle redirects to enforce SSRF validation at every hop
        headers: {
          'User-Agent': 'StudyLM-ResearchBot/1.0 (+https://studylm.internal/bot)',
          'Accept': 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      if (fetchErr.name === 'AbortError') {
        throw new Error(`Web request timed out after ${timeoutMs}ms`);
      }
      throw new Error(`Network fetch failed: ${fetchErr.message}`);
    }

    clearTimeout(timeoutId);

    // 2. Handle HTTP Redirects (301, 302, 303, 307, 308)
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get('location');
      if (!location) {
        throw new Error(`Redirect HTTP ${res.status} missing Location header`);
      }

      redirectCount++;
      if (redirectCount > maxRedirects) {
        throw new Error(`Exceeded maximum allowed redirects (${maxRedirects})`);
      }

      // Resolve relative redirect URLs against the current URL
      try {
        currentUrl = new URL(location, currentUrl).toString();
      } catch {
        throw new Error(`Invalid redirect Location: ${location}`);
      }

      continue;
    }

    // 3. Verify HTTP Status
    if (!res.ok) {
      throw new Error(`Remote server responded with HTTP status ${res.status}: ${res.statusText}`);
    }

    // 4. Verify Content-Type
    const rawContentType = res.headers.get('content-type') || 'text/html';
    const cleanContentType = rawContentType.split(';')[0].trim().toLowerCase();

    if (BLOCKED_MIME_TYPES.has(cleanContentType) || cleanContentType.startsWith('image/') || cleanContentType.startsWith('video/') || cleanContentType.startsWith('audio/')) {
      throw new Error(`Unsupported or binary content type: ${cleanContentType}`);
    }

    // Check if allowed
    const isAllowedMime = ALLOWED_MIME_PREFIXES.some((prefix) => cleanContentType.startsWith(prefix));
    if (!isAllowedMime && !cleanContentType.includes('html') && !cleanContentType.includes('text')) {
      throw new Error(`Unsupported content type for research extraction: ${cleanContentType}`);
    }

    // 5. Read stream bounded by maxBytes
    const reader = res.body.getReader();
    const chunks = [];
    let receivedBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      receivedBytes += value.length;
      if (receivedBytes > maxBytes) {
        await reader.cancel();
        throw new Error(`Web page response exceeded maximum allowed size of ${maxBytes} bytes`);
      }

      chunks.push(value);
    }

    // Concatenate buffer and decode UTF-8
    const totalBuffer = Buffer.concat(chunks);
    const htmlText = totalBuffer.toString('utf-8');

    return {
      html: htmlText,
      finalUrl: currentUrl,
      httpStatus: res.status,
      contentType: cleanContentType,
    };
  }

  throw new Error(`Exceeded maximum allowed redirects (${maxRedirects})`);
}

module.exports = {
  safeFetchWebPage,
};

const { safeFetchWebPage } = require('../web/webFetcher');
const { extractWebContent } = require('../web/webExtractor');
const { canonicalizeUrl, computeContentHash } = require('../web/urlCanonicalizer');

/**
 * Fetch and extract text from a web page URL with SSRF protection,
 * cheerio content cleaning, and metadata extraction.
 *
 * @param {string} rawUrl
 * @returns {Promise<{ fullText: string, title: string, canonicalUrl: string, domain: string, contentHash: string, httpStatus: number, publishedAt: Date|null, pages: null, pageCount: null }>}
 */
async function processUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    throw new Error('Web URL is required for URL processing');
  }

  const cleanUrl = rawUrl.trim();
  const canonical = canonicalizeUrl(cleanUrl);

  // Safely fetch web page with hop-by-hop SSRF validation and byte bounds
  const fetchResult = await safeFetchWebPage(canonical);

  // Extract clean structured content and metadata
  const extracted = extractWebContent(fetchResult.html, fetchResult.finalUrl);
  const contentHash = computeContentHash(extracted.mainText);

  if (!extracted.mainText || extracted.mainText.trim().length === 0) {
    throw new Error('The web page contains insufficient readable text content');
  }

  const fullText = extracted.title
    ? `# ${extracted.title}\n\n${extracted.mainText}`
    : extracted.mainText;

  return {
    fullText,
    title: extracted.title || canonical,
    canonicalUrl: extracted.canonicalUrl || canonical,
    domain: extracted.domain || '',
    description: extracted.description || '',
    contentHash,
    httpStatus: fetchResult.httpStatus || 200,
    publishedAt: extracted.publishedAt || null,
    pages: null,
    pageCount: null,
  };
}

module.exports = {
  processUrl,
};

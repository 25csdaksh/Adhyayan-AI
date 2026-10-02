const cheerio = require('cheerio');
const config = require('../../config/env');
const { cleanText } = require('../document/textCleaner');
const { extractDomain, canonicalizeUrl } = require('./urlCanonicalizer');

/**
 * Extract clean, research-oriented text and metadata from HTML content
 *
 * @param {string} html
 * @param {string} sourceUrl
 * @returns {{ title: string, description: string, mainText: string, canonicalUrl: string, domain: string, publishedAt: Date|null, charCount: number }}
 */
function extractWebContent(html, sourceUrl) {
  if (!html || typeof html !== 'string') {
    return {
      title: 'Untitled Web Page',
      description: '',
      mainText: '',
      canonicalUrl: canonicalizeUrl(sourceUrl),
      domain: extractDomain(sourceUrl),
      publishedAt: null,
      charCount: 0,
    };
  }

  const maxExtractedChars = config.web?.maxExtractedChars || 2000000;
  const $ = cheerio.load(html);

  // 1. Remove non-content, navigational, script, and hidden elements
  $(
    'script, style, noscript, svg, nav, footer, header, aside, form, iframe, template, object, embed, ' +
    '.ads, .advertisement, .banner, .cookie-banner, #cookie-consent, [aria-hidden="true"]'
  ).remove();

  // 2. Extract Title
  let title = $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').first().text() ||
    $('h1').first().text() ||
    '';
  title = cleanText(title).replace(/[\r\n]+/g, ' ').slice(0, 300).trim();
  if (!title) {
    title = `Web Source (${extractDomain(sourceUrl)})`;
  }

  // 3. Extract Description
  let description = $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="twitter:description"]').attr('content') ||
    '';
  description = cleanText(description).replace(/[\r\n]+/g, ' ').slice(0, 1000).trim();

  // 4. Extract Canonical URL
  let canonicalHref = $('link[rel="canonical"]').attr('href');
  let canonicalUrl = sourceUrl;
  if (canonicalHref) {
    try {
      canonicalUrl = new URL(canonicalHref, sourceUrl).toString();
    } catch {
      canonicalUrl = sourceUrl;
    }
  }
  canonicalUrl = canonicalizeUrl(canonicalUrl);

  // 5. Extract Publication Date
  let rawDate = $('meta[property="article:published_time"]').attr('content') ||
    $('meta[name="date"]').attr('content') ||
    $('meta[name="pubdate"]').attr('content') ||
    $('time[datetime]').first().attr('datetime') ||
    null;

  let publishedAt = null;
  if (rawDate) {
    const parsed = new Date(rawDate);
    if (!isNaN(parsed.getTime())) {
      publishedAt = parsed;
    }
  }

  // 6. Extract Main Readable Body Content
  // Prefer semantic content container if available
  let contentEl = $('main');
  if (contentEl.length === 0) contentEl = $('article');
  if (contentEl.length === 0) contentEl = $('#content, #main, .content, .main-content');
  if (contentEl.length === 0) contentEl = $('body');

  let rawText = contentEl.text() || '';
  let cleanedMainText = cleanText(rawText);

  // Apply maximum bounded extracted characters limit
  if (cleanedMainText.length > maxExtractedChars) {
    cleanedMainText = cleanedMainText.slice(0, maxExtractedChars).trim();
  }

  return {
    title,
    description,
    mainText: cleanedMainText,
    canonicalUrl,
    domain: extractDomain(sourceUrl),
    publishedAt,
    charCount: cleanedMainText.length,
  };
}

module.exports = {
  extractWebContent,
};

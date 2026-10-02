const cheerio = require('cheerio');
const { extractDomain } = require('../../web/urlCanonicalizer');

/**
 * Search the web using DuckDuckGo HTML endpoint
 * @param {string} query
 * @param {Object} [options]
 * @param {number} [options.limit=5]
 * @returns {Promise<Array<{ title: string, url: string, snippet: string, domain: string, publishedAt: null }>>}
 */
async function searchDuckDuckGo(query, options = {}) {
  const limit = options.limit || 5;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return [];
  }

  const encodedQuery = encodeURIComponent(query.trim());
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  let res;
  try {
    res = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html',
      },
      body: `q=${encodedQuery}&b=`,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    return [];
  }

  clearTimeout(timeoutId);

  if (!res.ok) {
    return [];
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const results = [];

  $('.result').each((i, el) => {
    if (results.length >= limit) return false;

    const titleEl = $(el).find('.result__title a');
    const snippetEl = $(el).find('.result__snippet');

    let title = titleEl.text().trim();
    let rawHref = titleEl.attr('href') || '';
    let snippet = snippetEl.text().trim();

    // DuckDuckGo redirects often look like /l/?uddg=https%3A%2F%2F...
    let finalUrl = rawHref;
    if (rawHref.includes('uddg=')) {
      try {
        const match = rawHref.match(/uddg=([^&]+)/);
        if (match && match[1]) {
          finalUrl = decodeURIComponent(match[1]);
        }
      } catch {
        finalUrl = rawHref;
      }
    }

    if (finalUrl && finalUrl.startsWith('http') && title) {
      results.push({
        title,
        url: finalUrl,
        snippet: snippet || title,
        domain: extractDomain(finalUrl),
        publishedAt: null,
      });
    }
  });

  return results;
}

module.exports = {
  searchDuckDuckGo,
};

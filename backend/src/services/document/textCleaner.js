/**
 * Deterministic text cleaner for StudyLM
 * Normalizes line endings, whitespace, and Unicode without destroying semantic structure
 */

/**
 * Clean text string deterministically
 * @param {string} raw
 * @returns {string}
 */
function cleanText(raw) {
  if (!raw || typeof raw !== 'string') {
    return '';
  }

  return raw
    // 1. Normalize Unicode
    .normalize('NFKC')
    // 2. Normalize line endings to \n
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // 3. Remove non-printable control characters except standard whitespace
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // 4. Replace multiple horizontal whitespace chars with single space (while keeping newlines)
    .replace(/[^\S\n]+/g, ' ')
    // 5. Trim lines
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    // 6. Collapse 3+ consecutive newlines to maximum 2 newlines (paragraph boundary)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Clean an array of page objects: [{ pageNumber: 1, text: "..." }, ...]
 * @param {Array<{ pageNumber: number, text: string }>} pages
 * @returns {Array<{ pageNumber: number, text: string }>}
 */
function cleanPages(pages) {
  if (!Array.isArray(pages)) return [];

  return pages
    .map((p) => ({
      pageNumber: p.pageNumber,
      text: cleanText(p.text),
    }))
    .filter((p) => p.text.length > 0);
}

module.exports = {
  cleanText,
  cleanPages,
};

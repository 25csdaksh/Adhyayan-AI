const { cleanText } = require('./textCleaner');
const { downloadBuffer } = require('./pdfProcessor');

/**
 * Process a plain text file buffer
 * @param {Buffer} buffer
 * @returns {Promise<{ fullText: string, pages: null, pageCount: null }>}
 */
async function processTxtBuffer(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error('Text file buffer is empty');
  }

  // Decode UTF-8 (stripping BOM if present)
  let raw = buffer.toString('utf8');
  if (raw.charCodeAt(0) === 0xfeff) {
    raw = raw.slice(1);
  }

  const cleaned = cleanText(raw);

  if (!cleaned || cleaned.trim().length === 0) {
    throw new Error('No readable text could be extracted from this text file.');
  }

  return {
    fullText: cleaned,
    pages: null,
    pageCount: null,
  };
}

/**
 * Process TXT from Document record
 * @param {Object} document
 * @param {Buffer} [directBuffer]
 */
async function processTxt(document, directBuffer = null) {
  const buffer = directBuffer || (await downloadBuffer(document.storageUrl));
  return processTxtBuffer(buffer);
}

module.exports = {
  processTxt,
  processTxtBuffer,
};

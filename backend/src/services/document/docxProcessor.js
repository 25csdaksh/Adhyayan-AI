const mammoth = require('mammoth');
const { cleanText } = require('./textCleaner');
const { downloadBuffer } = require('./pdfProcessor');

/**
 * Process a DOCX document buffer
 * @param {Buffer} buffer
 * @returns {Promise<{ fullText: string, pages: null, pageCount: null }>}
 */
async function processDocxBuffer(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error('DOCX file buffer is empty');
  }

  try {
    const result = await mammoth.extractRawText({ buffer });
    const cleaned = cleanText(result.value);

    if (!cleaned || cleaned.trim().length === 0) {
      throw new Error('No readable text could be extracted from this Word document.');
    }

    return {
      fullText: cleaned,
      pages: null,
      pageCount: null,
    };
  } catch (err) {
    if (err.message.includes('No readable text')) {
      throw err;
    }
    throw new Error(`Failed to parse Word document: ${err.message}`);
  }
}

/**
 * Process DOCX from Document record
 * @param {Object} document
 * @param {Buffer} [directBuffer]
 */
async function processDocx(document, directBuffer = null) {
  const buffer = directBuffer || (await downloadBuffer(document.storageUrl));
  return processDocxBuffer(buffer);
}

module.exports = {
  processDocx,
  processDocxBuffer,
};

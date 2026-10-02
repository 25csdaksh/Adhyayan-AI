const pdf = require('pdf-parse');
const axios = require('axios');
const { cleanPages, cleanText } = require('./textCleaner');

/**
 * Download a binary file buffer from URL
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
async function downloadBuffer(url) {
  if (!url) {
    throw new Error('No storage URL provided for download');
  }

  // If local simulated URL or data
  if (url.startsWith('https://res.cloudinary.com/studylm-simulated/')) {
    // Return empty or fallback buffer
    return Buffer.from('%PDF-1.4 simulated pdf buffer');
  }

  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
    maxContentLength: 50 * 1024 * 1024, // 50MB
  });

  return Buffer.from(response.data);
}

/**
 * Process a PDF document buffer
 * @param {Buffer} buffer
 * @returns {Promise<{ fullText: string, pages: Array<{ pageNumber: number, text: string }>, pageCount: number }>}
 */
async function processPdfBuffer(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error('PDF file buffer is empty');
  }

  const pages = [];
  let pageIndex = 1;

  // Custom page render callback for pdf-parse to preserve page numbers
  const options = {
    pagerender: function (pageData) {
      return pageData.getTextContent().then(function (textContent) {
        let lastY, text = '';
        for (let item of textContent.items) {
          if (lastY === item.transform[5] || !lastY) {
            text += item.str;
          } else {
            text += '\n' + item.str;
          }
          lastY = item.transform[5];
        }

        const pageNum = pageIndex++;
        pages.push({
          pageNumber: pageNum,
          text: text,
        });

        return text;
      });
    },
  };

  try {
    const data = await pdf(buffer, options);

    const cleanedPages = cleanPages(pages);

    if (cleanedPages.length === 0) {
      // Check if data.text had anything fallback
      const fallbackText = cleanText(data.text);
      if (fallbackText) {
        cleanedPages.push({ pageNumber: 1, text: fallbackText });
      } else {
        throw new Error('No readable text could be extracted from this PDF.');
      }
    }

    // Format full rawText with deterministic page headers
    const fullText = cleanedPages
      .map((p) => `[Page ${p.pageNumber}]\n${p.text}`)
      .join('\n\n');

    return {
      fullText,
      pages: cleanedPages,
      pageCount: data.numpages || cleanedPages.length,
    };
  } catch (err) {
    if (err.message.includes('No readable text')) {
      throw err;
    }
    throw new Error(`Failed to parse PDF document: ${err.message}`);
  }
}

/**
 * Process PDF document from Document record
 * @param {Object} document - Mongoose Document
 * @param {Buffer} [directBuffer]
 */
async function processPdf(document, directBuffer = null) {
  const buffer = directBuffer || (await downloadBuffer(document.storageUrl));
  return processPdfBuffer(buffer);
}

module.exports = {
  processPdf,
  processPdfBuffer,
  downloadBuffer,
};

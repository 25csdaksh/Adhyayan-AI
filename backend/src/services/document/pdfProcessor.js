const pdfModule = require('pdf-parse');
const axios = require('axios');
const { cleanPages, cleanText } = require('./textCleaner');

const PDFParse = pdfModule.PDFParse || (typeof pdfModule === 'function' ? null : pdfModule.default?.PDFParse);

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
    return Buffer.from(
      '%PDF-1.4\n' +
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n' +
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n' +
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n' +
      '4 0 obj << /Length 40 >> stream\n' +
      'BT /F1 24 Tf 100 700 Td (StudyLM Simulated PDF Content) Tj ET\n' +
      'endstream\n' +
      'endobj\n' +
      '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n' +
      'xref\n' +
      '0 6\n' +
      '0000000000 65535 f \n' +
      '0000000009 00000 n \n' +
      '0000000058 00000 n \n' +
      '0000000115 00000 n \n' +
      '0000000244 00000 n \n' +
      '0000000335 00000 n \n' +
      'trailer << /Size 6 /Root 1 0 R >>\n' +
      'startxref\n' +
      '414\n' +
      '%%EOF'
    );
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

  try {
    if (PDFParse) {
      // Modern pdf-parse v2+ (Class-based)
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();

      if (result && Array.isArray(result.pages) && result.pages.length > 0) {
        for (const p of result.pages) {
          pages.push({
            pageNumber: p.num || p.pageNumber || (pages.length + 1),
            text: p.text || '',
          });
        }
      } else if (result && result.text) {
        pages.push({
          pageNumber: 1,
          text: result.text,
        });
      }
    } else if (typeof pdfModule === 'function') {
      // Legacy pdf-parse v1 (Function-based)
      let pageIndex = 1;
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

      const data = await pdfModule(buffer, options);
      if (pages.length === 0 && data?.text) {
        pages.push({ pageNumber: 1, text: data.text });
      }
    } else {
      throw new Error('No compatible PDF parser available');
    }

    const cleanedPages = cleanPages(pages);

    if (cleanedPages.length === 0) {
      throw new Error('No readable text could be extracted from this PDF.');
    }

    // Format full rawText with deterministic page headers
    const fullText = cleanedPages
      .map((p) => `[Page ${p.pageNumber}]\n${p.text}`)
      .join('\n\n');

    return {
      fullText,
      pages: cleanedPages,
      pageCount: cleanedPages.length,
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

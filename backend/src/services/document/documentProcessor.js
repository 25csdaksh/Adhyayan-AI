const Document = require('../../models/Document');
const Chunk = require('../../models/Chunk');
const { processPdf } = require('./pdfProcessor');
const { processDocx } = require('./docxProcessor');
const { processTxt } = require('./txtProcessor');
const { processUrl } = require('./urlProcessor');
const { cleanText } = require('./textCleaner');
const { chunkText, chunkPages } = require('./chunker');
const config = require('../../config/env');

/**
 * Main Document Processing Service
 * Converts raw uploaded or linked sources into cleaned text and persistent semantic chunks
 *
 * @param {string|import('mongoose').Types.ObjectId} documentId
 * @param {Object} [options] - Optional direct buffer or overrides
 * @returns {Promise<import('../../models/Document')>}
 */
async function processDocument(documentId, options = {}) {
  const document = await Document.findById(documentId);
  if (!document) {
    throw new Error(`Document ${documentId} not found`);
  }

  // Set status to processing
  document.status = 'processing';
  document.processingError = '';
  await document.save();

  try {
    let extractionResult = {
      fullText: '',
      pages: null,
      pageCount: null,
    };

    switch (document.sourceType) {
      case 'pdf': {
        extractionResult = await processPdf(document, options.directBuffer);
        break;
      }

      case 'docx': {
        extractionResult = await processDocx(document, options.directBuffer);
        break;
      }

      case 'txt': {
        extractionResult = await processTxt(document, options.directBuffer);
        break;
      }

      case 'text': {
        const cleaned = cleanText(document.rawText);
        if (!cleaned) {
          throw new Error('Text source content is empty');
        }
        extractionResult = {
          fullText: cleaned,
          pages: null,
          pageCount: null,
        };
        break;
      }

      case 'url': {
        extractionResult = await processUrl(document.sourceUrl);
        break;
      }

      default:
        throw new Error(`Unsupported source type for processing: ${document.sourceType}`);
    }

    const { fullText, pages, pageCount } = extractionResult;

    if (!fullText || fullText.trim().length === 0) {
      throw new Error(`No readable text could be extracted from this ${document.sourceType.toUpperCase()} source`);
    }

    // Safeguard against pathological text size
    const maxChars = config.processing?.maxTextChars || 2000000;
    const boundedText = fullText.length > maxChars ? fullText.slice(0, maxChars) : fullText;

    // Generate Chunks
    let rawChunks = [];
    if (pages && pages.length > 0) {
      rawChunks = chunkPages(pages, {
        documentId: document._id,
        notebookId: document.notebookId,
      });
    } else {
      rawChunks = chunkText(boundedText, {
        documentId: document._id,
        notebookId: document.notebookId,
        pageNumber: null,
      });
    }

    if (!rawChunks || rawChunks.length === 0) {
      throw new Error('Failed to generate semantic chunks from document content');
    }

    // Limit maximum chunks per document
    const maxChunks = config.processing?.maxChunksPerDocument || 1000;
    const finalChunks = rawChunks.slice(0, maxChunks);

    // Generate Embeddings for all chunks (Phase 07)
    const { generateEmbeddings, EMBEDDING_MODEL, EXPECTED_DIMENSIONS } = require('../embedding/embeddingService');
    const chunkTexts = finalChunks.map((c) => c.text);
    const vectors = await generateEmbeddings(chunkTexts);

    if (!vectors || vectors.length !== finalChunks.length) {
      throw new Error('Failed to generate embeddings for document chunks');
    }

    const embeddedAt = new Date();
    for (let i = 0; i < finalChunks.length; i++) {
      finalChunks[i].embedding = vectors[i];
      finalChunks[i].embeddingModel = EMBEDDING_MODEL;
      finalChunks[i].embeddingDimensions = EXPECTED_DIMENSIONS;
      finalChunks[i].embeddedAt = embeddedAt;
    }

    // Idempotent chunk replacement in MongoDB
    await Chunk.deleteMany({ documentId: document._id });
    await Chunk.insertMany(finalChunks);

    // Update document metadata & status to ready
    const wordCount = boundedText.split(/\s+/).filter(Boolean).length;
    document.rawText = boundedText;
    document.status = 'ready';
    document.processingError = '';
    document.metadata = {
      ...(document.metadata || {}),
      characterCount: boundedText.length,
      wordCount,
      pageCount: pageCount || (pages ? pages.length : null),
      chunkCount: finalChunks.length,
      embeddingStatus: 'completed',
      embeddingModel: EMBEDDING_MODEL,
      embeddingDimensions: EXPECTED_DIMENSIONS,
      extractedAt: new Date(),
    };

    await document.save();
    return document;
  } catch (processingErr) {
    const safeErrorMessage =
      processingErr.message && !processingErr.message.includes('at ')
        ? processingErr.message
        : 'An error occurred while extracting content or generating embeddings for this document.';

    document.status = 'failed';
    document.processingError = safeErrorMessage;
    document.metadata = {
      ...(document.metadata || {}),
      embeddingStatus: 'failed',
    };
    await document.save();
    throw processingErr;
  }
}

/**
 * Trigger background document processing without blocking caller
 * @param {string|import('mongoose').Types.ObjectId} documentId
 * @param {Object} [options]
 */
function triggerAsyncProcessing(documentId, options = {}) {
  setImmediate(async () => {
    try {
      await processDocument(documentId, options);
    } catch (err) {
      console.warn(`[Processing Warning] Document ${documentId} processing ended with status failed:`, err.message);
    }
  });
}

module.exports = {
  processDocument,
  triggerAsyncProcessing,
};

/**
 * Source Coverage & Diagnostic Service
 * Verifies whether a source is extracted, chunked, embedded, analyzed, and searchable
 */

const Document = require('../../models/Document');
const Chunk = require('../../models/Chunk');
const WebSource = require('../../models/WebSource');

/**
 * Check coverage and indexing status of a Document source
 * @param {string|import('mongoose').Types.ObjectId} documentId
 * @param {string|import('mongoose').Types.ObjectId} notebookId
 * @returns {Promise<Object>}
 */
async function checkDocumentCoverage(documentId, notebookId) {
  const document = await Document.findOne({ _id: documentId, notebookId }).lean();
  if (!document) {
    throw new Error('Document not found or access denied');
  }

  const chunkCount = await Chunk.countDocuments({ documentId: document._id, notebookId });
  const embeddedChunkCount = await Chunk.countDocuments({
    documentId: document._id,
    notebookId,
    embedding: { $exists: true, $ne: [] },
  });

  const hasRawText = Boolean(document.rawText && document.rawText.trim().length > 0);
  const rawTextLength = document.rawText ? document.rawText.length : 0;
  const hasAnalysis = Boolean(
    document.analysis &&
      document.analysis.status === 'ready' &&
      (document.analysis.overview || (document.analysis.keyTopics && document.analysis.keyTopics.length > 0))
  );

  const issues = [];
  if (!hasRawText) {
    issues.push('No readable text extracted from source.');
  }
  if (chunkCount === 0) {
    issues.push('No semantic chunks generated.');
  }
  if (embeddedChunkCount < chunkCount) {
    issues.push(`Only ${embeddedChunkCount} of ${chunkCount} chunks have vector embeddings.`);
  }
  if (document.status === 'failed') {
    issues.push(`Document marked as failed: ${document.processingError || 'Unknown processing error'}`);
  }

  let overallStatus = 'Partially Ready';
  if (document.status === 'failed') {
    overallStatus = 'Failed';
  } else if (hasRawText && chunkCount > 0 && embeddedChunkCount === chunkCount && hasAnalysis) {
    overallStatus = 'Analyzed';
  } else if (hasRawText && chunkCount > 0 && embeddedChunkCount === chunkCount) {
    overallStatus = 'Indexed';
  } else if (document.status === 'ready') {
    overallStatus = 'Source Ready';
  }

  return {
    documentId: document._id,
    notebookId: document.notebookId,
    title: document.title,
    sourceType: document.sourceType,
    status: overallStatus,
    documentStatus: document.status,
    analysisStatus: document.analysis?.status || 'pending',
    coverage: {
      hasRawText,
      rawTextLength,
      wordCount: document.metadata?.wordCount || 0,
      pageCount: document.metadata?.pageCount || null,
      chunkCount,
      embeddedChunkCount,
      embeddingModel: document.metadata?.embeddingModel || 'text-embedding-004',
      isFullyEmbedded: chunkCount > 0 && embeddedChunkCount === chunkCount,
      hasAnalysis,
      analysisGeneratedAt: document.analysis?.generatedAt || null,
    },
    issues,
  };
}

/**
 * Check coverage and indexing status of a Web source
 * @param {string|import('mongoose').Types.ObjectId} webSourceId
 * @param {string|import('mongoose').Types.ObjectId} notebookId
 * @returns {Promise<Object>}
 */
async function checkWebSourceCoverage(webSourceId, notebookId) {
  const webSource = await WebSource.findOne({ _id: webSourceId, notebookId }).lean();
  if (!webSource) {
    throw new Error('Web source not found or access denied');
  }

  const chunkCount = await Chunk.countDocuments({ webSourceId: webSource._id, notebookId });
  const embeddedChunkCount = await Chunk.countDocuments({
    webSourceId: webSource._id,
    notebookId,
    embedding: { $exists: true, $ne: [] },
  });

  const hasContent = Boolean(webSource.content && webSource.content.trim().length > 0);
  const contentLength = webSource.content ? webSource.content.length : 0;

  const issues = [];
  if (!hasContent) {
    issues.push('No web content extracted.');
  }
  if (chunkCount === 0) {
    issues.push('No web chunks generated.');
  }
  if (embeddedChunkCount < chunkCount) {
    issues.push(`Only ${embeddedChunkCount} of ${chunkCount} web chunks have embeddings.`);
  }

  let overallStatus = 'Partially Ready';
  if (webSource.status === 'failed') {
    overallStatus = 'Failed';
  } else if (hasContent && chunkCount > 0 && embeddedChunkCount === chunkCount) {
    overallStatus = 'Indexed';
  } else if (webSource.status === 'ready') {
    overallStatus = 'Source Ready';
  }

  return {
    webSourceId: webSource._id,
    notebookId: webSource.notebookId,
    title: webSource.title,
    canonicalUrl: webSource.canonicalUrl,
    domain: webSource.domain,
    status: overallStatus,
    webSourceStatus: webSource.status,
    coverage: {
      hasContent,
      contentLength,
      chunkCount,
      embeddedChunkCount,
      isFullyEmbedded: chunkCount > 0 && embeddedChunkCount === chunkCount,
    },
    issues,
  };
}

module.exports = {
  checkDocumentCoverage,
  checkWebSourceCoverage,
};

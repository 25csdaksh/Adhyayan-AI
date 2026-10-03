const Chunk = require('../../models/Chunk');
const Document = require('../../models/Document');
const WebSource = require('../../models/WebSource');
const ApiError = require('../../utils/apiError');

/**
 * Retrieve a chunk with its surrounding chunks and source metadata for deep-link citation preview
 *
 * @param {Object} params
 * @param {string|import('mongoose').Types.ObjectId} params.notebookId
 * @param {string|import('mongoose').Types.ObjectId} params.chunkId
 * @param {string|import('mongoose').Types.ObjectId} params.userId
 */
async function getChunkPreviewContext({ notebookId, chunkId, userId }) {
  const targetChunk = await Chunk.findOne({ _id: chunkId, notebookId }).lean();
  if (!targetChunk) {
    throw ApiError.notFound('Source chunk not found or access denied.');
  }

  // Retrieve source metadata
  let sourceMeta = null;
  let surroundingChunks = [];

  if (targetChunk.documentId) {
    const doc = await Document.findOne({ _id: targetChunk.documentId, notebookId, ownerId: userId }).lean();
    if (doc) {
      sourceMeta = {
        sourceId: doc._id,
        sourceKind: 'document',
        sourceType: doc.sourceType,
        title: doc.title || doc.originalFileName,
        originalFileName: doc.originalFileName,
        storageUrl: doc.storageUrl,
      };

      // Fetch adjacent chunks
      surroundingChunks = await Chunk.find({
        documentId: doc._id,
        chunkIndex: { $in: [targetChunk.chunkIndex - 1, targetChunk.chunkIndex + 1] },
      })
        .sort({ chunkIndex: 1 })
        .lean();
    }
  } else if (targetChunk.webSourceId) {
    const web = await WebSource.findOne({ _id: targetChunk.webSourceId, notebookId, ownerId: userId }).lean();
    if (web) {
      sourceMeta = {
        sourceId: web._id,
        sourceKind: 'web',
        sourceType: 'web',
        title: web.title || web.domain,
        url: web.url,
        domain: web.domain,
      };

      // Fetch adjacent chunks
      surroundingChunks = await Chunk.find({
        webSourceId: web._id,
        chunkIndex: { $in: [targetChunk.chunkIndex - 1, targetChunk.chunkIndex + 1] },
      })
        .sort({ chunkIndex: 1 })
        .lean();
    }
  }

  return {
    targetChunk: {
      _id: targetChunk._id,
      chunkIndex: targetChunk.chunkIndex,
      text: targetChunk.text,
      pageNumber: targetChunk.pageNumber,
      pageStart: targetChunk.pageStart,
      pageEnd: targetChunk.pageEnd,
      tokenCount: targetChunk.tokenCount,
    },
    surroundingChunks: surroundingChunks.map((c) => ({
      _id: c._id,
      chunkIndex: c.chunkIndex,
      text: c.text,
      pageNumber: c.pageNumber,
    })),
    source: sourceMeta,
  };
}

module.exports = {
  getChunkPreviewContext,
};

const Chunk = require('../../models/Chunk');
const Document = require('../../models/Document');
const { semanticSearch } = require('../search/vectorSearchService');
const { buildContext } = require('../rag/contextBuilder');
const config = require('../../config/env');

/**
 * Retrieve relevant chunks for study tools and build structured context
 *
 * @param {Object} params
 * @param {string|import('mongoose').Types.ObjectId} params.notebookId
 * @param {string} [params.topic]
 * @param {number} [params.maxChunks=8]
 * @param {number} [params.maxCharacters=30000]
 * @returns {Promise<{ contextText: string, sourceMap: Map<string, Object>, formattedSources: Array<Object>, chunkCount: number }>}
 */
async function retrieveStudyContext({
  notebookId,
  topic = '',
  maxChunks = config.rag?.maxContextChunks || 8,
  maxCharacters = config.rag?.maxContextChars || 30000,
}) {
  let chunks = [];

  const cleanTopic = typeof topic === 'string' ? topic.trim() : '';

  if (cleanTopic.length > 0) {
    // Perform semantic vector retrieval scoped to the topic
    try {
      const searchRes = await semanticSearch({
        notebookId,
        query: cleanTopic,
        topK: maxChunks,
        scoreThreshold: 0.1,
      });
      chunks = searchRes?.results || [];
    } catch {
      chunks = [];
    }
  }

  // If semantic search returned nothing or no topic was supplied, load notebook chunks with balanced multi-document coverage
  if (chunks.length === 0) {
    const readyDocs = await Document.find({ notebookId, status: { $ne: 'failed' } })
      .select('_id title sourceType')
      .lean();

    if (readyDocs.length > 1) {
      const perDocLimit = Math.max(1, Math.floor(maxChunks / readyDocs.length));
      const collected = [];

      for (const doc of readyDocs) {
        const docChunks = await Chunk.find({ documentId: doc._id, notebookId })
          .sort({ chunkIndex: 1 })
          .limit(perDocLimit)
          .lean();

        docChunks.forEach((c) => {
          collected.push({
            chunkId: c._id,
            documentId: doc._id,
            notebookId: c.notebookId,
            chunkIndex: c.chunkIndex,
            text: c.text,
            pageNumber: c.pageNumber,
            pageStart: c.pageStart,
            pageEnd: c.pageEnd,
            documentTitle: doc.title || 'Untitled Document',
            sourceType: doc.sourceType || 'text',
          });
        });
      }

      // If budget remains, fill up to maxChunks
      if (collected.length < maxChunks) {
        const collectedIds = new Set(collected.map((c) => c.chunkId.toString()));
        const extraChunks = await Chunk.find({ notebookId, _id: { $nin: Array.from(collectedIds) } })
          .populate('documentId', 'title sourceType status')
          .sort({ chunkIndex: 1 })
          .limit(maxChunks - collected.length)
          .lean();

        extraChunks.forEach((c) => {
          collected.push({
            chunkId: c._id,
            documentId: c.documentId?._id || c.documentId,
            notebookId: c.notebookId,
            chunkIndex: c.chunkIndex,
            text: c.text,
            pageNumber: c.pageNumber,
            pageStart: c.pageStart,
            pageEnd: c.pageEnd,
            documentTitle: c.documentId?.title || 'Untitled Document',
            sourceType: c.documentId?.sourceType || 'text',
          });
        });
      }
      chunks = collected;
    } else {
      const rawChunks = await Chunk.find({ notebookId })
        .populate('documentId', 'title sourceType status')
        .sort({ chunkIndex: 1 })
        .limit(maxChunks)
        .lean();

      chunks = rawChunks.map((c) => ({
        chunkId: c._id,
        documentId: c.documentId?._id || c.documentId,
        notebookId: c.notebookId,
        chunkIndex: c.chunkIndex,
        text: c.text,
        pageNumber: c.pageNumber,
        pageStart: c.pageStart,
        pageEnd: c.pageEnd,
        documentTitle: c.documentId?.title || 'Untitled Document',
        sourceType: c.documentId?.sourceType || 'text',
      }));
    }
  }

  if (chunks.length === 0) {
    return {
      contextText: '',
      sourceMap: new Map(),
      formattedSources: [],
      chunkCount: 0,
    };
  }

  const built = buildContext(chunks, { maxChunks, maxCharacters });

  return {
    contextText: built.contextText,
    sourceMap: built.sourceMap,
    formattedSources: built.formattedSources,
    chunkCount: chunks.length,
  };
}

module.exports = {
  retrieveStudyContext,
};

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

  // If semantic search returned nothing or no topic was supplied, load notebook chunks directly
  if (chunks.length === 0) {
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

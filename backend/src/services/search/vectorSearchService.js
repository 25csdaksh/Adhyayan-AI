const mongoose = require('mongoose');
const Chunk = require('../../models/Chunk');
const Document = require('../../models/Document');
const WebSource = require('../../models/WebSource');
const { generateEmbedding } = require('../embedding/embeddingService');
const config = require('../../config/env');

/**
 * Calculate cosine similarity between two numeric vectors
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
function calculateCosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== vecB.length) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return Math.max(0, Math.min(1, dotProduct / denominator));
}

/**
 * Semantic Vector Search within a specific notebook across notebook documents and/or web sources
 *
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.notebookId
 * @param {string} params.query
 * @param {'notebook'|'web'|'all'} [params.sourceScope='notebook']
 * @param {number} [params.topK=5]
 * @param {number} [params.scoreThreshold=0.5]
 * @returns {Promise<{ query: string, results: Array<Object> }>}
 */
async function semanticSearch({
  notebookId,
  query,
  sourceScope = 'notebook',
  topK = config.search?.defaultTopK || 5,
  scoreThreshold = config.search?.defaultScoreThreshold || 0.5,
}) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new Error('Search query text is required');
  }

  const cleanQuery = query.trim();
  const boundedTopK = Math.min(
    config.search?.maxTopK || 20,
    Math.max(1, parseInt(topK, 10) || 5)
  );
  const boundedThreshold = Math.max(0, Math.min(1, parseFloat(scoreThreshold) || 0));

  // 1. Generate query embedding vector
  const queryVector = await generateEmbedding(cleanQuery);

  const notebookObjectId = new mongoose.Types.ObjectId(notebookId);
  let scoredResults = [];

  // Define scope filter
  const scopeFilter = { notebookId: notebookObjectId };
  if (sourceScope === 'notebook') {
    scopeFilter.sourceKind = { $ne: 'web' };
  } else if (sourceScope === 'web') {
    scopeFilter.sourceKind = 'web';
  }

  // 2. Try native MongoDB Atlas Vector Search ($vectorSearch)
  try {
    const atlasPipeline = [
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: queryVector,
          numCandidates: Math.max(boundedTopK * 10, 50),
          limit: boundedTopK,
          filter: scopeFilter,
        },
      },
      {
        $project: {
          _id: 1,
          documentId: 1,
          webSourceId: 1,
          sourceKind: 1,
          notebookId: 1,
          chunkIndex: 1,
          text: 1,
          pageNumber: 1,
          pageStart: 1,
          pageEnd: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ];

    const atlasResults = await Chunk.aggregate(atlasPipeline);

    if (Array.isArray(atlasResults)) {
      scoredResults = atlasResults
        .filter((r) => r.score >= boundedThreshold)
        .map((r) => ({
          chunkId: r._id,
          documentId: r.documentId || null,
          webSourceId: r.webSourceId || null,
          sourceKind: r.sourceKind || (r.webSourceId ? 'web' : 'notebook'),
          notebookId: r.notebookId,
          chunkIndex: r.chunkIndex,
          text: r.text,
          pageNumber: r.pageNumber,
          pageStart: r.pageStart,
          pageEnd: r.pageEnd,
          score: parseFloat(r.score.toFixed(4)),
        }));
    }
  } catch (atlasErr) {
    // In-memory fallback
    const findQuery = {
      ...scopeFilter,
      embedding: { $exists: true, $ne: [] },
    };

    const notebookChunks = await Chunk.find(findQuery)
      .select('_id documentId webSourceId sourceKind notebookId chunkIndex text pageNumber pageStart pageEnd +embedding')
      .lean();

    scoredResults = notebookChunks
      .map((chunk) => {
        const score = calculateCosineSimilarity(queryVector, chunk.embedding);
        return {
          chunkId: chunk._id,
          documentId: chunk.documentId || null,
          webSourceId: chunk.webSourceId || null,
          sourceKind: chunk.sourceKind || (chunk.webSourceId ? 'web' : 'notebook'),
          notebookId: chunk.notebookId,
          chunkIndex: chunk.chunkIndex,
          text: chunk.text,
          pageNumber: chunk.pageNumber,
          pageStart: chunk.pageStart,
          pageEnd: chunk.pageEnd,
          score: parseFloat(score.toFixed(4)),
        };
      })
      .filter((r) => r.score >= boundedThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, boundedTopK);
  }

  // 3. Populate Document titles & WebSource metadata without exposing embeddings
  if (scoredResults.length > 0) {
    const documentIds = [
      ...new Set(
        scoredResults
          .filter((r) => r.documentId)
          .map((r) => r.documentId.toString())
      ),
    ];
    const webSourceIds = [
      ...new Set(
        scoredResults
          .filter((r) => r.webSourceId)
          .map((r) => r.webSourceId.toString())
      ),
    ];

    const [documents, webSources] = await Promise.all([
      documentIds.length > 0
        ? Document.find({ _id: { $in: documentIds }, notebookId: notebookObjectId })
            .select('_id title sourceType')
            .lean()
        : [],
      webSourceIds.length > 0
        ? WebSource.find({ _id: { $in: webSourceIds }, notebookId: notebookObjectId })
            .select('_id title domain canonicalUrl url')
            .lean()
        : [],
    ]);

    const docMap = new Map(documents.map((d) => [d._id.toString(), d]));
    const webMap = new Map(webSources.map((w) => [w._id.toString(), w]));

    scoredResults = scoredResults.map((r) => {
      if (r.webSourceId) {
        const web = webMap.get(r.webSourceId.toString());
        return {
          ...r,
          documentTitle: web?.title || 'Web Source',
          sourceType: 'webpage',
          domain: web?.domain || '',
          url: web?.canonicalUrl || web?.url || '',
          sourceKind: 'web',
        };
      } else {
        const doc = r.documentId ? docMap.get(r.documentId.toString()) : null;
        return {
          ...r,
          documentTitle: doc?.title || 'Document',
          sourceType: doc?.sourceType || 'text',
          sourceKind: 'notebook',
        };
      }
    });
  }

  return {
    query: cleanQuery,
    results: scoredResults,
  };
}

module.exports = {
  semanticSearch,
  calculateCosineSimilarity,
};

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
 * Perform single vector search execution against Mongo Atlas or in-memory fallback
 * @private
 */
async function executeVectorLookup({ notebookObjectId, queryVector, scopeFilter, boundedTopK, boundedThreshold }) {
  let scoredResults = [];

  // 1. Try native MongoDB Atlas Vector Search ($vectorSearch)
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

    if (Array.isArray(atlasResults) && atlasResults.length > 0) {
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
  }

  // If Atlas returned nothing or failed, use in-memory cosine ranking
  if (scoredResults.length === 0) {
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

  return scoredResults;
}

/**
 * Retrieve broad representative chunks evenly distributed across notebook sources
 * @private
 */
async function retrieveRepresentativeChunks({ notebookObjectId, scopeFilter, maxChunks }) {
  const readyDocs = await Document.find({ notebookId: notebookObjectId, status: { $ne: 'failed' } })
    .select('_id title sourceType')
    .lean();

  const results = [];
  if (readyDocs.length === 0) {
    // If no document sources, check web sources
    const readyWeb = await WebSource.find({ notebookId: notebookObjectId, status: { $ne: 'failed' } })
      .select('_id title domain url canonicalUrl')
      .lean();

    if (readyWeb.length === 0) return [];

    const perWebLimit = Math.max(1, Math.floor(maxChunks / readyWeb.length));
    for (const web of readyWeb) {
      const chunks = await Chunk.find({ webSourceId: web._id, notebookId: notebookObjectId })
        .sort({ chunkIndex: 1 })
        .limit(perWebLimit)
        .lean();

      chunks.forEach((c) => {
        results.push({
          chunkId: c._id,
          documentId: null,
          webSourceId: web._id,
          sourceKind: 'web',
          notebookId: c.notebookId,
          chunkIndex: c.chunkIndex,
          text: c.text,
          pageNumber: c.pageNumber,
          pageStart: c.pageStart,
          pageEnd: c.pageEnd,
          score: 1.0,
        });
      });
    }
    return results.slice(0, maxChunks);
  }

  const perDocLimit = Math.max(1, Math.floor(maxChunks / readyDocs.length));
  for (const doc of readyDocs) {
    const docChunks = await Chunk.find({ documentId: doc._id, notebookId: notebookObjectId })
      .sort({ chunkIndex: 1 })
      .lean();

    if (docChunks.length <= perDocLimit) {
      docChunks.forEach((c) => {
        results.push({
          chunkId: c._id,
          documentId: doc._id,
          webSourceId: null,
          sourceKind: 'notebook',
          notebookId: c.notebookId,
          chunkIndex: c.chunkIndex,
          text: c.text,
          pageNumber: c.pageNumber,
          pageStart: c.pageStart,
          pageEnd: c.pageEnd,
          score: 1.0,
        });
      });
    } else {
      // Sample evenly: start, middle, end
      const step = Math.floor(docChunks.length / perDocLimit);
      const sampled = [];
      for (let i = 0; i < docChunks.length && sampled.length < perDocLimit; i += step) {
        sampled.push(docChunks[i]);
      }
      if (sampled.length < perDocLimit && docChunks.length > 0) {
        sampled.push(docChunks[docChunks.length - 1]);
      }

      sampled.forEach((c) => {
        results.push({
          chunkId: c._id,
          documentId: doc._id,
          webSourceId: null,
          sourceKind: 'notebook',
          notebookId: c.notebookId,
          chunkIndex: c.chunkIndex,
          text: c.text,
          pageNumber: c.pageNumber,
          pageStart: c.pageStart,
          pageEnd: c.pageEnd,
          score: 1.0,
        });
      });
    }
  }

  return results.slice(0, maxChunks);
}

/**
 * Semantic Vector Search within a specific notebook across notebook documents and/or web sources
 * with intelligent multi-source scoping, query routing, page filtering, and comparison balancing.
 *
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.notebookId
 * @param {string} params.query
 * @param {'notebook'|'web'|'all'} [params.sourceScope='notebook']
 * @param {number} [params.topK=5]
 * @param {number} [params.scoreThreshold=0.5]
 * @param {Object} [params.queryAnalysis] - Optional structured analysis from queryAnalyzer
 * @returns {Promise<{ query: string, results: Array<Object> }>}
 */
async function semanticSearch({
  notebookId,
  query,
  sourceScope = 'notebook',
  topK = config.search?.defaultTopK || 5,
  scoreThreshold = config.search?.defaultScoreThreshold || 0.5,
  queryAnalysis = null,
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
  const notebookObjectId = new mongoose.Types.ObjectId(notebookId);

  // Define scope filter
  const scopeFilter = { notebookId: notebookObjectId };
  if (sourceScope === 'notebook') {
    scopeFilter.sourceKind = { $ne: 'web' };
  } else if (sourceScope === 'web') {
    scopeFilter.sourceKind = 'web';
  }

  let scoredResults = [];

  // Case A: Page-specific query
  if (queryAnalysis && queryAnalysis.intent === 'page_specific' && queryAnalysis.targetPage) {
    const pageNum = queryAnalysis.targetPage;
    const pageEnd = queryAnalysis.targetPageEnd || pageNum;

    // Fetch exact page chunks
    const pageChunks = await Chunk.find({
      ...scopeFilter,
      $or: [
        { pageNumber: pageNum },
        { pageStart: { $lte: pageNum }, pageEnd: { $gte: pageNum } },
        { pageStart: { $gte: pageNum, $lte: pageEnd } },
      ],
    })
      .sort({ chunkIndex: 1 })
      .lean();

    if (pageChunks.length > 0) {
      scoredResults = pageChunks.map((c) => ({
        chunkId: c._id,
        documentId: c.documentId || null,
        webSourceId: c.webSourceId || null,
        sourceKind: c.sourceKind || (c.webSourceId ? 'web' : 'notebook'),
        notebookId: c.notebookId,
        chunkIndex: c.chunkIndex,
        text: c.text,
        pageNumber: c.pageNumber,
        pageStart: c.pageStart,
        pageEnd: c.pageEnd,
        score: 1.0,
      }));
    }
  }

  // Case B: Summary / Broad overview query
  if (scoredResults.length === 0 && queryAnalysis && (queryAnalysis.intent === 'summary' || queryAnalysis.intent === 'overview')) {
    const broadChunks = await retrieveRepresentativeChunks({
      notebookObjectId,
      scopeFilter,
      maxChunks: boundedTopK,
    });
    if (broadChunks.length > 0) {
      scoredResults = broadChunks;
    }
  }

  // Case C: Comparison / Multi-concept queries
  if (scoredResults.length === 0 && queryAnalysis && queryAnalysis.intent === 'comparison' && Array.isArray(queryAnalysis.subQueries) && queryAnalysis.subQueries.length >= 2) {
    const conceptResults = [];
    const seenChunkIds = new Set();
    const perConceptTopK = Math.max(2, Math.floor(boundedTopK / queryAnalysis.subQueries.length));

    for (const subQuery of queryAnalysis.subQueries) {
      const subVec = await generateEmbedding(subQuery);
      const subScored = await executeVectorLookup({
        notebookObjectId,
        queryVector: subVec,
        scopeFilter,
        boundedTopK: perConceptTopK,
        boundedThreshold: Math.min(boundedThreshold, 0.1),
      });

      for (const r of subScored) {
        const idStr = r.chunkId.toString();
        if (!seenChunkIds.has(idStr)) {
          seenChunkIds.add(idStr);
          conceptResults.push(r);
        }
      }
    }

    // Also do main query vector lookup
    const mainVec = await generateEmbedding(queryAnalysis.effectiveQuery || cleanQuery);
    const mainScored = await executeVectorLookup({
      notebookObjectId,
      queryVector: mainVec,
      scopeFilter,
      boundedTopK,
      boundedThreshold,
    });

    for (const r of mainScored) {
      const idStr = r.chunkId.toString();
      if (!seenChunkIds.has(idStr)) {
        seenChunkIds.add(idStr);
        conceptResults.push(r);
      }
    }

    scoredResults = conceptResults.slice(0, boundedTopK);
  }

  // Case D: Standard Semantic Search (default)
  if (scoredResults.length === 0) {
    const effectiveSearchText = queryAnalysis?.effectiveQuery || cleanQuery;
    const queryVector = await generateEmbedding(effectiveSearchText);

    scoredResults = await executeVectorLookup({
      notebookObjectId,
      queryVector,
      scopeFilter,
      boundedTopK,
      boundedThreshold,
    });
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

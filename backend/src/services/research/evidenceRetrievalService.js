const { semanticSearch } = require('../search/vectorSearchService');
const Document = require('../../models/Document');
const WebSource = require('../../models/WebSource');
const Chunk = require('../../models/Chunk');

/**
 * Deduplicate evidence items and preserve diverse source representation
 *
 * @param {Array<Object>} evidenceList
 * @param {number} maxItems
 * @returns {Array<Object>}
 */
function deduplicateAndBalanceEvidence(evidenceList = [], maxItems = 12) {
  const acceptedWordSets = [];
  const seenChunkIds = new Set();
  const deduped = [];
  const sourceCount = {};

  for (const item of evidenceList) {
    if (!item || !item.text) continue;

    // Check unique chunkId
    if (item.chunkId && seenChunkIds.has(item.chunkId)) {
      continue;
    }

    const words = new Set(
      item.text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );

    // Check for high lexical overlap with already accepted items
    let isDuplicate = false;
    for (const existingSet of acceptedWordSets) {
      if (existingSet.size === 0 || words.size === 0) continue;
      let intersection = 0;
      for (const w of words) {
        if (existingSet.has(w)) intersection++;
      }
      const union = new Set([...existingSet, ...words]).size;
      const jaccard = union > 0 ? intersection / union : 0;
      if (jaccard >= 0.75) {
        isDuplicate = true;
        break;
      }
    }

    if (isDuplicate) {
      continue;
    }

    // Avoid over-indexing on a single source if multiple sources exist
    const sId = item.sourceId || item.documentId || item.sourceTitle || 'unknown';
    const currentCount = sourceCount[sId] || 0;
    if (currentCount >= 4 && evidenceList.length > 6) {
      continue; // Allow diversity
    }

    acceptedWordSets.push(words);
    if (item.chunkId) seenChunkIds.add(item.chunkId);
    sourceCount[sId] = currentCount + 1;

    deduped.push({
      ...item,
      id: item.id || `ev-${deduped.length + 1}`,
    });

    if (deduped.length >= maxItems) break;
  }

  return deduped;
}

/**
 * Validate that evidence items strictly belong to the authorized notebook and sources
 *
 * @param {Object} params
 * @param {string|import('mongoose').Types.ObjectId} params.notebookId
 * @param {string|import('mongoose').Types.ObjectId} params.userId
 * @param {Array<Object>} params.evidenceList
 * @returns {Promise<Array<Object>>}
 */
async function validateEvidenceProvenance({ notebookId, userId, evidenceList = [] }) {
  if (!evidenceList || evidenceList.length === 0) return [];

  // Fetch authorized document and web source IDs for this notebook and user
  const [authorizedDocs, authorizedWeb] = await Promise.all([
    Document.find({ notebookId, userId }).select('_id title').lean(),
    WebSource.find({ notebookId, userId }).select('_id title url domain').lean(),
  ]);

  const validDocMap = new Map(authorizedDocs.map((d) => [d._id.toString(), d.title]));
  const validWebMap = new Map(authorizedWeb.map((w) => [w._id.toString(), w]));

  const validated = [];

  for (const ev of evidenceList) {
    if (!ev || !ev.text || typeof ev.text !== 'string' || !ev.text.trim()) {
      continue;
    }

    const docIdStr = ev.documentId ? ev.documentId.toString() : '';
    const srcIdStr = ev.sourceId ? ev.sourceId.toString() : '';

    let isAuthorized = false;
    let title = ev.sourceTitle || 'Source';
    let kind = ev.sourceKind || 'document';
    let url = ev.url || '';
    let domain = ev.domain || '';

    if (validDocMap.has(docIdStr) || validDocMap.has(srcIdStr)) {
      isAuthorized = true;
      title = validDocMap.get(docIdStr) || validDocMap.get(srcIdStr) || title;
      kind = 'document';
    } else if (validWebMap.has(srcIdStr) || validWebMap.has(docIdStr)) {
      isAuthorized = true;
      const web = validWebMap.get(srcIdStr) || validWebMap.get(docIdStr);
      title = web.title || title;
      url = web.url || url;
      domain = web.domain || domain;
      kind = 'web';
    } else if (ev.sourceKind === 'web' && (ev.url || ev.domain)) {
      // Direct validated web research item with domain
      isAuthorized = true;
    }

    if (isAuthorized) {
      validated.push({
        id: ev.id || `ev-${validated.length + 1}`,
        sourceId: srcIdStr || docIdStr,
        documentId: docIdStr || srcIdStr,
        chunkId: ev.chunkId || '',
        sourceTitle: title,
        sourceType: ev.sourceType || 'document',
        sourceKind: kind,
        text: ev.text.trim(),
        score: typeof ev.score === 'number' ? ev.score : 0.5,
        pageNumber: ev.pageNumber || null,
        url: url || '',
        domain: domain || '',
        subQuestionIndex: ev.subQuestionIndex || 0,
      });
    }
  }

  return validated;
}

/**
 * Retrieve, deduplicate, and validate evidence for all research sub-questions
 *
 * @param {Object} params
 * @param {string|import('mongoose').Types.ObjectId} params.notebookId
 * @param {string|import('mongoose').Types.ObjectId} params.userId
 * @param {Array<Object>} params.plan
 * @param {string} [params.sourceScope='all']
 * @param {number} [params.topKPerStep=5]
 * @returns {Promise<{ evidence: Array<Object>, updatedPlan: Array<Object> }>}
 */
async function retrievePlanEvidence({
  notebookId,
  userId,
  plan = [],
  sourceScope = 'all',
  topKPerStep = 5,
}) {
  const allRawEvidence = [];
  const updatedPlan = [];

  for (let i = 0; i < plan.length; i++) {
    const step = plan[i];
    let stepEvidenceCount = 0;
    let stepStatus = 'completed';

    try {
      const searchRes = await semanticSearch({
        notebookId,
        query: step.subQuestion,
        sourceScope,
        topK: topKPerStep,
        scoreThreshold: 0.05,
      });

      const results = searchRes?.results || [];
      for (const res of results) {
        allRawEvidence.push({
          sourceId: res.documentId || res.webSourceId || '',
          documentId: res.documentId || '',
          chunkId: res._id?.toString() || res.chunkId || '',
          sourceTitle: res.documentTitle || res.title || 'Referenced Source',
          sourceType: res.sourceType || 'document',
          sourceKind: res.sourceKind || (res.sourceType === 'web' ? 'web' : 'document'),
          text: res.text || res.content || '',
          score: res.score || 0.5,
          pageNumber: res.pageNumber || null,
          url: res.url || '',
          domain: res.domain || '',
          subQuestionIndex: i,
        });
        stepEvidenceCount++;
      }
    } catch (err) {
      stepStatus = 'failed';
    }

    updatedPlan.push({
      ...step,
      status: stepStatus,
      evidenceCount: stepEvidenceCount,
    });
  }

  // Deduplicate and balance
  const deduped = deduplicateAndBalanceEvidence(allRawEvidence, 16);

  // Strictly validate ownership and provenance
  const validated = await validateEvidenceProvenance({
    notebookId,
    userId,
    evidenceList: deduped,
  });

  return {
    evidence: validated,
    updatedPlan,
  };
}

module.exports = {
  retrievePlanEvidence,
  deduplicateAndBalanceEvidence,
  validateEvidenceProvenance,
};

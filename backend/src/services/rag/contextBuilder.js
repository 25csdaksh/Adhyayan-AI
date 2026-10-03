const config = require('../../config/env');

/**
 * Calculate simple token set Jaccard similarity between two strings
 * @param {string} strA
 * @param {string} strB
 * @returns {number}
 */
function calculateTextOverlap(strA = '', strB = '') {
  if (!strA || !strB) return 0;
  const setA = new Set(strA.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2));
  const setB = new Set(strB.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2));
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Build structured, grounded context from retrieved vector search chunks
 * Deduplicates near-identical passages, formats clean [SOURCE_X] markers, and bounds character limits.
 *
 * @param {Array<Object>} chunks - Ranked chunks from vectorSearchService
 * @param {Object} [options]
 * @param {number} [options.maxChunks]
 * @param {number} [options.maxCharacters]
 * @returns {{ contextText: string, sourceMap: Map<string, Object>, formattedSources: Array<Object> }}
 */
function buildContext(chunks = [], options = {}) {
  const maxChunks = options.maxChunks || config.rag?.maxContextChunks || 8;
  const maxChars = options.maxCharacters || config.rag?.maxContextChars || 30000;

  if (!Array.isArray(chunks) || chunks.length === 0) {
    return {
      contextText: '',
      sourceMap: new Map(),
      formattedSources: [],
    };
  }

  // 1. Deduplicate highly overlapping chunks (>85% token overlap)
  const uniqueChunks = [];
  for (const chunk of chunks) {
    const chunkText = (chunk.text || '').trim();
    if (!chunkText) continue;

    const isDuplicate = uniqueChunks.some((existing) => {
      const overlap = calculateTextOverlap(chunkText, existing.text);
      return overlap > 0.85;
    });

    if (!isDuplicate) {
      uniqueChunks.push(chunk);
    }

    if (uniqueChunks.length >= maxChunks) {
      break;
    }
  }

  const sourceMap = new Map();
  const formattedSources = [];
  const contextBlocks = [];
  let currentLength = 0;

  for (let i = 0; i < uniqueChunks.length; i++) {
    const chunk = uniqueChunks[i];
    const sourceKey = `SOURCE_${i + 1}`;
    const sourceIndex = i + 1;

    let locationLabel = 'N/A';
    if (chunk.sourceKind === 'web' || chunk.webSourceId || chunk.url) {
      const domain = chunk.domain || (chunk.url ? new URL(chunk.url).hostname : 'Web');
      locationLabel = `Web Source (${domain})`;
    } else if (chunk.pageNumber) {
      locationLabel = `Page ${chunk.pageNumber}`;
    } else if (chunk.pageStart && chunk.pageEnd && chunk.pageStart !== chunk.pageEnd) {
      locationLabel = `Pages ${chunk.pageStart}-${chunk.pageEnd}`;
    } else if (chunk.pageStart) {
      locationLabel = `Page ${chunk.pageStart}`;
    } else {
      locationLabel = `${chunk.sourceType || 'Text'} Source`;
    }

    const docTitle = chunk.documentTitle || 'Untitled Source';
    const chunkSnippet = (chunk.text || '').trim();

    // Context format for Gemini
    const block = `---
[${sourceKey}]
Source Title: ${docTitle}
Location: ${locationLabel} (Chunk #${chunk.chunkIndex !== undefined ? chunk.chunkIndex : i})
${chunk.url ? `URL: ${chunk.url}\n` : ''}
Content:
${chunkSnippet}`;

    if (currentLength + block.length > maxChars && contextBlocks.length > 0) {
      break;
    }

    contextBlocks.push(block);
    currentLength += block.length;

    const sourceMeta = {
      sourceKey,
      sourceIndex,
      chunkId: chunk.chunkId || chunk._id,
      documentId: chunk.documentId || null,
      webSourceId: chunk.webSourceId || null,
      sourceKind: chunk.sourceKind || (chunk.webSourceId ? 'web' : 'notebook'),
      documentTitle: docTitle,
      sourceType: chunk.sourceType || (chunk.webSourceId ? 'webpage' : 'text'),
      pageNumber: chunk.pageNumber || null,
      pageStart: chunk.pageStart || null,
      pageEnd: chunk.pageEnd || null,
      url: chunk.url || null,
      domain: chunk.domain || null,
      chunkIndex: chunk.chunkIndex !== undefined ? chunk.chunkIndex : i,
      score: chunk.score || 0,
      snippet: chunkSnippet.length > 300 ? chunkSnippet.slice(0, 300) + '...' : chunkSnippet,
    };

    sourceMap.set(sourceKey, sourceMeta);
    // Also map plain numbers for flexible model citation matching
    sourceMap.set(String(sourceIndex), sourceMeta);
    formattedSources.push(sourceMeta);
  }

  return {
    contextText: contextBlocks.join('\n\n'),
    sourceMap,
    formattedSources,
  };
}

module.exports = {
  buildContext,
  calculateTextOverlap,
};

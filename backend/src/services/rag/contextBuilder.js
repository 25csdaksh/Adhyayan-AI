const config = require('../../config/env');

/**
 * Build structured, grounded context from retrieved vector search chunks
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

  const selectedChunks = chunks.slice(0, maxChunks);
  const sourceMap = new Map();
  const formattedSources = [];
  const contextBlocks = [];
  let currentLength = 0;

  for (let i = 0; i < selectedChunks.length; i++) {
    const chunk = selectedChunks[i];
    const sourceKey = `SOURCE_${i + 1}`;
    const sourceIndex = i + 1;

    let pageLabel = 'N/A';
    if (chunk.pageNumber) {
      pageLabel = `Page ${chunk.pageNumber}`;
    } else if (chunk.pageStart && chunk.pageEnd && chunk.pageStart !== chunk.pageEnd) {
      pageLabel = `Pages ${chunk.pageStart}-${chunk.pageEnd}`;
    } else if (chunk.pageStart) {
      pageLabel = `Page ${chunk.pageStart}`;
    } else {
      pageLabel = `${chunk.sourceType || 'Text'} Source`;
    }

    const docTitle = chunk.documentTitle || 'Untitled Document';
    const chunkSnippet = (chunk.text || '').trim();

    // Context format for Gemini
    const block = `---
[${sourceKey}]
Document: ${docTitle}
Location: ${pageLabel} (Chunk #${chunk.chunkIndex !== undefined ? chunk.chunkIndex : i})

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
      documentId: chunk.documentId,
      documentTitle: docTitle,
      sourceType: chunk.sourceType || 'text',
      pageNumber: chunk.pageNumber || null,
      pageStart: chunk.pageStart || null,
      pageEnd: chunk.pageEnd || null,
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
};

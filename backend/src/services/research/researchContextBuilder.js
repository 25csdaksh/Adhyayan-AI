const config = require('../../config/env');

/**
 * Build structured research context with explicit provenance tags
 *
 * @param {Array<Object>} chunks
 * @param {Object} [options]
 * @param {number} [options.maxChunks]
 * @param {number} [options.maxCharacters]
 * @returns {{ contextText: string, sourceMap: Map<string, Object>, formattedSources: Array<Object> }}
 */
function buildResearchContext(chunks = [], options = {}) {
  const maxChunks = options.maxChunks || config.research?.maxContextChunks || 10;
  const maxChars = options.maxCharacters || config.research?.maxContextChars || 40000;

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

  let notebookCount = 0;
  let webCount = 0;

  for (let i = 0; i < selectedChunks.length; i++) {
    const chunk = selectedChunks[i];
    const isWeb = chunk.sourceKind === 'web' || !!chunk.webSourceId;

    let sourceKey;
    let sourceIndex;
    let blockHeader;

    if (isWeb) {
      webCount++;
      sourceKey = `WEB_SOURCE_${webCount}`;
      sourceIndex = webCount;
      const domain = chunk.domain || 'web';
      const title = chunk.documentTitle || 'Web Source';
      const url = chunk.url || '';

      blockHeader = `[${sourceKey}]
Type: Web Source
Title: ${title}
Domain: ${domain}
URL: ${url}`;
    } else {
      notebookCount++;
      sourceKey = `NOTEBOOK_SOURCE_${notebookCount}`;
      sourceIndex = notebookCount;
      const title = chunk.documentTitle || 'Notebook Document';
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

      blockHeader = `[${sourceKey}]
Type: Notebook Source
Document: ${title}
Location: ${pageLabel}`;
    }

    const chunkSnippet = (chunk.text || '').trim();
    const block = `---
${blockHeader}

Content Excerpt:
${chunkSnippet}`;

    if (currentLength + block.length > maxChars && contextBlocks.length > 0) {
      break;
    }

    contextBlocks.push(block);
    currentLength += block.length;

    const sourceMeta = {
      sourceKey,
      sourceKind: isWeb ? 'web' : 'notebook',
      sourceIndex,
      chunkId: chunk.chunkId || chunk._id,
      documentId: chunk.documentId || null,
      webSourceId: chunk.webSourceId || null,
      documentTitle: chunk.documentTitle || (isWeb ? 'Web Source' : 'Notebook Document'),
      sourceType: chunk.sourceType || (isWeb ? 'webpage' : 'text'),
      url: chunk.url || null,
      domain: chunk.domain || null,
      pageNumber: chunk.pageNumber || null,
      pageStart: chunk.pageStart || null,
      pageEnd: chunk.pageEnd || null,
      chunkIndex: chunk.chunkIndex !== undefined ? chunk.chunkIndex : i,
      score: chunk.score || 0,
      snippet: chunkSnippet.length > 300 ? chunkSnippet.slice(0, 300) + '...' : chunkSnippet,
    };

    sourceMap.set(sourceKey, sourceMeta);
    // Also map plain index / shorthand for model flexibility
    sourceMap.set(String(i + 1), sourceMeta);
    sourceMap.set(`SOURCE_${i + 1}`, sourceMeta);
    formattedSources.push(sourceMeta);
  }

  return {
    contextText: contextBlocks.join('\n\n'),
    sourceMap,
    formattedSources,
  };
}

module.exports = {
  buildResearchContext,
};

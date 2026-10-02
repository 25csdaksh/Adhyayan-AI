/**
 * Citation Parsing, Validation, and Mapping Service
 */

/**
 * Extract, validate, and normalize citations from AI-generated text
 *
 * @param {string} rawAnswer - Generated text from Gemini containing [SOURCE_X] or [X] tags
 * @param {Map<string, Object>} sourceMap - Map from source keys to chunk metadata
 * @returns {{ cleanAnswer: string, citations: Array<Object> }}
 */
function processCitations(rawAnswer = '', sourceMap = new Map()) {
  if (!rawAnswer || typeof rawAnswer !== 'string') {
    return { cleanAnswer: '', citations: [] };
  }

  const citations = [];
  const seenChunkIds = new Set();
  const sourceKeyToFinalNumber = new Map();

  // Regular expression to find citation tags like [SOURCE_1], [Source 1], [SOURCE 1], [1]
  const tagRegex = /\[(?:SOURCE[_\s]?(\d+)|(\d+))\]/gi;

  let currentCitationNumber = 1;

  // First pass: identify all valid citations in order of appearance
  let match;
  while ((match = tagRegex.exec(rawAnswer)) !== null) {
    const rawNum = match[1] || match[2];
    const sourceKey = `SOURCE_${rawNum}`;
    const sourceData = sourceMap.get(sourceKey) || sourceMap.get(rawNum);

    if (sourceData && !sourceKeyToFinalNumber.has(sourceKey)) {
      const chunkIdStr = (sourceData.chunkId || '').toString();
      if (!seenChunkIds.has(chunkIdStr)) {
        seenChunkIds.add(chunkIdStr);
        sourceKeyToFinalNumber.set(sourceKey, currentCitationNumber);
        sourceKeyToFinalNumber.set(rawNum, currentCitationNumber);

        citations.push({
          citationNumber: currentCitationNumber,
          chunkId: sourceData.chunkId,
          documentId: sourceData.documentId,
          documentTitle: sourceData.documentTitle,
          sourceType: sourceData.sourceType,
          pageNumber: sourceData.pageNumber,
          pageStart: sourceData.pageStart,
          pageEnd: sourceData.pageEnd,
          chunkIndex: sourceData.chunkIndex,
          snippet: sourceData.snippet || '',
        });

        currentCitationNumber++;
      }
    }
  }

  // Second pass: replace source tags with clean normalized numeric citations [1], [2]
  // and remove invalid/hallucinated citation tags cleanly
  const cleanAnswer = rawAnswer.replace(tagRegex, (fullMatch, group1, group2) => {
    const num = group1 || group2;
    const sourceKey = `SOURCE_${num}`;
    const finalNumber = sourceKeyToFinalNumber.get(sourceKey) || sourceKeyToFinalNumber.get(num);

    if (finalNumber !== undefined) {
      return `[${finalNumber}]`;
    }
    // Remove unsupported / hallucinated citation tags
    return '';
  });

  // Clean up any double spaces resulting from removed tags
  const sanitizedAnswer = cleanAnswer.replace(/\s{2,}/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim();

  return {
    cleanAnswer: sanitizedAnswer,
    citations,
  };
}

module.exports = {
  processCitations,
};

/**
 * Research Citation Parsing, Provenance Verification, and Mapping Service
 */

/**
 * Process and validate citations in research reports
 *
 * @param {string} rawAnswer
 * @param {Map<string, Object>} sourceMap
 * @returns {{ cleanAnswer: string, citations: Array<Object> }}
 */
function processResearchCitations(rawAnswer = '', sourceMap = new Map()) {
  if (!rawAnswer || typeof rawAnswer !== 'string') {
    return { cleanAnswer: '', citations: [] };
  }

  const citations = [];
  const seenKeys = new Set();
  const tagToFinalNumber = new Map();

  // Match tags like [NOTEBOOK_SOURCE_1], [WEB_SOURCE_2], [SOURCE_1], [1]
  const tagRegex = /\[(?:(NOTEBOOK_SOURCE_\d+)|(WEB_SOURCE_\d+)|SOURCE_?(\d+)|(\d+))\]/gi;

  let currentCitationNumber = 1;

  // First pass: identify valid citations
  let match;
  while ((match = tagRegex.exec(rawAnswer)) !== null) {
    const fullTag = match[0];
    const notebookTag = match[1];
    const webTag = match[2];
    const sourceNum = match[3] || match[4];

    const lookupKey = notebookTag || webTag || (sourceNum ? `SOURCE_${sourceNum}` : null) || sourceNum;
    const sourceData = sourceMap.get(lookupKey) || sourceMap.get(sourceNum);

    if (sourceData) {
      const uniqueId = sourceData.chunkId?.toString() || `${sourceData.sourceKind}-${sourceData.sourceIndex}`;
      if (!seenKeys.has(uniqueId)) {
        seenKeys.add(uniqueId);
        tagToFinalNumber.set(fullTag, currentCitationNumber);
        if (lookupKey) tagToFinalNumber.set(`[${lookupKey}]`, currentCitationNumber);

        citations.push({
          citationNumber: currentCitationNumber,
          sourceKind: sourceData.sourceKind || 'notebook',
          chunkId: sourceData.chunkId || null,
          documentId: sourceData.documentId || null,
          webSourceId: sourceData.webSourceId || null,
          documentTitle: sourceData.documentTitle || 'Source',
          sourceType: sourceData.sourceType || 'text',
          url: sourceData.url || null,
          domain: sourceData.domain || null,
          pageNumber: sourceData.pageNumber || null,
          pageStart: sourceData.pageStart || null,
          pageEnd: sourceData.pageEnd || null,
          snippet: sourceData.snippet || '',
        });

        currentCitationNumber++;
      } else {
        // Tag was already assigned a number
        const existingNum = citations.find((c) => (c.chunkId?.toString() || `${c.sourceKind}-${c.sourceIndex}`) === uniqueId)?.citationNumber;
        if (existingNum) {
          tagToFinalNumber.set(fullTag, existingNum);
          if (lookupKey) tagToFinalNumber.set(`[${lookupKey}]`, existingNum);
        }
      }
    }
  }

  // Second pass: replace tags with clean [1], [2] badges and remove invalid tags
  const cleanAnswer = rawAnswer.replace(tagRegex, (fullMatch, nb, web, num1, num2) => {
    const finalNumber = tagToFinalNumber.get(fullMatch);
    if (finalNumber !== undefined) {
      return `[${finalNumber}]`;
    }
    // Remove unsupported / hallucinated citation tags
    return '';
  });

  const sanitizedAnswer = cleanAnswer.replace(/\s{2,}/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim();

  return {
    cleanAnswer: sanitizedAnswer,
    citations,
  };
}

module.exports = {
  processResearchCitations,
};

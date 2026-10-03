/**
 * Source Structure Analyzer
 * Extracts headings, sections, page boundaries, and structural segments from source text and chunks
 */

/**
 * Extract structural sections from document chunks and raw text
 * @param {Array<Object>} chunks - Array of chunk objects with text, pageNumber, pageStart, pageEnd, chunkIndex
 * @param {string} [rawText=''] - Full document raw text
 * @returns {Array<{ title: string, summary: string, pageStart: number|null, pageEnd: number|null, chunkIndices: number[] }>}
 */
function analyzeSourceStructure(chunks = [], rawText = '') {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return [];
    }
    return extractSectionsFromRawText(rawText);
  }

  const sections = [];
  const headingRegex = /^(?:#{1,4}\s+(.+)|(?:(?:Chapter|Section|Unit|Part|Module)\s+\d+[:\s]+(.+))|([A-Z0-9][\w\s-]{2,40}):\s*$|(\d+\.\d*\s+[A-Z][\w\s-]{2,50}))/m;

  // Find initial heading if present in chunk 0
  let initialTitle = 'Overview & Introduction';
  const firstLines = (chunks[0]?.text || '').split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of firstLines.slice(0, 3)) {
    const match = line.match(headingRegex);
    if (match) {
      const titleCandidate = (match[1] || match[2] || match[3] || match[4] || line).trim();
      if (titleCandidate.length >= 3 && titleCandidate.length <= 80) {
        initialTitle = titleCandidate;
        break;
      }
    }
  }

  let currentSection = {
    title: initialTitle,
    summary: '',
    pageStart: chunks[0]?.pageNumber || chunks[0]?.pageStart || 1,
    pageEnd: chunks[0]?.pageNumber || chunks[0]?.pageEnd || 1,
    chunkIndices: [0],
    sampleTexts: [chunks[0]?.text?.slice(0, 300) || ''],
  };

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const text = (chunk.text || '').trim();
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    let foundNewHeading = null;

    for (const line of lines.slice(0, 3)) {
      const match = line.match(headingRegex);
      if (match) {
        const titleCandidate = (match[1] || match[2] || match[3] || match[4] || line).trim();
        if (titleCandidate.length >= 3 && titleCandidate.length <= 80) {
          foundNewHeading = titleCandidate;
          break;
        }
      }
    }

    if (foundNewHeading && i > 0 && foundNewHeading !== currentSection.title) {
      // Finalize current section
      currentSection.summary = generateSectionSummary(currentSection.sampleTexts);
      sections.push({
        title: currentSection.title,
        summary: currentSection.summary,
        pageStart: currentSection.pageStart,
        pageEnd: currentSection.pageEnd,
      });

      // Start new section
      currentSection = {
        title: foundNewHeading,
        summary: '',
        pageStart: chunk.pageNumber || chunk.pageStart || null,
        pageEnd: chunk.pageNumber || chunk.pageEnd || null,
        chunkIndices: [i],
        sampleTexts: [text.slice(0, 300)],
      };
    } else {
      if (i > 0) {
        currentSection.chunkIndices.push(i);
      }
      if (chunk.pageNumber || chunk.pageEnd) {
        currentSection.pageEnd = chunk.pageNumber || chunk.pageEnd;
      }
      if (currentSection.sampleTexts.length < 3 && i > 0) {
        currentSection.sampleTexts.push(text.slice(0, 300));
      }
    }
  }

  // Push the final section
  if (currentSection.chunkIndices.length > 0) {
    currentSection.summary = generateSectionSummary(currentSection.sampleTexts);
    sections.push({
      title: currentSection.title,
      summary: currentSection.summary,
      pageStart: currentSection.pageStart,
      pageEnd: currentSection.pageEnd,
    });
  }

  return sections.slice(0, 15);
}

/**
 * Generate a concise 1-2 sentence summary from sample text snippets
 * @param {string[]} sampleTexts
 * @returns {string}
 */
function generateSectionSummary(sampleTexts = []) {
  const combined = sampleTexts.join(' ').replace(/\s+/g, ' ').trim();
  if (!combined) return 'Details and principles for this section.';
  const firstSentenceMatch = combined.match(/^(.*?[.!?])(?:\s|$)/);
  if (firstSentenceMatch && firstSentenceMatch[1].length > 20 && firstSentenceMatch[1].length < 250) {
    return firstSentenceMatch[1].trim();
  }
  return combined.length > 180 ? combined.slice(0, 180) + '...' : combined;
}

/**
 * Extract sections directly from raw text lines when chunks are not supplied
 * @param {string} text
 * @returns {Array<{ title: string, summary: string, pageStart: null, pageEnd: null }>}
 */
function extractSectionsFromRawText(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const sections = [];
  let currentTitle = 'Introduction';
  let currentContent = [];

  for (const line of lines) {
    if (
      line.startsWith('#') ||
      /^(?:Chapter|Section|Module|\d+\.)\s+[A-Z]/.test(line) ||
      (line.length < 60 && line.endsWith(':'))
    ) {
      if (currentContent.length > 0) {
        sections.push({
          title: currentTitle,
          summary: generateSectionSummary([currentContent.join(' ')]),
          pageStart: null,
          pageEnd: null,
        });
        currentContent = [];
      }
      currentTitle = line.replace(/^#+\s*/, '').replace(/:$/, '').trim();
    } else {
      currentContent.push(line);
    }
  }

  if (currentContent.length > 0) {
    sections.push({
      title: currentTitle,
      summary: generateSectionSummary([currentContent.join(' ')]),
      pageStart: null,
      pageEnd: null,
    });
  }

  return sections.slice(0, 15);
}

module.exports = {
  analyzeSourceStructure,
};

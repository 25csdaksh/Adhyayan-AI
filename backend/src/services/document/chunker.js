/**
 * Deterministic text chunker for StudyLM
 * Target: ~800–1200 tokens (~3200–4800 characters) with ~100–150 tokens overlap (~400–600 characters)
 */

const TARGET_CHUNK_CHARS = 3600; // ~900 tokens
const MIN_CHUNK_CHARS = 800;
const OVERLAP_CHARS = 450; // ~112 tokens

/**
 * Approximate token count from character count and word count
 * @param {string} text
 * @returns {number}
 */
function estimateTokenCount(text) {
  if (!text) return 0;
  // Standard rule of thumb: ~4 characters per token in English
  return Math.ceil(text.length / 4);
}

/**
 * Split text into semantic segments (paragraphs/sentences)
 * @param {string} text
 * @returns {string[]}
 */
function splitIntoSegments(text) {
  if (!text) return [];
  // Split on double newlines (paragraphs), or single newlines
  const paragraphs = text.split(/\n\n+/);
  const segments = [];

  for (const para of paragraphs) {
    if (para.length <= TARGET_CHUNK_CHARS) {
      segments.push(para.trim());
    } else {
      // Split large paragraph by sentence boundaries
      const sentences = para.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [para];
      for (const sent of sentences) {
        if (sent.trim()) {
          segments.push(sent.trim());
        }
      }
    }
  }

  return segments.filter(Boolean);
}

/**
 * Create chunks from a single text stream
 * @param {string} fullText
 * @param {Object} options - { notebookId, documentId, pageNumber }
 * @returns {Array<Object>}
 */
function chunkText(fullText, { notebookId, documentId, pageNumber = null } = {}) {
  if (!fullText || !fullText.trim()) return [];

  const segments = splitIntoSegments(fullText);
  if (segments.length === 0) return [];

  const chunks = [];
  let currentChunkText = '';
  let chunkIndex = 0;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    if (!currentChunkText) {
      currentChunkText = segment;
    } else if (currentChunkText.length + segment.length + 2 <= TARGET_CHUNK_CHARS) {
      currentChunkText += '\n\n' + segment;
    } else {
      // Current chunk is full, record it
      if (currentChunkText.trim().length > 0) {
        chunks.push({
          documentId,
          notebookId,
          chunkIndex: chunkIndex++,
          text: currentChunkText.trim(),
          tokenCount: estimateTokenCount(currentChunkText.trim()),
          charCount: currentChunkText.trim().length,
          pageNumber,
          pageStart: pageNumber,
          pageEnd: pageNumber,
          metadata: {},
        });
      }

      // Calculate overlap from the end of currentChunkText
      let overlap = '';
      if (OVERLAP_CHARS > 0 && currentChunkText.length > OVERLAP_CHARS) {
        overlap = currentChunkText.slice(-OVERLAP_CHARS).trim();
        // Snap to last sentence or word boundary in overlap
        const lastSpace = overlap.indexOf(' ');
        if (lastSpace > 0 && lastSpace < 50) {
          overlap = overlap.slice(lastSpace + 1);
        }
      }

      currentChunkText = overlap ? overlap + '\n\n' + segment : segment;
    }
  }

  // Push final remaining chunk
  if (currentChunkText && currentChunkText.trim().length > 0) {
    chunks.push({
      documentId,
      notebookId,
      chunkIndex: chunkIndex++,
      text: currentChunkText.trim(),
      tokenCount: estimateTokenCount(currentChunkText.trim()),
      charCount: currentChunkText.trim().length,
      pageNumber,
      pageStart: pageNumber,
      pageEnd: pageNumber,
      metadata: {},
    });
  }

  return chunks;
}

/**
 * Chunk a page-structured document (e.g. from PDF processor)
 * Preserves pageStart, pageEnd, pageNumber
 * @param {Array<{ pageNumber: number, text: string }>} pages
 * @param {Object} options - { notebookId, documentId }
 * @returns {Array<Object>}
 */
function chunkPages(pages, { notebookId, documentId } = {}) {
  if (!Array.isArray(pages) || pages.length === 0) return [];

  const chunks = [];
  let chunkIndex = 0;
  let currentBuffer = '';
  let currentPageStart = null;
  let currentPageEnd = null;

  for (const page of pages) {
    const pageNum = page.pageNumber;
    const pageText = page.text?.trim() || '';
    if (!pageText) continue;

    // If a single page is very large, chunk within the page
    if (pageText.length > TARGET_CHUNK_CHARS) {
      // Flush previous buffer if exists
      if (currentBuffer.trim()) {
        chunks.push({
          documentId,
          notebookId,
          chunkIndex: chunkIndex++,
          text: currentBuffer.trim(),
          tokenCount: estimateTokenCount(currentBuffer.trim()),
          charCount: currentBuffer.trim().length,
          pageNumber: currentPageStart === currentPageEnd ? currentPageStart : null,
          pageStart: currentPageStart,
          pageEnd: currentPageEnd,
          metadata: {},
        });
        currentBuffer = '';
        currentPageStart = null;
        currentPageEnd = null;
      }

      // Chunk the large page directly
      const pageChunks = chunkText(pageText, { notebookId, documentId, pageNumber: pageNum });
      for (const pc of pageChunks) {
        pc.chunkIndex = chunkIndex++;
        chunks.push(pc);
      }
      continue;
    }

    if (!currentBuffer) {
      currentBuffer = pageText;
      currentPageStart = pageNum;
      currentPageEnd = pageNum;
    } else if (currentBuffer.length + pageText.length + 2 <= TARGET_CHUNK_CHARS) {
      currentBuffer += '\n\n' + pageText;
      currentPageEnd = pageNum;
    } else {
      // Save current buffer
      chunks.push({
        documentId,
        notebookId,
        chunkIndex: chunkIndex++,
        text: currentBuffer.trim(),
        tokenCount: estimateTokenCount(currentBuffer.trim()),
        charCount: currentBuffer.trim().length,
        pageNumber: currentPageStart === currentPageEnd ? currentPageStart : null,
        pageStart: currentPageStart,
        pageEnd: currentPageEnd,
        metadata: {},
      });

      // Calculate overlap from current buffer
      let overlap = '';
      if (OVERLAP_CHARS > 0 && currentBuffer.length > OVERLAP_CHARS) {
        overlap = currentBuffer.slice(-OVERLAP_CHARS).trim();
        const lastSpace = overlap.indexOf(' ');
        if (lastSpace > 0 && lastSpace < 50) {
          overlap = overlap.slice(lastSpace + 1);
        }
      }

      currentBuffer = overlap ? overlap + '\n\n' + pageText : pageText;
      currentPageStart = currentPageEnd; // overlap carries start page
      currentPageEnd = pageNum;
    }
  }

  // Push final remaining buffer
  if (currentBuffer.trim()) {
    chunks.push({
      documentId,
      notebookId,
      chunkIndex: chunkIndex++,
      text: currentBuffer.trim(),
      tokenCount: estimateTokenCount(currentBuffer.trim()),
      charCount: currentBuffer.trim().length,
      pageNumber: currentPageStart === currentPageEnd ? currentPageStart : null,
      pageStart: currentPageStart,
      pageEnd: currentPageEnd,
      metadata: {},
    });
  }

  return chunks;
}

module.exports = {
  chunkText,
  chunkPages,
  estimateTokenCount,
  TARGET_CHUNK_CHARS,
  OVERLAP_CHARS,
};

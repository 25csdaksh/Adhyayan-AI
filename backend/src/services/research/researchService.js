const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/env');
const { semanticSearch } = require('../search/vectorSearchService');
const { searchWeb } = require('../webSearch/webSearchService');
const { ingestWebSource } = require('../web/webSourceService');
const { buildResearchContext } = require('./researchContextBuilder');
const { buildResearchPrompt } = require('./researchPromptBuilder');
const { processResearchCitations } = require('./researchCitationService');
const { isLiveGeminiConfigured, isPseudoFallbackEnabled } = require('../embedding/embeddingService');

const INSUFFICIENT_RESEARCH_MSG =
  "I couldn't find enough information about this in your selected research sources. Try expanding your search terms, adjusting the source scope, or uploading relevant study documents.";

/**
 * Deterministic research report generator for dev/offline testing
 */
function generateDeterministicDevResearch(query, formattedSources = []) {
  if (formattedSources.length === 0) {
    return INSUFFICIENT_RESEARCH_MSG;
  }

  const qLower = query.toLowerCase();
  const matchedSources = formattedSources.filter((s) => {
    const text = (s.snippet || '').toLowerCase() + ' ' + (s.documentTitle || '').toLowerCase();
    const words = qLower.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 3);
    return words.length === 0 || words.some((w) => text.includes(w));
  });

  if (matchedSources.length === 0) {
    return INSUFFICIENT_RESEARCH_MSG;
  }

  const primary = matchedSources[0];
  const secondary = matchedSources[1] || primary;

  const tag1 = primary.sourceKey || 'SOURCE_1';
  const tag2 = secondary.sourceKey || 'SOURCE_2';

  let report = `### Grounded Research Synthesis: "${query}"\n\n`;
  report += `According to **${primary.documentTitle}** [${tag1}], ${primary.snippet || 'the primary finding is supported by the evidence.'}\n\n`;

  if (matchedSources.length > 1) {
    report += `Additionally, evidence from **${secondary.documentTitle}** [${tag2}] emphasizes complementary data regarding this topic.\n\n`;
  }

  // If sources appear to present differing perspectives
  if (primary.sourceKind !== secondary.sourceKind && matchedSources.length > 1) {
    report += `*Source Correlation Note*: Notebook sources [${tag1}] and Web sources [${tag2}] provide aligned multi-perspective context.\n`;
  }

  return report;
}

/**
 * Execute advanced multi-source research query
 *
 * @param {Object} params
 * @param {string|import('mongoose').Types.ObjectId} params.notebookId
 * @param {string|import('mongoose').Types.ObjectId} params.userId
 * @param {string} params.query
 * @param {'notebook'|'web'|'all'} [params.sourceScope='all']
 * @param {number} [params.topK=8]
 * @param {Array<Object>} [params.history=[]]
 * @returns {Promise<{ answer: string, citations: Array<Object>, sources: Array<Object>, retrieval: Object, model: string }>}
 */
async function executeResearch({
  notebookId,
  userId,
  query,
  sourceScope = 'all',
  topK = config.research?.maxContextChunks || 10,
  history = [],
}) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    throw new Error('Research query text is required');
  }

  const cleanQuery = query.trim();
  const maxLen = config.research?.maxQueryLength || 2000;
  if (cleanQuery.length > maxLen) {
    throw new Error(`Research query cannot exceed ${maxLen} characters`);
  }

  const validScope = ['notebook', 'web', 'all'].includes(sourceScope) ? sourceScope : 'all';
  const boundedTopK = Math.min(
    config.research?.maxContextChunks || 10,
    Math.max(1, parseInt(topK, 10) || 8)
  );

  // 1. Initial vector search retrieval scoped to notebook/web/all
  let searchResult = await semanticSearch({
    notebookId,
    query: cleanQuery,
    sourceScope: validScope,
    topK: boundedTopK,
    scoreThreshold: 0.1,
  });

  let chunks = searchResult?.results || [];

  // 2. On-demand web retrieval if scope includes web and we have insufficient web evidence
  const webChunksCount = chunks.filter((c) => c.sourceKind === 'web' || c.webSourceId).length;
  if ((validScope === 'web' || validScope === 'all') && webChunksCount === 0) {
    try {
      const searchHits = await searchWeb(cleanQuery, { limit: 2 });
      for (const hit of searchHits) {
        try {
          await ingestWebSource({
            notebookId,
            userId,
            url: hit.url,
          });
        } catch {
          // If a single URL fails ingestion, continue with next
        }
      }

      // Re-query vector search to include freshly ingested web chunks
      searchResult = await semanticSearch({
        notebookId,
        query: cleanQuery,
        sourceScope: validScope,
        topK: boundedTopK,
        scoreThreshold: 0.1,
      });
      chunks = searchResult?.results || [];
    } catch (webErr) {
      console.warn('[Research Web Error] On-demand web search error:', webErr.message);
    }
  }

  // 3. Insufficient evidence check
  if (chunks.length === 0) {
    return {
      answer: INSUFFICIENT_RESEARCH_MSG,
      citations: [],
      sources: [],
      retrieval: {
        topK: boundedTopK,
        sourceScope: validScope,
        retrievedChunkCount: 0,
      },
      model: 'system-grounding',
    };
  }

  // 4. Build research context with explicit provenance identifiers
  const { contextText, sourceMap, formattedSources } = buildResearchContext(chunks, {
    maxChunks: boundedTopK,
  });

  // 5. Build prompt with prompt injection defense instructions
  const { systemInstruction, prompt } = buildResearchPrompt({
    query: cleanQuery,
    contextText,
    sourceScope: validScope,
    history,
  });

  let rawOutput = null;
  let modelName = config.gemini?.chatModel || 'gemini-1.5-flash';

  if (isLiveGeminiConfigured()) {
    try {
      const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.2,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      rawOutput = response.text();
    } catch (err) {
      if (isPseudoFallbackEnabled()) {
        rawOutput = null;
        modelName = 'dev-simulation';
      } else {
        throw new Error(`Research generation failed: ${err.message}`);
      }
    }
  } else if (isPseudoFallbackEnabled()) {
    rawOutput = null;
    modelName = 'dev-simulation';
  } else {
    throw new Error('Gemini API key is not configured and development fallback is disabled.');
  }

  let finalAnswer;
  if (rawOutput) {
    finalAnswer = rawOutput;
  } else {
    finalAnswer = generateDeterministicDevResearch(cleanQuery, formattedSources);
  }

  // 6. Process citations, provenance, and deduplication
  const { cleanAnswer, citations } = processResearchCitations(finalAnswer, sourceMap);

  return {
    answer: cleanAnswer,
    citations,
    sources: formattedSources,
    retrieval: {
      topK: boundedTopK,
      sourceScope: validScope,
      retrievedChunkCount: chunks.length,
    },
    model: modelName,
  };
}

module.exports = {
  INSUFFICIENT_RESEARCH_MSG,
  executeResearch,
};

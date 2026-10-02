const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/env');
const { semanticSearch } = require('../search/vectorSearchService');
const { isLiveGeminiConfigured, isPseudoFallbackEnabled } = require('../embedding/embeddingService');
const { buildContext } = require('./contextBuilder');
const { buildPrompt, SYSTEM_INSTRUCTION } = require('./promptBuilder');
const { processCitations } = require('./citationService');

const INSUFFICIENT_INFO_RESPONSE =
  "I couldn't find enough information about this in your notebook sources. Try asking about a topic covered in your uploaded materials.";

/**
 * Generate a deterministic answer for offline/test environments
 * @param {string} question
 * @param {Array<Object>} formattedSources
 * @returns {string}
 */
function generateDeterministicDevAnswer(question, formattedSources = []) {
  if (formattedSources.length === 0) {
    return INSUFFICIENT_INFO_RESPONSE;
  }

  const primarySource = formattedSources[0];
  const qWords = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const snippetLower = (primarySource.snippet || '').toLowerCase();
  const titleLower = (primarySource.documentTitle || '').toLowerCase();

  const matchCount = qWords.filter((w) => snippetLower.includes(w) || titleLower.includes(w)).length;
  if (matchCount === 0) {
    return INSUFFICIENT_INFO_RESPONSE;
  }

  const summarySnippet = primarySource.snippet || 'the uploaded study material';
  return `Based on **${primarySource.documentTitle}** [SOURCE_1], ${summarySnippet}`;
}

/**
 * Generate a grounded RAG response for a user question within a specific notebook
 *
 * @param {Object} params
 * @param {string|import('mongoose').Types.ObjectId} params.notebookId
 * @param {string} params.question
 * @param {Array<{ role: string, content: string }>} [params.history=[]]
 * @param {number} [params.topK]
 * @param {number} [params.scoreThreshold]
 * @returns {Promise<{ answer: string, citations: Array<Object>, retrieval: Object, model: string }>}
 */
async function generateGroundedResponse({
  notebookId,
  question,
  history = [],
  topK = config.rag?.defaultTopK || 5,
  scoreThreshold = config.rag?.defaultScoreThreshold !== undefined ? config.rag.defaultScoreThreshold : 0.1,
}) {
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    throw new Error('User question text is required');
  }

  const cleanQuestion = question.trim();
  const maxLen = config.rag?.maxChatMessageLength || 5000;
  if (cleanQuestion.length > maxLen) {
    throw new Error(`Question length cannot exceed ${maxLen} characters`);
  }

  const boundedTopK = Math.min(
    config.rag?.maxTopK || 10,
    Math.max(1, parseInt(topK, 10) || 5)
  );
  const boundedThreshold = Math.max(0, Math.min(1, parseFloat(scoreThreshold) || 0));

  // 1. Vector Search Retrieval
  let searchResult;
  try {
    searchResult = await semanticSearch({
      notebookId,
      query: cleanQuestion,
      topK: boundedTopK,
      scoreThreshold: boundedThreshold,
    });
  } catch (searchErr) {
    throw new Error(`Unable to retrieve notebook sources: ${searchErr.message}`);
  }

  const retrievedChunks = searchResult?.results || [];

  // 2. Insufficient information check if retrieval is empty
  if (retrievedChunks.length === 0) {
    return {
      answer: INSUFFICIENT_INFO_RESPONSE,
      citations: [],
      retrieval: {
        topK: boundedTopK,
        scoreThreshold: boundedThreshold,
        retrievedChunkCount: 0,
      },
      model: 'grounding-guard',
    };
  }

  // 3. Context Construction
  const { contextText, sourceMap, formattedSources } = buildContext(retrievedChunks);

  // 4. Prompt Construction
  const prompt = buildPrompt({
    question: cleanQuestion,
    contextText,
    history,
  });

  const chatModelName = config.gemini?.chatModel || 'gemini-1.5-flash';
  let rawAnswer = '';

  // 5. Gemini Generation or Dev Fallback
  if (!isLiveGeminiConfigured()) {
    if (isPseudoFallbackEnabled()) {
      rawAnswer = generateDeterministicDevAnswer(cleanQuestion, formattedSources);
    } else {
      throw new Error(
        'Google Gemini API key is not configured and pseudo-embedding fallback is disabled.'
      );
    }
  } else {
    try {
      const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
      const model = genAI.getGenerativeModel({
        model: chatModelName,
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      const result = await model.generateContent(prompt);
      rawAnswer = result?.response?.text() || '';

      if (!rawAnswer || rawAnswer.trim().length === 0) {
        throw new Error('Gemini API returned an empty response');
      }
    } catch (apiErr) {
      throw new Error(`Failed to generate response from AI: ${apiErr.message || 'Unknown provider error'}`);
    }
  }

  // 6. Citation Extraction and Validation
  const { cleanAnswer, citations } = processCitations(rawAnswer, sourceMap);

  // If model explicitly replied with insufficient info phrase, clear any accidental citations
  const isInsufficient =
    cleanAnswer.toLowerCase().includes("couldn't find enough information") ||
    cleanAnswer.toLowerCase().includes('not contain enough information') ||
    cleanAnswer.toLowerCase().includes('does not contain enough information');

  return {
    answer: cleanAnswer || rawAnswer,
    citations: isInsufficient ? [] : citations,
    retrieval: {
      topK: boundedTopK,
      scoreThreshold: boundedThreshold,
      retrievedChunkCount: retrievedChunks.length,
    },
    model: isLiveGeminiConfigured() ? chatModelName : 'dev-simulation',
  };
}

module.exports = {
  generateGroundedResponse,
  INSUFFICIENT_INFO_RESPONSE,
};

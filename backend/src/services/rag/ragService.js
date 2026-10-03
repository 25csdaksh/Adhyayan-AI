const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/env');
const { semanticSearch } = require('../search/vectorSearchService');
const { isLiveGeminiConfigured, isPseudoFallbackEnabled } = require('../embedding/embeddingService');
const { buildContext } = require('./contextBuilder');
const { buildPrompt, SYSTEM_INSTRUCTION } = require('./promptBuilder');
const { processCitations } = require('./citationService');
const { analyzeQuery, extractQueryConcepts } = require('./queryAnalyzer');

const INSUFFICIENT_INFO_RESPONSE =
  "I couldn't find enough information about this in your notebook sources. Try asking about a topic covered in your uploaded materials.";

const STOP_WORDS = new Set([
  'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'can', 'could', 'should', 'would', 'will', 'shall',
  'may', 'might', 'must', 'the', 'a', 'an', 'and', 'or', 'but', 'if',
  'then', 'else', 'for', 'of', 'by', 'with', 'about', 'against', 'between',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to',
  'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
  'further', 'then', 'once', 'here', 'there', 'all', 'any', 'both', 'each',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now',
  'give', 'tell', 'show', 'explain', 'describe', 'find', 'list', 'detail',
  'details', 'information', 'info', 'content', 'contents', 'document',
  'documents', 'pdf', 'pdfs', 'file', 'files', 'source', 'sources',
  'material', 'materials', 'note', 'notes', 'notebook', 'this', 'that',
  'these', 'those', 'please', 'help', 'me', 'my', 'you', 'your', 'it',
  'its', 'they', 'them', 'their', 'we', 'us', 'our'
]);

/**
 * Generate a grounded deterministic answer for offline/test environments
 * @param {string} question
 * @param {Array<Object>} formattedSources
 * @param {Object} queryAnalysis
 * @returns {string}
 */
function generateDeterministicDevAnswer(question, formattedSources = [], queryAnalysis = {}) {
  if (!formattedSources || formattedSources.length === 0) {
    return INSUFFICIENT_INFO_RESPONSE;
  }

  const primarySource = formattedSources[0];
  const secondarySource = formattedSources[1] || primarySource;
  const qLower = (question || '').toLowerCase().trim();

  // 1. Check for Summary / Overview intent
  if (queryAnalysis.intent === 'summary' || queryAnalysis.intent === 'overview') {
    const summarySnippet = primarySource.snippet || 'the uploaded study material';
    return `Based on **${primarySource.documentTitle || 'your notebook source'}** [SOURCE_1], the document provides a comprehensive overview: ${summarySnippet}`;
  }

  // 2. Extract content keywords
  const contentWords = qLower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const allSourcesText = formattedSources
    .map((s) => `${s.documentTitle || ''} ${s.snippet || ''}`)
    .join(' ')
    .toLowerCase();

  // If query is an unsupported / unrelated topic (e.g. "quantum entanglement" when reading OS/Networks), verify presence
  if (contentWords.length > 0) {
    const hasRelevantMatch = contentWords.some((w) => allSourcesText.includes(w));
    if (!hasRelevantMatch) {
      return INSUFFICIENT_INFO_RESPONSE;
    }
  }

  // 3. Comparison query
  if (queryAnalysis.intent === 'comparison' && queryAnalysis.subQueries?.length >= 2) {
    const c1 = queryAnalysis.subQueries[0];
    const c2 = queryAnalysis.subQueries[1];
    return `According to **${primarySource.documentTitle || 'your sources'}** [SOURCE_1] and related materials [SOURCE_2], the key distinction between **${c1}** and **${c2}** lies in their operational characteristics and protocol requirements: ${primarySource.snippet || ''} [SOURCE_1] whereas ${secondarySource.snippet || ''} [SOURCE_2].`;
  }

  // 4. Page-specific query
  if (queryAnalysis.intent === 'page_specific' && queryAnalysis.targetPage) {
    const pageNum = queryAnalysis.targetPage;
    return `According to Page ${pageNum} of **${primarySource.documentTitle || 'the document'}** [SOURCE_1]: ${primarySource.snippet || 'the section covers domain mechanisms.'}`;
  }

  // 5. Definition query
  if (queryAnalysis.intent === 'definition' && queryAnalysis.concepts?.length > 0) {
    const term = queryAnalysis.concepts[0];
    return `According to **${primarySource.documentTitle || 'your notebook source'}** [SOURCE_1], **${term}** is defined as follows: ${primarySource.snippet || ''}`;
  }

  // 6. Follow-up query
  if (queryAnalysis.isFollowUp && queryAnalysis.resolvedSubject) {
    return `Continuing from our discussion on **${queryAnalysis.resolvedSubject}**, according to **${primarySource.documentTitle || 'your notebook source'}** [SOURCE_1]: ${primarySource.snippet || ''}`;
  }

  // 7. General specific grounded answer
  const summarySnippet = primarySource.snippet || 'the uploaded study material';
  return `Based on **${primarySource.documentTitle || 'your notebook source'}** [SOURCE_1], ${summarySnippet}`;
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
 * @param {'notebook'|'web'|'all'} [params.sourceScope='all']
 * @returns {Promise<{ answer: string, citations: Array<Object>, retrieval: Object, model: string }>}
 */
async function generateGroundedResponse({
  notebookId,
  question,
  history = [],
  topK = config.rag?.defaultTopK || 5,
  scoreThreshold = config.rag?.defaultScoreThreshold !== undefined ? config.rag.defaultScoreThreshold : 0.1,
  sourceScope = 'all',
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

  // 1. Analyze query intent, concepts, page references, and follow-up references
  const queryAnalysis = analyzeQuery(cleanQuestion, history);

  // 2. Vector Search Retrieval with multi-source scoping
  let searchResult;
  try {
    searchResult = await semanticSearch({
      notebookId,
      query: queryAnalysis.effectiveQuery || cleanQuestion,
      sourceScope,
      topK: boundedTopK,
      scoreThreshold: boundedThreshold,
      queryAnalysis,
    });
  } catch (searchErr) {
    throw new Error(`Unable to retrieve notebook sources: ${searchErr.message}`);
  }

  const retrievedChunks = searchResult?.results || [];

  // 3. Insufficient information check if retrieval is empty
  if (retrievedChunks.length === 0) {
    return {
      answer: INSUFFICIENT_INFO_RESPONSE,
      citations: [],
      retrieval: {
        topK: boundedTopK,
        scoreThreshold: boundedThreshold,
        retrievedChunkCount: 0,
        queryAnalysis,
      },
      model: 'grounding-guard',
    };
  }

  // 4. Grounded Context Construction with deduplication
  const { contextText, sourceMap, formattedSources } = buildContext(retrievedChunks);

  // 5. Prompt Construction
  const prompt = buildPrompt({
    question: cleanQuestion,
    contextText,
    history,
  });

  const chatModelName = config.gemini?.chatModel || 'gemini-2.5-flash';
  let rawAnswer = '';

  // 6. Gemini Generation or Dev Fallback
  if (!isLiveGeminiConfigured()) {
    if (isPseudoFallbackEnabled()) {
      rawAnswer = generateDeterministicDevAnswer(cleanQuestion, formattedSources, queryAnalysis);
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

  // 7. Citation Extraction and Validation
  const { cleanAnswer, citations } = processCitations(rawAnswer, sourceMap);

  // If model explicitly replied with insufficient info phrase, clear any accidental citations
  const lowerAns = (cleanAnswer || rawAnswer).toLowerCase();
  const isInsufficient =
    lowerAns.includes("couldn't find enough information") ||
    lowerAns.includes('could not find enough information') ||
    lowerAns.includes('not contain enough information') ||
    lowerAns.includes('does not contain enough information');

  return {
    answer: isInsufficient ? INSUFFICIENT_INFO_RESPONSE : (cleanAnswer || rawAnswer),
    citations: isInsufficient ? [] : citations,
    retrieval: {
      topK: boundedTopK,
      scoreThreshold: boundedThreshold,
      retrievedChunkCount: retrievedChunks.length,
      queryAnalysis: {
        intent: queryAnalysis.intent,
        concepts: queryAnalysis.concepts,
        isFollowUp: queryAnalysis.isFollowUp,
      },
    },
    model: isLiveGeminiConfigured() ? chatModelName : 'dev-simulation',
  };
}

module.exports = {
  generateGroundedResponse,
  INSUFFICIENT_INFO_RESPONSE,
};

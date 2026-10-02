const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/env');
const StudyToolResult = require('../../models/StudyToolResult');
const { retrieveStudyContext } = require('./studyContextBuilder');
const {
  buildSummaryPrompt,
  buildFlashcardsPrompt,
  buildQuizPrompt,
  buildMindMapPrompt,
} = require('./studyPromptBuilder');
const {
  validateSummaryOutput,
  validateFlashcardsOutput,
  validateQuizOutput,
  validateMindMapOutput,
  safeJsonParse,
} = require('./studyOutputValidator');
const { processCitations } = require('../rag/citationService');
const { isLiveGeminiConfigured, isPseudoFallbackEnabled } = require('../embedding/embeddingService');

const INSUFFICIENT_INFO_MSG =
  "I couldn't find enough information in your notebook sources to generate study materials. Please add or process study documents first.";

/**
 * Generate deterministic fallback data for development/offline testing
 */
function generateDevSummary(formattedSources, mode, topic) {
  const primary = formattedSources[0] || {};
  const secondary = formattedSources[1] || primary;
  const docTitle = primary.documentTitle || 'Notebook Sources';

  const isShort = mode === 'short';
  return {
    title: topic ? `Summary: ${topic}` : `Summary of ${docTitle}`,
    overview: isShort
      ? `A concise overview of ${docTitle} [SOURCE_1], summarizing key foundational principles.`
      : `This comprehensive summary reviews the core concepts in ${docTitle} [SOURCE_1] and related topics [SOURCE_2]. It synthesizes the main arguments and experimental or theoretical frameworks presented in the materials.`,
    keyPoints: [
      `Core concept introduction and fundamental terminology [SOURCE_1]`,
      `Practical applications and architectural mechanisms [SOURCE_1]`,
      `Key relationships and analytical conclusions [SOURCE_2]`,
    ],
    concepts: [
      {
        term: 'Primary Concept',
        definition: `Fundamental concept described in ${docTitle} [SOURCE_1].`,
      },
      {
        term: 'Secondary Principle',
        definition: `Supporting principle detailed in the materials [SOURCE_2].`,
      },
    ],
  };
}

function generateDevFlashcards(formattedSources, count, difficulty, topic) {
  const primary = formattedSources[0] || {};
  const docTitle = primary.documentTitle || 'Sources';
  const cards = [];

  const targetCount = Math.min(Math.max(1, count || 10), 30);
  const diffs = ['easy', 'medium', 'hard'];

  for (let i = 0; i < targetCount; i++) {
    const cardDiff = difficulty === 'mixed' ? diffs[i % 3] : difficulty;
    cards.push({
      question: `What is key concept #${i + 1} covered in ${docTitle}?`,
      answer: `Concept #${i + 1} represents an essential rule or mechanism outlined in ${docTitle} [SOURCE_1].`,
      difficulty: cardDiff,
      citation: '[SOURCE_1]',
    });
  }

  return cards;
}

function generateDevQuiz(formattedSources, count, difficulty, topic) {
  const primary = formattedSources[0] || {};
  const docTitle = primary.documentTitle || 'Sources';
  const questions = [];

  const targetCount = Math.min(Math.max(1, count || 10), 20);
  const diffs = ['easy', 'medium', 'hard'];

  for (let i = 0; i < targetCount; i++) {
    const qDiff = difficulty === 'mixed' ? diffs[i % 3] : difficulty;
    const correctIdx = i % 4;
    const options = [
      `Primary mechanism as detailed in ${docTitle}`,
      `Secondary alternative mechanism`,
      `Inverse or opposing mechanism`,
      `Unrelated general knowledge concept`,
    ];

    questions.push({
      question: `According to ${docTitle}, which statement accurately describes principle #${i + 1}?`,
      options,
      correctAnswer: correctIdx,
      explanation: `Option ${String.fromCharCode(65 + correctIdx)} is correct based on the study text in [SOURCE_1].`,
      difficulty: qDiff,
      citation: '[SOURCE_1]',
    });
  }

  return questions;
}

function generateDevMindMap(formattedSources, topic) {
  const primary = formattedSources[0] || {};
  const secondary = formattedSources[1] || primary;
  const mainTitle = topic || primary.documentTitle || 'Notebook Study Knowledge';

  return {
    title: mainTitle,
    children: [
      {
        title: `Core Principles [SOURCE_1]`,
        children: [
          { title: `Foundational Theory [SOURCE_1]`, children: [] },
          { title: `Key Terminology & Definitions [SOURCE_1]`, children: [] },
        ],
      },
      {
        title: `Practical Applications [SOURCE_2]`,
        children: [
          { title: `Implementation Details [SOURCE_2]`, children: [] },
          { title: `Comparative Analysis [SOURCE_1]`, children: [] },
        ],
      },
    ],
  };
}

/**
 * Call Gemini Generative AI or fallback cleanly
 */
async function callGeminiForStudyTool(systemInstruction, userPrompt) {
  const modelName = config.gemini?.chatModel || 'gemini-1.5-flash';

  if (isLiveGeminiConfigured()) {
    const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    return {
      text: response.text(),
      model: modelName,
    };
  }

  if (isPseudoFallbackEnabled()) {
    return {
      text: null,
      model: 'dev-simulation',
    };
  }

  throw new Error('Gemini API key is not configured and development fallback is disabled.');
}

/**
 * Generate a grounded summary
 */
async function generateSummary({ notebookId, userId, mode = 'detailed', topic = '' }) {
  const validMode = mode === 'short' ? 'short' : 'detailed';
  const cleanTopic = typeof topic === 'string' ? topic.trim().slice(0, 100) : '';

  const { contextText, sourceMap, formattedSources, chunkCount } = await retrieveStudyContext({
    notebookId,
    topic: cleanTopic,
  });

  if (chunkCount === 0 || !contextText) {
    throw new Error(INSUFFICIENT_INFO_MSG);
  }

  const { systemInstruction, prompt } = buildSummaryPrompt({
    contextText,
    mode: validMode,
    topic: cleanTopic,
  });

  let rawOutput = null;
  let modelName = 'gemini-1.5-flash';

  try {
    const aiResponse = await callGeminiForStudyTool(systemInstruction, prompt);
    rawOutput = aiResponse.text;
    modelName = aiResponse.model;
  } catch (err) {
    if (isPseudoFallbackEnabled()) {
      rawOutput = null;
      modelName = 'dev-simulation';
    } else {
      throw new Error(`AI generation failed: ${err.message}`);
    }
  }

  let summaryData;
  if (rawOutput) {
    summaryData = validateSummaryOutput(rawOutput);
  } else {
    summaryData = generateDevSummary(formattedSources, validMode, cleanTopic);
  }

  // Process and resolve citations in overview, keyPoints, and concepts
  const allTextForCitations = [
    summaryData.overview,
    ...(summaryData.keyPoints || []),
    ...(summaryData.concepts || []).map((c) => `${c.term}: ${c.definition}`),
  ].join('\n');

  const { citations } = processCitations(allTextForCitations, sourceMap);

  // Clean overview and points
  const cleanOverview = processCitations(summaryData.overview, sourceMap).cleanAnswer;
  const cleanKeyPoints = (summaryData.keyPoints || []).map(
    (kp) => processCitations(kp, sourceMap).cleanAnswer
  );
  const cleanConcepts = (summaryData.concepts || []).map((c) => ({
    term: c.term,
    definition: processCitations(c.definition, sourceMap).cleanAnswer,
  }));

  const finalResult = {
    title: summaryData.title,
    overview: cleanOverview,
    keyPoints: cleanKeyPoints,
    concepts: cleanConcepts,
    mode: validMode,
  };

  const studyRecord = await StudyToolResult.create({
    userId,
    notebookId,
    toolType: 'summary',
    title: summaryData.title || (cleanTopic ? `Summary: ${cleanTopic}` : 'Notebook Summary'),
    input: { mode: validMode, topic: cleanTopic },
    result: finalResult,
    citations,
    metadata: {
      model: modelName,
      retrievedChunkCount: chunkCount,
    },
  });

  return studyRecord;
}

/**
 * Generate grounded flashcards
 */
async function generateFlashcards({
  notebookId,
  userId,
  count = 10,
  difficulty = 'mixed',
  topic = '',
}) {
  const boundedCount = Math.min(30, Math.max(1, parseInt(count, 10) || 10));
  const validDiffs = new Set(['easy', 'medium', 'hard', 'mixed']);
  const validDifficulty = validDiffs.has(difficulty) ? difficulty : 'mixed';
  const cleanTopic = typeof topic === 'string' ? topic.trim().slice(0, 100) : '';

  const { contextText, sourceMap, formattedSources, chunkCount } = await retrieveStudyContext({
    notebookId,
    topic: cleanTopic,
  });

  if (chunkCount === 0 || !contextText) {
    throw new Error(INSUFFICIENT_INFO_MSG);
  }

  const { systemInstruction, prompt } = buildFlashcardsPrompt({
    contextText,
    count: boundedCount,
    difficulty: validDifficulty,
    topic: cleanTopic,
  });

  let rawOutput = null;
  let modelName = 'gemini-1.5-flash';

  try {
    const aiResponse = await callGeminiForStudyTool(systemInstruction, prompt);
    rawOutput = aiResponse.text;
    modelName = aiResponse.model;
  } catch (err) {
    if (isPseudoFallbackEnabled()) {
      rawOutput = null;
      modelName = 'dev-simulation';
    } else {
      throw new Error(`AI generation failed: ${err.message}`);
    }
  }

  let cards;
  if (rawOutput) {
    cards = validateFlashcardsOutput(rawOutput, boundedCount);
  } else {
    cards = generateDevFlashcards(formattedSources, boundedCount, validDifficulty, cleanTopic);
  }

  if (!cards || cards.length === 0) {
    cards = generateDevFlashcards(formattedSources, boundedCount, validDifficulty, cleanTopic);
  }

  // Process citations for all cards
  const allCardCitations = [];
  const processedCards = cards.map((card, idx) => {
    const textToScan = `${card.answer} ${(card.rawCitationTags || []).join(' ')}`;
    const { cleanAnswer, citations } = processCitations(textToScan, sourceMap);
    citations.forEach((c) => allCardCitations.push(c));

    return {
      cardIndex: idx + 1,
      question: card.question,
      answer: cleanAnswer,
      difficulty: card.difficulty,
      citations,
    };
  });

  // Deduplicate global citations list
  const uniqueCitations = [];
  const seenChunkIds = new Set();
  for (const c of allCardCitations) {
    const cId = (c.chunkId || '').toString();
    if (!seenChunkIds.has(cId)) {
      seenChunkIds.add(cId);
      uniqueCitations.push(c);
    }
  }

  const studyRecord = await StudyToolResult.create({
    userId,
    notebookId,
    toolType: 'flashcards',
    title: cleanTopic ? `Flashcards: ${cleanTopic}` : `Study Flashcards (${processedCards.length} cards)`,
    input: { count: boundedCount, difficulty: validDifficulty, topic: cleanTopic },
    result: {
      cards: processedCards,
      totalCards: processedCards.length,
    },
    citations: uniqueCitations,
    metadata: {
      model: modelName,
      retrievedChunkCount: chunkCount,
    },
  });

  return studyRecord;
}

/**
 * Generate a grounded multiple-choice quiz
 */
async function generateQuiz({
  notebookId,
  userId,
  count = 10,
  difficulty = 'mixed',
  topic = '',
}) {
  const boundedCount = Math.min(20, Math.max(1, parseInt(count, 10) || 10));
  const validDiffs = new Set(['easy', 'medium', 'hard', 'mixed']);
  const validDifficulty = validDiffs.has(difficulty) ? difficulty : 'mixed';
  const cleanTopic = typeof topic === 'string' ? topic.trim().slice(0, 100) : '';

  const { contextText, sourceMap, formattedSources, chunkCount } = await retrieveStudyContext({
    notebookId,
    topic: cleanTopic,
  });

  if (chunkCount === 0 || !contextText) {
    throw new Error(INSUFFICIENT_INFO_MSG);
  }

  const { systemInstruction, prompt } = buildQuizPrompt({
    contextText,
    count: boundedCount,
    difficulty: validDifficulty,
    topic: cleanTopic,
  });

  let rawOutput = null;
  let modelName = 'gemini-1.5-flash';

  try {
    const aiResponse = await callGeminiForStudyTool(systemInstruction, prompt);
    rawOutput = aiResponse.text;
    modelName = aiResponse.model;
  } catch (err) {
    if (isPseudoFallbackEnabled()) {
      rawOutput = null;
      modelName = 'dev-simulation';
    } else {
      throw new Error(`AI generation failed: ${err.message}`);
    }
  }

  let questions;
  if (rawOutput) {
    questions = validateQuizOutput(rawOutput, boundedCount);
  } else {
    questions = generateDevQuiz(formattedSources, boundedCount, validDifficulty, cleanTopic);
  }

  if (!questions || questions.length === 0) {
    questions = generateDevQuiz(formattedSources, boundedCount, validDifficulty, cleanTopic);
  }

  // Process citations for all questions
  const allQuizCitations = [];
  const processedQuestions = questions.map((q, idx) => {
    const textToScan = `${q.explanation} ${(q.rawCitationTags || []).join(' ')}`;
    const { cleanAnswer: cleanExplanation, citations } = processCitations(textToScan, sourceMap);
    citations.forEach((c) => allQuizCitations.push(c));

    return {
      questionIndex: idx + 1,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: cleanExplanation,
      difficulty: q.difficulty,
      citations,
    };
  });

  const uniqueCitations = [];
  const seenChunkIds = new Set();
  for (const c of allQuizCitations) {
    const cId = (c.chunkId || '').toString();
    if (!seenChunkIds.has(cId)) {
      seenChunkIds.add(cId);
      uniqueCitations.push(c);
    }
  }

  const studyRecord = await StudyToolResult.create({
    userId,
    notebookId,
    toolType: 'quiz',
    title: cleanTopic ? `Quiz: ${cleanTopic}` : `Multiple Choice Quiz (${processedQuestions.length} Qs)`,
    input: { count: boundedCount, difficulty: validDifficulty, topic: cleanTopic },
    result: {
      questions: processedQuestions,
      totalQuestions: processedQuestions.length,
    },
    citations: uniqueCitations,
    metadata: {
      model: modelName,
      retrievedChunkCount: chunkCount,
    },
  });

  return studyRecord;
}

/**
 * Generate a grounded mind map hierarchy
 */
async function generateMindMap({ notebookId, userId, topic = '' }) {
  const cleanTopic = typeof topic === 'string' ? topic.trim().slice(0, 100) : '';

  const { contextText, sourceMap, formattedSources, chunkCount } = await retrieveStudyContext({
    notebookId,
    topic: cleanTopic,
  });

  if (chunkCount === 0 || !contextText) {
    throw new Error(INSUFFICIENT_INFO_MSG);
  }

  const { systemInstruction, prompt } = buildMindMapPrompt({
    contextText,
    topic: cleanTopic,
  });

  let rawOutput = null;
  let modelName = 'gemini-1.5-flash';

  try {
    const aiResponse = await callGeminiForStudyTool(systemInstruction, prompt);
    rawOutput = aiResponse.text;
    modelName = aiResponse.model;
  } catch (err) {
    if (isPseudoFallbackEnabled()) {
      rawOutput = null;
      modelName = 'dev-simulation';
    } else {
      throw new Error(`AI generation failed: ${err.message}`);
    }
  }

  let mindmapTree;
  if (rawOutput) {
    mindmapTree = validateMindMapOutput(rawOutput);
  } else {
    mindmapTree = generateDevMindMap(formattedSources, cleanTopic);
  }

  if (!mindmapTree) {
    mindmapTree = generateDevMindMap(formattedSources, cleanTopic);
  }

  // Walk tree to process citations and clean titles
  const allTreeCitations = [];

  function cleanTreeNode(node) {
    if (!node) return null;
    const textToScan = `${node.title} ${(node.rawCitationTags || []).join(' ')}`;
    const { cleanAnswer: cleanTitle, citations } = processCitations(textToScan, sourceMap);
    citations.forEach((c) => allTreeCitations.push(c));

    const children = Array.isArray(node.children)
      ? node.children.map(cleanTreeNode).filter(Boolean)
      : [];

    return {
      title: cleanTitle,
      children,
      citations,
    };
  }

  const cleanedRoot = cleanTreeNode(mindmapTree);

  const uniqueCitations = [];
  const seenChunkIds = new Set();
  for (const c of allTreeCitations) {
    const cId = (c.chunkId || '').toString();
    if (!seenChunkIds.has(cId)) {
      seenChunkIds.add(cId);
      uniqueCitations.push(c);
    }
  }

  const studyRecord = await StudyToolResult.create({
    userId,
    notebookId,
    toolType: 'mindmap',
    title: cleanTopic ? `Mind Map: ${cleanTopic}` : `Mind Map: ${cleanedRoot.title}`,
    input: { topic: cleanTopic },
    result: {
      root: cleanedRoot,
    },
    citations: uniqueCitations,
    metadata: {
      model: modelName,
      retrievedChunkCount: chunkCount,
    },
  });

  return studyRecord;
}

module.exports = {
  INSUFFICIENT_INFO_MSG,
  generateSummary,
  generateFlashcards,
  generateQuiz,
  generateMindMap,
};

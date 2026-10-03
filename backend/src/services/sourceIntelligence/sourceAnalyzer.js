/**
 * Source Analyzer Service
 * Generates structured, grounded analysis (overview, key topics, concepts, definitions, takeaways, sections, questions)
 * for a document source.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Document = require('../../models/Document');
const Chunk = require('../../models/Chunk');
const config = require('../../config/env');
const { isLiveGeminiConfigured } = require('../embedding/embeddingService');
const { analyzeSourceStructure } = require('./sourceStructureAnalyzer');
const {
  extractKeyTopics,
  extractDefinitions,
  extractKeyConcepts,
  extractTakeawaysAndFacts,
  generateSuggestedQuestions,
} = require('./sourceMetadataService');

const SOURCE_ANALYSIS_SYSTEM_INSTRUCTION = `You are a source intelligence extractor for StudyLM (a NotebookLM-style academic assistant).
Your task is to analyze the provided source material and return ONLY a valid JSON object summarizing the document's core structure and content.

RULES:
1. Stay 100% grounded in the provided source text. Do NOT invent facts or concepts.
2. If the source material lacks information for a particular field, return an empty array or an empty string.
3. Your output MUST be strict, valid JSON matching this exact structure:
{
  "overview": "A 2-4 sentence executive overview synthesizing the main themes and purpose of the source.",
  "keyTopics": ["Topic 1", "Topic 2", ...],
  "keyConcepts": [
    {
      "term": "Concept Name",
      "definition": "Clear, grounded definition directly from or supported by the source.",
      "context": "How it is applied or discussed in the source."
    }
  ],
  "definitions": [
    {
      "term": "Term",
      "definition": "Exact or inferred definition from the text."
    }
  ],
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", ...],
  "importantFacts": ["Fact 1", "Fact 2", ...],
  "sections": [
    {
      "title": "Section Title",
      "summary": "Brief 1-2 sentence summary of what this section discusses.",
      "pageStart": 1,
      "pageEnd": 2
    }
  ],
  "suggestedQuestions": [
    "Thoughtful, grounded study questions that can be answered from this source."
  ]
}`;

/**
 * Generate a deterministic structured analysis when Gemini is unavailable or for testing
 * @param {import('../../models/Document')} document
 * @param {Array<Object>} chunks
 * @returns {Object}
 */
function generateDeterministicAnalysis(document, chunks = []) {
  const fullText = document.rawText || chunks.map((c) => c.text).join('\n\n');
  const docTitle = document.title || 'Source Document';

  const sections = analyzeSourceStructure(chunks, fullText);
  const keyTopics = extractKeyTopics(fullText);
  const definitions = extractDefinitions(fullText);
  const keyConcepts = extractKeyConcepts(fullText, keyTopics);
  const { keyTakeaways, importantFacts } = extractTakeawaysAndFacts(fullText);
  const suggestedQuestions = generateSuggestedQuestions(keyTopics, keyConcepts, docTitle);

  const overview =
    fullText.length > 50
      ? `This document provides a detailed overview of ${docTitle}. It covers fundamental topics including ${keyTopics.slice(0, 3).join(', ') || 'core principles'}, outlining theoretical mechanisms, structural workflows, and practical implications.`
      : `Overview of ${docTitle}.`;

  return {
    overview,
    keyTopics: keyTopics.slice(0, 8),
    keyConcepts: keyConcepts.slice(0, 6),
    definitions: definitions.slice(0, 6),
    keyTakeaways: keyTakeaways.slice(0, 6),
    importantFacts: importantFacts.slice(0, 6),
    sections: sections.slice(0, 10),
    suggestedQuestions: suggestedQuestions.slice(0, 5),
    model: 'deterministic-extractor',
  };
}

/**
 * Perform structured analysis on a ready Document
 * @param {string|import('mongoose').Types.ObjectId} documentId
 * @param {Object} [options]
 * @param {boolean} [options.forceReanalyze=false]
 * @returns {Promise<Object>}
 */
async function analyzeDocument(documentId, options = {}) {
  const document = await Document.findById(documentId);
  if (!document) {
    throw new Error(`Document ${documentId} not found`);
  }

  // Return cached analysis if available and not forced
  if (
    !options.forceReanalyze &&
    document.analysis?.status === 'ready' &&
    document.analysis?.overview
  ) {
    return document.analysis;
  }

  // Update status to processing
  document.analysis = {
    ...(document.analysis || {}),
    status: 'processing',
    error: '',
  };
  await document.save();

  try {
    const chunks = await Chunk.find({ documentId: document._id })
      .sort({ chunkIndex: 1 })
      .select('_id chunkIndex text pageNumber pageStart pageEnd')
      .lean();

    const sourceChunkIds = chunks.map((c) => c._id);
    let analysisResult = null;

    if (!isLiveGeminiConfigured()) {
      analysisResult = generateDeterministicAnalysis(document, chunks);
    } else {
      // Build representative sample text from chunks (up to 20,000 characters)
      let sampleText = '';
      if (chunks.length <= 10) {
        sampleText = chunks.map((c, i) => `[Chunk #${i + 1}${c.pageNumber ? ` Page ${c.pageNumber}` : ''}]:\n${c.text}`).join('\n\n');
      } else {
        // Sample chunks evenly from beginning, middle, and end
        const step = Math.floor(chunks.length / 10);
        const sampledIndices = new Set();
        for (let i = 0; i < chunks.length; i += step) {
          sampledIndices.add(i);
        }
        sampledIndices.add(chunks.length - 1);

        const sampledChunks = chunks.filter((_, idx) => sampledIndices.has(idx)).slice(0, 12);
        sampleText = sampledChunks.map((c) => `[Chunk #${c.chunkIndex + 1}${c.pageNumber ? ` Page ${c.pageNumber}` : ''}]:\n${c.text}`).join('\n\n');
      }

      if (sampleText.length > 25000) {
        sampleText = sampleText.slice(0, 25000) + '...';
      }

      const prompt = `${SOURCE_ANALYSIS_SYSTEM_INSTRUCTION}

DOCUMENT TITLE: ${document.title}
SOURCE TYPE: ${document.sourceType}

SOURCE EXCERPTS:
${sampleText}

Output valid JSON only:`;

      try {
        const candidateChatModels = Array.from(
          new Set([
            config.gemini?.chatModel || 'gemini-3.5-flash',
            'gemini-3.5-flash',
            'gemini-flash-latest',
            'gemini-3.5-flash-lite',
            'gemini-3.1-flash-lite',
            'gemini-2.5-flash',
          ])
        ).filter(Boolean);

        const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
        let responseText = '';
        let usedModel = candidateChatModels[0];

        for (const modelName of candidateChatModels) {
          try {
            const model = genAI.getGenerativeModel({
              model: modelName,
              generationConfig: {
                responseMimeType: 'application/json',
              },
            });

            const result = await model.generateContent(prompt);
            responseText = result?.response?.text() || '';
            if (responseText && responseText.trim().length > 0) {
              usedModel = modelName;
              break;
            }
          } catch (err) {
            const errMsg = err.message || '';
            const isQuotaOrNotFound =
              errMsg.includes('429') ||
              errMsg.includes('RESOURCE_EXHAUSTED') ||
              errMsg.includes('Quota exceeded') ||
              errMsg.includes('404') ||
              errMsg.includes('not found') ||
              errMsg.includes('not supported');

            if (isQuotaOrNotFound) {
              continue;
            }
            break;
          }
        }

        // Parse JSON response safely
        const cleanedJson = responseText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();

        const parsed = JSON.parse(cleanedJson);
        analysisResult = {
          overview: typeof parsed.overview === 'string' ? parsed.overview.trim() : '',
          keyTopics: Array.isArray(parsed.keyTopics) ? parsed.keyTopics.filter(Boolean) : [],
          keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
          definitions: Array.isArray(parsed.definitions) ? parsed.definitions : [],
          keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways.filter(Boolean) : [],
          importantFacts: Array.isArray(parsed.importantFacts) ? parsed.importantFacts.filter(Boolean) : [],
          sections: Array.isArray(parsed.sections) ? parsed.sections : [],
          suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions.filter(Boolean) : [],
          model: usedModel,
        };
      } catch (geminiErr) {
        console.warn(`[Source Analysis Warning] Gemini analysis failed for ${document._id}, falling back to deterministic:`, geminiErr.message);
        analysisResult = generateDeterministicAnalysis(document, chunks);
      }
    }

    // Save populated analysis
    document.analysis = {
      status: 'ready',
      overview: analysisResult.overview || '',
      keyTopics: analysisResult.keyTopics || [],
      keyConcepts: analysisResult.keyConcepts || [],
      definitions: analysisResult.definitions || [],
      keyTakeaways: analysisResult.keyTakeaways || [],
      importantFacts: analysisResult.importantFacts || [],
      sections: analysisResult.sections || [],
      suggestedQuestions: analysisResult.suggestedQuestions || [],
      generatedAt: new Date(),
      model: analysisResult.model || 'source-analyzer',
      sourceChunkIds,
      error: '',
    };

    await document.save();
    return document.analysis;
  } catch (err) {
    document.analysis = {
      ...(document.analysis || {}),
      status: 'failed',
      error: err.message || 'Source analysis failed',
    };
    await document.save();
    throw err;
  }
}

/**
 * Trigger background source analysis without blocking the caller
 * @param {string|import('mongoose').Types.ObjectId} documentId
 * @param {Object} [options]
 */
function triggerAsyncDocumentAnalysis(documentId, options = {}) {
  setImmediate(async () => {
    try {
      await analyzeDocument(documentId, options);
    } catch (err) {
      console.warn(`[Source Analysis Warning] Async analysis ended for document ${documentId}:`, err.message);
    }
  });
}

module.exports = {
  analyzeDocument,
  triggerAsyncDocumentAnalysis,
  generateDeterministicAnalysis,
};

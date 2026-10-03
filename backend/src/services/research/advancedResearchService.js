const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/env');
const ResearchSession = require('../../models/ResearchSession');
const Document = require('../../models/Document');
const WebSource = require('../../models/WebSource');
const { analyzeResearchIntent } = require('./researchIntentAnalyzer');
const { generateResearchPlan } = require('./researchPlanner');
const { retrievePlanEvidence } = require('./evidenceRetrievalService');
const { detectContradictions } = require('./contradictionDetector');
const { detectKnowledgeGaps } = require('./knowledgeGapDetector');
const { extractTimelineEvents } = require('./timelineService');
const { buildComparisonStructure } = require('./compareService');
const { extractAndMapClaims } = require('./claimEvidenceService');
const { assembleResearchReport } = require('./researchReportGenerator');
const { isLiveGeminiConfigured } = require('../embedding/embeddingService');
const { logActivity } = require('../activity/activityService');
const { getUserMemories } = require('../memory/userMemoryService');
const { getNotebookMemoryContext } = require('../memory/notebookMemoryService');

const INSUFFICIENT_EVIDENCE_MSG =
  "I couldn't find enough information about this in your selected research sources. Try expanding your search terms, adjusting the source scope, or uploading relevant study documents.";

/**
 * Generate fallback deterministic synthesis for development or offline testing
 */
function generateDevSynthesis({ question, intent, evidence = [], contradictions = [], gaps = [], comparison = {}, timeline = [] }) {
  if (evidence.length === 0) {
    return {
      executiveSummary: INSUFFICIENT_EVIDENCE_MSG,
      keyFindings: ['No verifiable evidence was found in the notebook sources for this topic.'],
      detailedAnalysis: INSUFFICIENT_EVIDENCE_MSG,
      crossSourceComparison: '',
      conclusion: 'Insufficient source evidence to substantiate research findings.',
    };
  }

  const primary = evidence[0];
  const secondary = evidence[1] || primary;

  const tag1 = primary.chunkId || primary.id || '1';
  const tag2 = secondary.chunkId || secondary.id || '2';

  const executiveSummary = `This research inquiry explores "${question}" using grounded evidence extracted from **${primary.sourceTitle}** and related materials. The findings demonstrate key concepts with direct citation provenance.`;

  const keyFindings = [
    `According to ${primary.sourceTitle} [${tag1}], ${primary.text.slice(0, 140).trim()}...`,
    evidence.length > 1
      ? `Evidence from ${secondary.sourceTitle} [${tag2}] demonstrates complementary details regarding ${secondary.text.slice(0, 140).trim()}...`
      : `Primary data is grounded directly in ${primary.sourceTitle}.`,
    `Grounded evidence preserves verifiable citations and source provenance across all extracted claims.`,
  ];

  let detailedAnalysis = `### Grounded Detailed Analysis\n\n`;
  detailedAnalysis += `The primary investigation indicates that according to **${primary.sourceTitle}** [${tag1}]:\n\n> "${primary.text.slice(0, 250).trim()}..."\n\n`;

  if (evidence.length > 1) {
    detailedAnalysis += `Furthermore, **${secondary.sourceTitle}** [${tag2}] provides additional empirical grounding:\n\n> "${secondary.text.slice(0, 250).trim()}..."\n\n`;
  }

  let crossSourceComparison = '';
  if (intent.category === 'compare' && comparison.hasDirectComparison) {
    crossSourceComparison = `Comparison of **${comparison.targetA}** and **${comparison.targetB}** reveals distinct methodologies and trade-offs evidenced in source materials. Both subjects are documented with specific parameters.`;
  }

  const conclusion = `Based strictly on the grounded evidence from ${evidence.length} source excerpts, the research question is addressed with source-backed evidence. Where source data is incomplete, explicit knowledge gaps are highlighted.`;

  return {
    executiveSummary,
    keyFindings,
    detailedAnalysis,
    crossSourceComparison,
    conclusion,
  };
}

/**
 * Execute full advanced research session
 *
 * @param {Object} params
 * @param {string|import('mongoose').Types.ObjectId} params.notebookId
 * @param {string|import('mongoose').Types.ObjectId} params.userId
 * @param {string} params.query
 * @param {string} [params.sourceScope='all']
 * @param {number} [params.topK=10]
 * @returns {Promise<Object>}
 */
async function executeAdvancedResearch({
  notebookId,
  userId,
  query,
  sourceScope = 'all',
  topK = 10,
}) {
  const startTime = Date.now();

  if (!query || typeof query !== 'string' || !query.trim()) {
    throw new Error('Research query is required');
  }

  const cleanQuery = query.trim();

  // 1. Research Intent Analysis
  const intent = analyzeResearchIntent(cleanQuery);

  // 2. Load Notebook & User Context (Memory)
  const [nbMemRes, userMemRes] = await Promise.all([
    getNotebookMemoryContext(notebookId).catch(() => null),
    getUserMemories(userId, { active: true, limit: 10 }).catch(() => ({ memories: [] })),
  ]);

  const notebookMemory = nbMemRes || {};

  // 3. Research Planning (2 to 4 bounded sub-questions)
  const rawPlan = generateResearchPlan({
    question: cleanQuery,
    intent,
    notebookMemory,
  });

  // 4. Multi-Query Evidence Retrieval & Provenance Validation
  const { evidence, updatedPlan } = await retrievePlanEvidence({
    notebookId,
    userId,
    plan: rawPlan,
    sourceScope,
    topKPerStep: 4,
  });

  // 5. Detect Contradictions & Knowledge Gaps
  const contradictions = detectContradictions(evidence);
  const knowledgeGaps = detectKnowledgeGaps({
    question: cleanQuery,
    plan: updatedPlan,
    evidence,
    contradictions,
  });

  // 6. Timeline & Compare Mode structures
  const timeline = intent.category === 'timeline' ? extractTimelineEvents(evidence) : [];
  const comparison = intent.category === 'compare' ? buildComparisonStructure({ comparisonTargets: intent.comparisonTargets, evidence }) : {};

  // 7. Synthesis & Report Generation
  let synthesis = {};
  const candidateModels = Array.from(
    new Set([
      config.gemini?.chatModel || 'gemini-3.5-flash',
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash',
      config.gemini?.fallbackChatModel || 'gemini-flash-latest',
    ])
  );
  let modelName = candidateModels[0];

  if (isLiveGeminiConfigured() && evidence.length > 0) {
    const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    const formattedEvidence = evidence
      .map(
        (e, idx) =>
          `[EVIDENCE_${idx + 1}] Source: "${e.sourceTitle}" (${e.sourceKind}) ${e.pageNumber ? `Page ${e.pageNumber}` : ''}\nContent: ${e.text}`
      )
      .join('\n\n');

    const systemPrompt = `You are the StudyLM Advanced Research Synthesis Engine.
Your task is to produce a grounded, academic-grade research synthesis for the inquiry: "${cleanQuery}".

CRITICAL GROUNDING RULES:
1. Use ONLY the provided evidence blocks below. NEVER fabricate, assume, or extrapolate facts not in evidence.
2. If evidence is insufficient or absent for any aspect, state it plainly.
3. If sources contradict each other, note the discrepancy explicitly.
4. Cite evidence references using [EVIDENCE_X].

EVIDENCE BASE:
${formattedEvidence}

Produce a structured JSON response with keys:
- "executiveSummary": string (1-2 concise paragraphs)
- "keyFindings": array of strings (3-5 bullet points)
- "detailedAnalysis": string (markdown paragraphs with [EVIDENCE_X] citations)
- "crossSourceComparison": string (comparison if applicable, else empty string)
- "conclusion": string (concise grounded conclusion)`;

    let parsedSuccessfully = false;

    for (const candidate of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: candidate,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
          },
        });

        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text();

        // Parse JSON from model
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          synthesis = JSON.parse(jsonMatch[0]);
          modelName = candidate;
          parsedSuccessfully = true;
          break;
        }
      } catch (err) {
        console.warn(`[Advanced Research Warning] Model '${candidate}' failed: ${err.message}. Trying next candidate model...`);
      }
    }

    if (!parsedSuccessfully) {
      synthesis = generateDevSynthesis({
        question: cleanQuery,
        intent,
        evidence,
        contradictions,
        gaps: knowledgeGaps,
        comparison,
        timeline,
      });
    }
  } else {
    // Deterministic Dev/Offline Synthesis
    synthesis = generateDevSynthesis({
      question: cleanQuery,
      intent,
      evidence,
      contradictions,
      gaps: knowledgeGaps,
      comparison,
      timeline,
    });
  }

  // Attach detected structures to synthesis
  synthesis.contradictions = contradictions;
  synthesis.knowledgeGaps = knowledgeGaps;
  synthesis.timeline = timeline;

  // 8. Extract Claims and Build Claim-Evidence Matrix
  const claims = extractAndMapClaims({
    synthesisText: `${synthesis.executiveSummary}\n${synthesis.detailedAnalysis}\n${synthesis.conclusion}`,
    evidence,
    contradictions,
  });

  // 9. Format Citations & References
  const citations = evidence.map((e, idx) => ({
    citationNumber: idx + 1,
    chunkId: e.chunkId || e.id,
    documentId: e.documentId || e.sourceId,
    documentTitle: e.sourceTitle,
    sourceType: e.sourceType || 'document',
    sourceKind: e.sourceKind || 'document',
    snippet: e.text.slice(0, 220),
    pageNumber: e.pageNumber,
    url: e.url || '',
    domain: e.domain || '',
  }));

  const refMap = new Map();
  for (const ev of evidence) {
    const key = ev.sourceId || ev.sourceTitle;
    if (!refMap.has(key)) {
      refMap.set(key, {
        id: ev.sourceId || ev.id,
        title: ev.sourceTitle,
        type: ev.sourceType || 'document',
        domain: ev.domain || '',
        url: ev.url || '',
        page: ev.pageNumber ? String(ev.pageNumber) : '',
        dateFetched: new Date().toISOString().split('T')[0],
      });
    }
  }
  const references = Array.from(refMap.values());

  // 10. Assemble Full Report
  const finalAnswer = assembleResearchReport({
    question: cleanQuery,
    intent,
    synthesis,
    citations,
    references,
  });

  const durationMs = Date.now() - startTime;

  // 11. Create and Persist Research Session
  const session = await ResearchSession.create({
    userId,
    notebookId,
    title: cleanQuery.slice(0, 100),
    originalQuestion: cleanQuery,
    status: evidence.length > 0 ? 'completed' : 'failed',
    sourceScope,
    researchIntent: {
      category: intent.category,
      confidence: intent.confidence,
      entities: intent.entities,
      aspects: intent.aspects,
    },
    researchPlan: updatedPlan,
    evidence,
    claims,
    synthesis,
    finalAnswer,
    citations,
    references,
    metadata: {
      durationMs,
      sourceScope,
      model: modelName,
      subQuestionsCount: updatedPlan.length,
      evidenceCount: evidence.length,
    },
  });

  // 12. Non-blocking Activity & Usage Logging
  const { recordUsage } = require('../usage/entitlementService');
  recordUsage(userId, 'researchSessions', 1).catch(() => {});
  recordUsage(userId, 'aiRequests', 1).catch(() => {});

  logActivity({
    notebookId,
    userId,
    action: 'research_performed',
    entityType: 'research_session',
    entityId: session._id.toString(),
    summary: `Conducted advanced research on "${cleanQuery.slice(0, 50)}..." (${evidence.length} evidence sources)`,
  }).catch(() => {});

  return session.toObject();
}

module.exports = {
  executeAdvancedResearch,
  generateDevSynthesis,
};

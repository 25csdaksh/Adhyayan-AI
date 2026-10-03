const assert = require('assert');
const { analyzeResearchIntent } = require('../src/services/research/researchIntentAnalyzer');
const { generateResearchPlan } = require('../src/services/research/researchPlanner');
const { deduplicateAndBalanceEvidence, validateEvidenceProvenance } = require('../src/services/research/evidenceRetrievalService');
const { detectContradictions } = require('../src/services/research/contradictionDetector');
const { detectKnowledgeGaps } = require('../src/services/research/knowledgeGapDetector');
const { extractTimelineEvents } = require('../src/services/research/timelineService');
const { buildComparisonStructure } = require('../src/services/research/compareService');
const { extractAndMapClaims } = require('../src/services/research/claimEvidenceService');
const { assembleResearchReport } = require('../src/services/research/researchReportGenerator');
const { generateDevSynthesis } = require('../src/services/research/advancedResearchService');

async function runPhase14Tests() {
  console.log('🧪 Running Phase 14 Advanced AI Research & Knowledge Synthesis Tests...\n');

  // Test 1: Intent Classification
  const compareIntent = analyzeResearchIntent('Compare PostgreSQL and MongoDB scalability trade-offs');
  assert.strictEqual(compareIntent.category, 'compare', 'Should classify compare question');
  assert.ok(compareIntent.comparisonTargets.length >= 2, 'Should extract comparison targets');

  const timelineIntent = analyzeResearchIntent('What is the timeline of LLM architectures from 2017 to 2024?');
  assert.strictEqual(timelineIntent.category, 'timeline', 'Should classify timeline question');

  const prosConsIntent = analyzeResearchIntent('What are the pros and cons of microservices vs monoliths?');
  assert.ok(['pros_cons', 'compare'].includes(prosConsIntent.category), 'Should classify pros_cons or compare');

  const generalIntent = analyzeResearchIntent('Tell me about cloud computing paradigms');
  assert.ok(['explain', 'general', 'analyze'].includes(generalIntent.category), 'Should classify general research question');
  console.log('  ✓ 1. Intent Analyzer: Accurately classifies compare, timeline, pros/cons, and general intents');

  // Test 2: Bounded Planning
  const plan = generateResearchPlan({
    question: 'Compare Redis and Memcached caching latency',
    intent: compareIntent,
  });
  assert.ok(Array.isArray(plan), 'Plan must be an array');
  assert.ok(plan.length >= 2 && plan.length <= 4, 'Plan must be bounded between 2 and 4 sub-questions');
  assert.ok(plan.every((p) => p.stepNumber && p.subQuestion && p.purpose), 'Plan steps must have structured fields');
  console.log(`  ✓ 2. Research Planner: Generates ${plan.length} bounded, deterministic sub-questions without recursive loops`);

  // Test 3: Evidence Deduplication and Balancing
  const rawEvidence = [
    { id: '1', chunkId: 'chk-1', sourceTitle: 'Doc A', text: 'Distributed consensus algorithms ensure data consistency across partitions.' },
    { id: '2', chunkId: 'chk-1', sourceTitle: 'Doc A', text: 'Distributed consensus algorithms ensure data consistency across partitions.' }, // Duplicate chunkId
    { id: '3', chunkId: 'chk-2', sourceTitle: 'Doc A', text: 'Distributed consensus algorithms ensure data consistency across partitions in raft.' }, // Text overlap
    { id: '4', chunkId: 'chk-3', sourceTitle: 'Doc B', text: 'Byzantine fault tolerance tolerates arbitrary node failures in untrusted networks.' },
  ];
  const deduped = deduplicateAndBalanceEvidence(rawEvidence, 10);
  assert.strictEqual(deduped.length, 2, 'Should eliminate duplicate chunkId and highly overlapping text');
  console.log('  ✓ 3. Evidence Deduplication: Eliminates redundant chunks and balances diverse source representations');

  // Test 4: Contradiction Detection
  const conflictingEvidence = [
    { id: '1', sourceId: 'src-1', sourceTitle: 'Benchmark Study 2023', text: 'The new protocol showed a significant performance increase with 40% higher throughput under heavy load.' },
    { id: '2', sourceId: 'src-2', sourceTitle: 'Audit Report 2024', text: 'Independent testing revealed a measurable performance decrease with degraded latency and reduced throughput under concurrency.' },
  ];
  const contradictions = detectContradictions(conflictingEvidence);
  assert.ok(contradictions.length > 0, 'Should detect conflicting claims across distinct sources');
  assert.ok(contradictions[0].topic.includes('Performance'), 'Should categorize conflict topic properly');
  assert.strictEqual(contradictions[0].sourceA.title, 'Benchmark Study 2023');
  assert.strictEqual(contradictions[0].sourceB.title, 'Audit Report 2024');
  console.log('  ✓ 4. Contradiction Detector: Surfaces differing source claims with side-by-side evidence links');

  // Test 5: Knowledge Gap Detection
  const mockPlan = [
    { stepNumber: 1, subQuestion: 'What are the throughput numbers?', evidenceCount: 3, status: 'completed' },
    { stepNumber: 2, subQuestion: 'What are the hardware costs?', evidenceCount: 0, status: 'completed' }, // Missing evidence
  ];
  const gaps = detectKnowledgeGaps({
    question: 'Architecture cost analysis',
    plan: mockPlan,
    evidence: [{ text: 'Throughput is 50k rps' }],
  });
  assert.ok(gaps.length > 0, 'Should detect knowledge gap for step with 0 evidence');
  assert.ok(gaps[0].topic.includes('hardware costs'), 'Gap should reference the unanswered sub-question');
  console.log('  ✓ 5. Knowledge Gap Detector: Accurately identifies unverified sub-questions and sparse coverage');

  // Test 6: Timeline & Comparison Extraction
  const timelineEvidence = [
    { sourceTitle: 'Paper 1', text: 'In 2017, the Transformer model was introduced by Vaswani et al. for sequence translation.' },
    { sourceTitle: 'Paper 2', text: 'In 2020, GPT-3 demonstrated few-shot learning capabilities across diverse tasks.' },
    { sourceTitle: 'Paper 3', text: 'Around late 2022, instruction-tuned conversational models achieved widespread adoption.' },
  ];
  const events = extractTimelineEvents(timelineEvidence);
  assert.strictEqual(events.length, 3, 'Should extract 3 timeline events');
  assert.strictEqual(events[0].date, '2017', 'Should sort earliest date first');
  assert.strictEqual(events[2].isUncertain, true, 'Approximate dates should have isUncertain=true');

  const comparison = buildComparisonStructure({
    comparisonTargets: ['PostgreSQL', 'MongoDB'],
    evidence: [
      { text: 'PostgreSQL provides robust ACID compliance and relational integrity.' },
      { text: 'MongoDB offers flexible BSON document schemas and horizontal sharding.' },
    ],
  });
  assert.strictEqual(comparison.hasDirectComparison, true, 'Should structure comparison for both targets');
  console.log('  ✓ 6. Timeline & Compare Modes: Formats chronological milestones and pairwise comparison structures');

  // Test 7: Claim Extraction & Claim-Evidence Mapping
  const synthesisText = `PostgreSQL enforces strict ACID compliance for transactional workloads.
MongoDB enables horizontal partition sharding for flexible document schemas.`;
  const claims = extractAndMapClaims({
    synthesisText,
    evidence: [
      { id: 'ev-1', chunkId: 'chk-pg', sourceTitle: 'Postgres Docs', text: 'PostgreSQL enforces strict ACID compliance for relational databases.' },
      { id: 'ev-2', chunkId: 'chk-mongo', sourceTitle: 'Mongo Docs', text: 'MongoDB enables horizontal partition sharding across clusters.' },
    ],
  });
  assert.ok(claims.length >= 2, 'Should extract claims');
  assert.strictEqual(claims[0].supportType, 'direct', 'Claims matching evidence must be marked direct');
  assert.ok(claims[0].evidenceReferences.length > 0, 'Claim must map to evidence reference');

  // Test 8: Full Report Assembly & Insufficient Evidence Guard
  const report = assembleResearchReport({
    question: 'Compare SQL and NoSQL',
    intent: { category: 'compare' },
    synthesis: {
      executiveSummary: 'SQL and NoSQL provide complementary data persistence models.',
      keyFindings: ['SQL guarantees ACID', 'NoSQL scales horizontally'],
      detailedAnalysis: 'Relational databases prioritize consistency [1], whereas document stores prioritize elasticity [2].',
      conclusion: 'Choose persistence model based on consistency and latency requirements.',
      contradictions,
      knowledgeGaps: gaps,
    },
    citations: [{ citationNumber: 1, documentTitle: 'SQL Spec' }, { citationNumber: 2, documentTitle: 'NoSQL Spec' }],
    references: [{ title: 'SQL Spec', type: 'pdf' }, { title: 'NoSQL Spec', type: 'web', domain: 'mongodb.com' }],
  });

  assert.ok(report.includes('# Research Report'), 'Report must have title header');
  assert.ok(report.includes('## 1. Executive Summary'), 'Report must have Executive Summary');
  assert.ok(report.includes('## 6. Conflicting Evidence'), 'Report must include contradictions when present');
  assert.ok(report.includes('## 7. Knowledge Gaps'), 'Report must include knowledge gaps');
  assert.ok(report.includes('References & Source Provenance'), 'Report must include references section');

  // Test 9: Anti-hallucination guard on empty evidence
  const emptySynthesis = generateDevSynthesis({
    question: 'Non-existent topic in quantum teleportation',
    intent: { category: 'general' },
    evidence: [],
  });
  assert.ok(emptySynthesis.executiveSummary.includes("couldn't find enough information"), 'Must return insufficient evidence message when 0 evidence exists');
  console.log('  ✓ 7. Report Generator & Anti-Hallucination: Emits academic markdown with provenance, citations, and guards against zero-evidence hallucination');

  console.log('\nPhase 14 Advanced Research Tests: 7/7 passed\n');
  return { passed: 7, total: 7 };
}

if (require.main === module) {
  runPhase14Tests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Phase 14 Test Failure:', err);
      process.exit(1);
    });
}

module.exports = {
  runPhase14Tests,
};

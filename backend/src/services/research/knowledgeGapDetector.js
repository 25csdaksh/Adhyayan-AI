/**
 * Knowledge Gap Detector
 *
 * Identifies unanswered aspects, missing source coverage, or unverified sub-questions.
 * Clearly frames gaps as missing evidence rather than factual negatives.
 */

/**
 * Detect knowledge gaps from research plan status and evidence distribution
 *
 * @param {Object} params
 * @param {string} params.question
 * @param {Array<Object>} params.plan
 * @param {Array<Object>} params.evidence
 * @param {Array<Object>} [params.contradictions=[]]
 * @returns {Array<{ topic: string, reason: string, recommendation: string }>}
 */
function detectKnowledgeGaps({ question = '', plan = [], evidence = [], contradictions = [] }) {
  const gaps = [];

  // 1. Check if any sub-question yielded 0 or insufficient evidence (< 1 item)
  for (const step of plan) {
    if (!step.evidenceCount || step.evidenceCount === 0 || step.status === 'failed') {
      gaps.push({
        topic: step.subQuestion,
        reason: 'No direct evidence was retrieved from the selected sources for this specific sub-question.',
        recommendation: 'Consider uploading dedicated reference documents covering this sub-topic or enabling web research.',
      });
    }
  }

  // 2. Check total evidence volume relative to question complexity
  if (evidence.length === 0) {
    gaps.push({
      topic: 'Comprehensive Topic Coverage',
      reason: 'No matching evidence was found in the indexed sources for this inquiry.',
      recommendation: 'Ensure your notebook contains processed documents or web articles relevant to this domain.',
    });
  } else if (evidence.length < 3 && plan.length >= 2) {
    gaps.push({
      topic: 'Sparse Empirical Evidence',
      reason: 'Only limited excerpts were retrieved across the research scope.',
      recommendation: 'Supplementary sources may be needed to achieve complete cross-verification.',
    });
  }

  // 3. Highlight unresolved contradictions as knowledge gaps requiring further investigation
  if (contradictions && contradictions.length > 0) {
    for (const c of contradictions) {
      gaps.push({
        topic: `Unresolved Discrepancy: ${c.topic}`,
        reason: 'Multiple sources state differing claims regarding this subject without a clear consensus in the evidence.',
        recommendation: 'Review the conflicting passages directly in the citation preview panel.',
      });
    }
  }

  return gaps.slice(0, 5);
}

module.exports = {
  detectKnowledgeGaps,
};

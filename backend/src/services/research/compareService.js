/**
 * Compare Mode Service
 *
 * Provides structured comparative synthesis across multiple subjects or approaches.
 */

/**
 * Build structured comparison data from evidence
 *
 * @param {Object} params
 * @param {Array<string>} params.comparisonTargets
 * @param {Array<Object>} params.evidence
 * @returns {Object}
 */
function buildComparisonStructure({ comparisonTargets = [], evidence = [] }) {
  const targetA = comparisonTargets[0] || 'Approach A';
  const targetB = comparisonTargets[1] || 'Approach B';

  const evidenceForA = [];
  const evidenceForB = [];
  const sharedEvidence = [];

  const normA = targetA.toLowerCase();
  const normB = targetB.toLowerCase();

  for (const ev of evidence) {
    const textLower = ev.text.toLowerCase();
    const mentionsA = textLower.includes(normA);
    const mentionsB = textLower.includes(normB);

    if (mentionsA && mentionsB) {
      sharedEvidence.push(ev);
    } else if (mentionsA) {
      evidenceForA.push(ev);
    } else if (mentionsB) {
      evidenceForB.push(ev);
    }
  }

  return {
    targetA,
    targetB,
    evidenceForA,
    evidenceForB,
    sharedEvidence,
    hasDirectComparison: sharedEvidence.length > 0 || (evidenceForA.length > 0 && evidenceForB.length > 0),
  };
}

module.exports = {
  buildComparisonStructure,
};

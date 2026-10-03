/**
 * Claim Extraction and Claim-Evidence Matrix Service
 *
 * Extracts individual factual claims from synthesis text and maps each claim
 * to supporting evidence items with conservative support classification.
 */

/**
 * Extract claims from synthesis text and match against evidence items
 *
 * @param {Object} params
 * @param {string} params.synthesisText
 * @param {Array<Object>} params.evidence
 * @param {Array<Object>} [params.contradictions=[]]
 * @returns {Array<{ id: string, claim: string, evidenceReferences: string[], confidence: number, supportType: string, counterEvidence: string[] }>}
 */
function extractAndMapClaims({ synthesisText = '', evidence = [], contradictions = [] }) {
  if (!synthesisText || typeof synthesisText !== 'string') return [];

  // Extract distinct factual statements from markdown paragraphs and bullet points
  const candidateClaims = [];
  const lines = synthesisText.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.replace(/^[#*>-]+\s*/, '').trim();
    if (line.length > 25 && !line.startsWith('###') && !line.startsWith('---')) {
      // Split into sentences
      const sentences = line.split(/(?<=[.?!])\s+/).map((s) => s.trim()).filter((s) => s.length > 20);
      for (const s of sentences) {
        if (candidateClaims.length < 8 && !candidateClaims.includes(s)) {
          candidateClaims.push(s);
        }
      }
    }
  }

  if (candidateClaims.length === 0) {
    return [];
  }

  const claimMatrix = [];

  for (let i = 0; i < candidateClaims.length; i++) {
    const claim = candidateClaims[i];
    const claimWords = claim.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 3);

    const matchingEvidence = [];
    const counterEvidence = [];

    for (const ev of evidence) {
      const evTextLower = ev.text.toLowerCase();
      const matchCount = claimWords.filter((w) => evTextLower.includes(w)).length;
      const matchRatio = claimWords.length > 0 ? matchCount / claimWords.length : 0;

      if (matchRatio >= 0.4 || (matchCount >= 3 && claimWords.length >= 4)) {
        matchingEvidence.push(ev.chunkId || ev.id || ev.sourceTitle);
      }
    }

    // Check if this claim overlaps with known contradictions
    let isConflicting = false;
    for (const c of contradictions) {
      if (claim.toLowerCase().includes(c.topic.toLowerCase().slice(0, 15))) {
        isConflicting = true;
        counterEvidence.push(c.sourceB?.title || 'Contradicting source evidence');
      }
    }

    let supportType = 'direct';
    let confidence = 0.9;

    if (matchingEvidence.length === 0) {
      supportType = 'insufficient';
      confidence = 0.3;
    } else if (isConflicting) {
      supportType = 'conflicting';
      confidence = 0.6;
    } else if (matchingEvidence.length === 1) {
      supportType = 'direct';
      confidence = 0.85;
    } else {
      supportType = 'direct';
      confidence = 0.95;
    }

    claimMatrix.push({
      id: `claim-${i + 1}`,
      claim,
      evidenceReferences: matchingEvidence,
      confidence,
      supportType,
      counterEvidence,
    });
  }

  return claimMatrix;
}

module.exports = {
  extractAndMapClaims,
};

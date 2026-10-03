/**
 * Conservative Contradiction Detector
 *
 * Detects potential conflicts when sources make materially different claims on the same topic.
 * Surfaces differences explicitly ("Sources differ") without inventing a resolution.
 */

const OPPOSING_PAIRS = [
  { termA: /\b(increase|increases|increased|higher|improved|gain)\b/i, termB: /\b(decrease|decreases|decreased|lower|reduced|loss|degraded)\b/i, topic: 'Performance / Directional Metric' },
  { termA: /\b(secure|safe|immune|protected)\b/i, termB: /\b(vulnerable|flawed|insecure|susceptible|compromised)\b/i, topic: 'Security & Vulnerability Assessment' },
  { termA: /\b(supported|compatible|enabled|permitted)\b/i, termB: /\b(unsupported|incompatible|disabled|prohibited|deprecated)\b/i, topic: 'Compatibility & Feature Support' },
  { termA: /\b(success|successful|optimal|effective)\b/i, termB: /\b(failure|failed|suboptimal|ineffective|bottleneck)\b/i, topic: 'Efficacy & Outcome' },
  { termA: /\b(mandatory|required|strictly)\b/i, termB: /\b(optional|deprecated|prohibited|unnecessary)\b/i, topic: 'Requirement & Protocol Mandate' },
];

/**
 * Detect potential contradictions between evidence from different sources
 *
 * @param {Array<Object>} evidenceList
 * @returns {Array<{ topic: string, sourceA: Object, sourceB: Object, note: string }>}
 */
function detectContradictions(evidenceList = []) {
  if (!evidenceList || evidenceList.length < 2) return [];

  const contradictions = [];
  const checkedPairs = new Set();

  for (let i = 0; i < evidenceList.length; i++) {
    for (let j = i + 1; j < evidenceList.length; j++) {
      const evA = evidenceList[i];
      const evB = evidenceList[j];

      // Only compare distinct sources
      const srcA = evA.sourceId || evA.sourceTitle;
      const srcB = evB.sourceId || evB.sourceTitle;
      if (srcA === srcB) continue;

      const pairKey = `${srcA}::${srcB}`;
      if (checkedPairs.has(pairKey)) continue;

      const textA = evA.text.toLowerCase();
      const textB = evB.text.toLowerCase();

      for (const pair of OPPOSING_PAIRS) {
        const aHasFirst = pair.termA.test(textA) && pair.termB.test(textB);
        const bHasFirst = pair.termB.test(textA) && pair.termA.test(textB);

        if (aHasFirst || bHasFirst) {
          // Check if both discuss a common subject keyword
          const wordsA = new Set(textA.split(/\s+/).filter((w) => w.length > 4));
          const sharedWords = textB.split(/\s+/).filter((w) => wordsA.has(w) && w.length > 4);

          if (sharedWords.length >= 2) {
            checkedPairs.add(pairKey);
            contradictions.push({
              topic: `${pair.topic} (Regarding: ${sharedWords.slice(0, 3).join(', ')})`,
              sourceA: {
                title: evA.sourceTitle,
                claim: evA.text.slice(0, 150).trim() + '...',
                citation: evA.chunkId || evA.id,
              },
              sourceB: {
                title: evB.sourceTitle,
                claim: evB.text.slice(0, 150).trim() + '...',
                citation: evB.chunkId || evB.id,
              },
              note: 'Sources differ in their documented claims or metrics. Evidence is presented side-by-side.',
            });
            break;
          }
        }
      }

      if (contradictions.length >= 3) break;
    }
  }

  return contradictions;
}

module.exports = {
  detectContradictions,
};

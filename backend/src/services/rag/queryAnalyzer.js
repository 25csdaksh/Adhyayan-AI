/**
 * Query Analyzer & Intent Classifier
 * Categorizes user questions, extracts target concepts/entities, detects page-specific requests,
 * determines source scope preferences, and resolves follow-up pronouns from conversation history without LLM overhead.
 */

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
  'its', 'they', 'them', 'their', 'we', 'us', 'our', 'protocol', 'protocols'
]);

const SUMMARY_PATTERNS = [
  /\b(?:summarize|summarise|summary|executive summary|overview|high-level overview)\b/i,
  /\b(?:key takeaways|key points|main points|core points|highlights)\b/i,
  /\b(?:what is this (?:document|pdf|file|source|notebook) about)\b/i,
  /\b(?:tell me about this (?:document|pdf|file|source))\b/i,
  /\b(?:what does this (?:document|pdf|file|source) (?:cover|say|contain))\b/i,
  /\b(?:give me (?:an? )?(?:overview|summary|brief))\b/i,
];

const DEFINITION_PATTERNS = [
  /\b(?:what is|what are|define|definition of|meaning of|what do you mean by)\s+([a-zA-Z0-9\s-]{2,25})(?:$|\?|\.)/i,
  /\b([a-zA-Z0-9\s-]{2,25})\s+(?:definition|meaning)\b/i,
];

const COMPARISON_PATTERNS = [
  /\bcompare\s+(.+?)\s+(?:and|with|to)\s+(.+)/i,
  /\b(?:difference|differences|distinction)\s+between\s+(.+?)\s+and\s+(.+)/i,
  /\bhow does\s+(.+?)\s+differ from\s+(.+)/i,
  /\b(?:compare|comparison between|difference between|differences between|versus| vs\.? )\b/i,
];

const PAGE_SPECIFIC_PATTERNS = [
  /\b(?:on|in|from|at)?\s*page\s*(\d+)(?:\s*(?:to|-)\s*(\d+))?\b/i,
  /\bp\.?\s*(\d+)\b/i,
];

const FOLLOW_UP_PRONOUNS = [
  /\b(?:it|this|that|these|those|its|their|the same|above|previous)\b/i,
  /\b(?:give|show|provide)\s+(?:me\s+)?(?:an?\s+)?(?:simple\s+)?example\b/i,
  /\b(?:explain|tell me)\s+(?:more|further)\b/i,
  /^(?:why\?|how\?|what else\?)$/i,
];

const WEB_ONLY_PATTERNS = [
  /\b(?:webpage|website|web source|web article|url|link|online source|from the web)\b/i,
];

const NOTEBOOK_ONLY_PATTERNS = [
  /\b(?:uploaded (?:file|doc|pdf|docx|document)|my (?:pdf|doc|document|file|notes))\b/i,
];

/**
 * Extract clean concepts from a phrase (removing stop words)
 * @param {string} text
 * @returns {string[]}
 */
function extractConceptsFromPhrase(text = '') {
  if (!text) return [];
  const words = text
    .replace(/[^a-zA-Z0-9\s-/]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w.toLowerCase()));
  return Array.from(new Set(words));
}

/**
 * Extract key entities / concepts from a text query
 * @param {string} text
 * @returns {string[]}
 */
function extractQueryConcepts(text) {
  return extractConceptsFromPhrase(text).slice(0, 5);
}

/**
 * Extract subject/topic from recent conversation history for follow-up questions
 * @param {Array<{ role: string, content: string }>} history
 * @returns {string|null}
 */
function resolveHistorySubject(history = []) {
  if (!Array.isArray(history) || history.length === 0) return null;

  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    if (msg.role === 'user' && msg.content) {
      const concepts = extractConceptsFromPhrase(msg.content);
      if (concepts.length > 0) {
        return concepts.slice(0, 3).join(' ');
      }
    }
  }

  return null;
}

/**
 * Analyze user query to extract intent, concepts, page references, source scope, and subqueries
 *
 * @param {string} query
 * @param {Array<{ role: string, content: string }>} [history=[]]
 * @returns {Object}
 */
function analyzeQuery(query = '', history = []) {
  const cleanQuery = typeof query === 'string' ? query.trim() : '';

  let intent = 'specific';
  let targetPage = null;
  let targetPageEnd = null;
  let concepts = [];
  let subQueries = [];
  let isFollowUp = false;
  let resolvedSubject = null;
  let sourceScope = 'all';

  // 1. Check Scope Preference
  if (WEB_ONLY_PATTERNS.some((p) => p.test(cleanQuery)) && !NOTEBOOK_ONLY_PATTERNS.some((p) => p.test(cleanQuery))) {
    sourceScope = 'web';
  } else if (NOTEBOOK_ONLY_PATTERNS.some((p) => p.test(cleanQuery)) && !WEB_ONLY_PATTERNS.some((p) => p.test(cleanQuery))) {
    sourceScope = 'notebook';
  }

  // 2. Check Page-Specific Intent
  for (const pat of PAGE_SPECIFIC_PATTERNS) {
    const m = cleanQuery.match(pat);
    if (m) {
      intent = 'page_specific';
      targetPage = parseInt(m[1], 10);
      if (m[2]) {
        targetPageEnd = parseInt(m[2], 10);
      }
      break;
    }
  }

  // 3. Check Summary / Overview Intent
  if (intent !== 'page_specific') {
    const isSummary = SUMMARY_PATTERNS.some((p) => p.test(cleanQuery));
    if (isSummary) {
      intent = 'summary';
    }
  }

  // 4. Check Comparison Intent
  if (intent === 'specific') {
    for (const pat of COMPARISON_PATTERNS) {
      const match = cleanQuery.match(pat);
      if (match) {
        intent = 'comparison';
        if (match[1] && match[2]) {
          const c1List = extractConceptsFromPhrase(match[1]);
          const c2List = extractConceptsFromPhrase(match[2]);
          c1List.forEach((c) => {
            if (!concepts.includes(c)) concepts.push(c);
            if (!subQueries.includes(c)) subQueries.push(c);
          });
          c2List.forEach((c) => {
            if (!concepts.includes(c)) concepts.push(c);
            if (!subQueries.includes(c)) subQueries.push(c);
          });
        }
        break;
      }
    }

    if (intent === 'specific' && /\b(?:vs|versus)\b/i.test(cleanQuery)) {
      intent = 'comparison';
      const parts = cleanQuery.split(/\b(?:vs\.?|versus)\b/i);
      if (parts.length >= 2) {
        const c1List = extractConceptsFromPhrase(parts[0]);
        const c2List = extractConceptsFromPhrase(parts[1]);
        c1List.forEach((c) => subQueries.push(c));
        c2List.forEach((c) => subQueries.push(c));
      }
    }
  }

  // 5. Check Definition Intent
  if (intent === 'specific') {
    for (const pat of DEFINITION_PATTERNS) {
      const match = cleanQuery.match(pat);
      if (match) {
        intent = 'definition';
        const term = (match[1] || '').replace(/[?.!]/g, '').trim();
        const extracted = extractConceptsFromPhrase(term);
        if (extracted.length > 0) {
          extracted.forEach((c) => {
            if (!concepts.includes(c)) concepts.push(c);
          });
        }
        break;
      }
    }
  }

  // 6. Check Follow-Up Intent & Pronoun Resolution
  const hasFollowUpSignals = FOLLOW_UP_PRONOUNS.some((p) => p.test(cleanQuery));
  const rawConcepts = extractConceptsFromPhrase(cleanQuery);

  if (history && history.length > 0 && (hasFollowUpSignals || rawConcepts.length <= 1) && (intent === 'specific' || hasFollowUpSignals)) {
    resolvedSubject = resolveHistorySubject(history);
    if (resolvedSubject) {
      isFollowUp = true;
      intent = 'follow_up';
    }
  }

  // Populate concepts if not yet extracted
  if (concepts.length === 0) {
    concepts = extractConceptsFromPhrase(cleanQuery).slice(0, 5);
  }

  // Compute effective query for vector search
  let effectiveQuery = cleanQuery;
  if (isFollowUp && resolvedSubject) {
    effectiveQuery = `${resolvedSubject} ${cleanQuery}`;
  }

  return {
    rawQuery: cleanQuery,
    effectiveQuery,
    intent,
    concepts,
    subQueries,
    targetPage,
    targetPageEnd,
    isFollowUp,
    resolvedSubject,
    sourceScope,
  };
}

module.exports = {
  analyzeQuery,
  extractQueryConcepts,
};

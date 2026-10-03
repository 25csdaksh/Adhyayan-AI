/**
 * Deterministic Research Intent Analyzer
 *
 * Classifies research inquiries into specific research modes and extracts focus entities/aspects.
 */

const INTENT_PATTERNS = [
  {
    category: 'compare',
    regex: /\b(compare|comparison|versus|vs\.?|differences? between|contrast|trade-?offs?|similarities and differences)\b/i,
  },
  {
    category: 'timeline',
    regex: /\b(timeline|chronolog(y|ical)|history of|evolution of|milestones|progression|historical sequence|dates of)\b/i,
  },
  {
    category: 'pros_cons',
    regex: /\b(pros and cons|advantages and disadvantages|benefits and drawbacks|strengths and weaknesses|plus and minus)\b/i,
  },
  {
    category: 'cause_effect',
    regex: /\b(cause(s|d)? and effect|impact of|consequences of|why did|how does .* lead to|root causes?|drivers of)\b/i,
  },
  {
    category: 'evaluate_evidence',
    regex: /\b(evaluate (the )?evidence|is there evidence|substantiate|verify claims?|critique|empirical support|assess validity)\b/i,
  },
  {
    category: 'definition',
    regex: /\b(what is|define|definition of|meaning of|what does .* stand for|core concepts? of)\b/i,
  },
  {
    category: 'summarize',
    regex: /\b(summarize|summary of|brief overview|key takeaways|executive summary|high-level recap|in short)\b/i,
  },
  {
    category: 'investigate',
    regex: /\b(investigate|deep dive|explore the role of|inquiry into|uncover|examine the relationship)\b/i,
  },
  {
    category: 'analyze',
    regex: /\b(analyze|analysis of|break down|dissect|mechanisms? of|how (does|do) .* work|inner workings)\b/i,
  },
  {
    category: 'explain',
    regex: /\b(explain|how to|why is|describe|walkthrough|clarify|elaborate on)\b/i,
  },
];

/**
 * Analyze research query to extract intent, entities, and comparison targets
 *
 * @param {string} query
 * @returns {{ category: string, confidence: number, entities: string[], aspects: string[], comparisonTargets: string[] }}
 */
function analyzeResearchIntent(query = '') {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) {
    return {
      category: 'general',
      confidence: 0.5,
      entities: [],
      aspects: [],
      comparisonTargets: [],
    };
  }

  let matchedCategory = 'general';
  let confidence = 0.75;

  for (const pattern of INTENT_PATTERNS) {
    if (pattern.regex.test(cleanQuery)) {
      matchedCategory = pattern.category;
      confidence = 0.9;
      break;
    }
  }

  // Extract comparison targets if compare intent
  const comparisonTargets = [];
  if (matchedCategory === 'compare') {
    const vsMatch = cleanQuery.match(/(?:compare|difference between|versus|vs\.?)\s+([^,]+?)\s+(?:and|with|to|vs\.?|versus)\s+([^?.!,]+)/i);
    if (vsMatch && vsMatch[1] && vsMatch[2]) {
      comparisonTargets.push(vsMatch[1].trim(), vsMatch[2].trim());
    }
  }

  // Extract capitalized keywords or quoted terms as potential entities
  const quotedEntities = (cleanQuery.match(/"([^"]+)"|'([^']+)'/g) || []).map((s) => s.replace(/['"]/g, '').trim());
  const words = cleanQuery.split(/\s+/);
  const properNouns = words.filter((w) => /^[A-Z][a-z0-9_-]+$/.test(w) && !['What', 'How', 'Why', 'Explain', 'Compare', 'Analyze', 'Summarize'].includes(w));

  const entities = Array.from(new Set([...quotedEntities, ...properNouns, ...comparisonTargets])).filter(Boolean);

  // Extract focus aspects
  const aspects = [];
  if (/\b(performance|latency|throughput|speed)\b/i.test(cleanQuery)) aspects.push('performance');
  if (/\b(security|threat|vulnerability|attack)\b/i.test(cleanQuery)) aspects.push('security');
  if (/\b(cost|price|efficiency|resource)\b/i.test(cleanQuery)) aspects.push('efficiency');
  if (/\b(scalability|scale|distributed|cluster)\b/i.test(cleanQuery)) aspects.push('scalability');
  if (/\b(accuracy|error|precision|reliability)\b/i.test(cleanQuery)) aspects.push('reliability');

  return {
    category: matchedCategory,
    confidence,
    entities,
    aspects,
    comparisonTargets,
  };
}

module.exports = {
  analyzeResearchIntent,
  INTENT_PATTERNS,
};

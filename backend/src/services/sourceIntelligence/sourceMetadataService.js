/**
 * Source Metadata & Concept Extraction Service
 * Deterministically extracts key topics, definitions, concepts, and suggested questions from source text
 */

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else', 'for', 'of', 'by', 'with',
  'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
  'further', 'then', 'once', 'here', 'there', 'all', 'any', 'both', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
  'too', 'very', 'just', 'now', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
  'has', 'had', 'do', 'does', 'did', 'can', 'could', 'should', 'would', 'will', 'shall',
  'may', 'might', 'must', 'this', 'that', 'these', 'those', 'what', 'when', 'where', 'which',
  'who', 'whom', 'whose', 'why', 'how', 'also', 'such', 'use', 'used', 'using', 'well',
  'like', 'many', 'much', 'even', 'one', 'two', 'first', 'second', 'new', 'good', 'page',
  'chapter', 'section', 'document', 'source', 'figure', 'table', 'example', 'case', 'study'
]);

/**
 * Extract key topics from text/chunks using TF frequency & entity heuristics
 * @param {string} text
 * @returns {string[]}
 */
function extractKeyTopics(text = '') {
  if (!text || typeof text !== 'string') return [];

  // Match multi-word capitalized phrases or acronyms (e.g., "Operating System", "TCP/IP", "Deadlock Detection")
  const phraseRegex = /\b([A-Z][a-z0-9]+(?:\s+[A-Z][a-z0-9]+){1,3}|[A-Z]{2,6}(?:\/[A-Z]{2,6})?)\b/g;
  const frequencyMap = new Map();

  let match;
  while ((match = phraseRegex.exec(text)) !== null) {
    const phrase = match[1].trim();
    if (!STOP_WORDS.has(phrase.toLowerCase()) && phrase.length >= 3) {
      frequencyMap.set(phrase, (frequencyMap.get(phrase) || 0) + 1);
    }
  }

  // Also count significant single domain words
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

  for (const w of words) {
    const capitalized = w.charAt(0).toUpperCase() + w.slice(1);
    frequencyMap.set(capitalized, (frequencyMap.get(capitalized) || 0) + 1);
  }

  return Array.from(frequencyMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([term]) => term)
    .slice(0, 10);
}

/**
 * Extract definitions from text using linguistic patterns
 * @param {string} text
 * @returns {Array<{ term: string, definition: string }>}
 */
function extractDefinitions(text = '') {
  if (!text || typeof text !== 'string') return [];

  const definitions = [];
  const seenTerms = new Set();

  // Pattern 1: "X is defined as Y" or "X refers to Y" or "X is a ... that ..."
  const defPatterns = [
    /\b([A-Z][\w\s-]{2,30})\s+(?:is defined as|refers to|denotes|signifies)\s+([^.\n]{10,200}\.)/g,
    /\b([A-Z][\w\s-]{2,30})\s+is\s+(?:an?|the)\s+([^.\n]{10,200}\.)/g,
    /\*\*([A-Za-z0-9\s-]{2,30})\*\*:\s*([^.\n]{10,200}\.)/g,
    /\b([A-Z][a-zA-Z0-9\s-]{2,30}):\s+([A-Z][^.\n]{10,200}\.)/g,
  ];

  for (const pattern of defPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const term = match[1].trim();
      const defContent = match[2].trim();
      const lowerTerm = term.toLowerCase();

      if (!seenTerms.has(lowerTerm) && !STOP_WORDS.has(lowerTerm) && term.length <= 40 && defContent.length >= 15) {
        seenTerms.add(lowerTerm);
        definitions.push({
          term,
          definition: defContent.endsWith('.') ? defContent : defContent + '.',
        });
      }
      if (definitions.length >= 8) break;
    }
    if (definitions.length >= 8) break;
  }

  return definitions;
}

/**
 * Extract key concepts with context
 * @param {string} text
 * @param {string[]} topics
 * @returns {Array<{ term: string, definition: string, context: string }>}
 */
function extractKeyConcepts(text = '', topics = []) {
  const definitions = extractDefinitions(text);
  const defMap = new Map(definitions.map((d) => [d.term.toLowerCase(), d.definition]));

  const concepts = [];
  const targetTerms = topics.slice(0, 6);

  for (const term of targetTerms) {
    const existingDef = defMap.get(term.toLowerCase());
    let defText = existingDef || '';
    let contextText = '';

    if (!defText) {
      // Find sentence containing the term
      const sentences = text.split(/(?<=[.!?])\s+/);
      for (const s of sentences) {
        if (s.toLowerCase().includes(term.toLowerCase()) && s.length > 25 && s.length < 250) {
          defText = s.trim();
          break;
        }
      }
    }

    if (defText) {
      contextText = `Core domain concept identified in source discussions regarding ${term}.`;
      concepts.push({
        term,
        definition: defText,
        context: contextText,
      });
    }
  }

  return concepts;
}

/**
 * Extract key takeaways and important facts
 * @param {string} text
 * @returns {{ keyTakeaways: string[], importantFacts: string[] }}
 */
function extractTakeawaysAndFacts(text = '') {
  if (!text || typeof text !== 'string') {
    return { keyTakeaways: [], importantFacts: [] };
  }

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 35 && s.length <= 250);

  const keyTakeaways = [];
  const importantFacts = [];

  for (const s of sentences) {
    const lower = s.toLowerCase();
    if (
      lower.includes('important') ||
      lower.includes('significant') ||
      lower.includes('essential') ||
      lower.includes('critical') ||
      lower.includes('in conclusion') ||
      lower.includes('overall') ||
      lower.includes('provides') ||
      lower.includes('allows') ||
      lower.includes('enables')
    ) {
      if (keyTakeaways.length < 6 && !keyTakeaways.includes(s)) {
        keyTakeaways.push(s);
      }
    } else if (
      /\b\d+(?:\.\d+)?%|\b\d{4}\b|\b(?:increases|decreases|results in|requires|guarantees)\b/i.test(s)
    ) {
      if (importantFacts.length < 6 && !importantFacts.includes(s)) {
        importantFacts.push(s);
      }
    }
  }

  // If takeaways are empty, grab prominent sentences from the first and last segments
  if (keyTakeaways.length === 0 && sentences.length > 0) {
    keyTakeaways.push(sentences[0]);
    if (sentences.length > 1) {
      keyTakeaways.push(sentences[Math.min(sentences.length - 1, 3)]);
    }
  }

  return {
    keyTakeaways: keyTakeaways.slice(0, 6),
    importantFacts: importantFacts.slice(0, 6),
  };
}

/**
 * Generate suggested study questions grounded directly in the extracted topics and concepts
 * @param {string[]} topics
 * @param {Array<{ term: string, definition: string }>} concepts
 * @param {string} documentTitle
 * @returns {string[]}
 */
function generateSuggestedQuestions(topics = [], concepts = [], documentTitle = 'this source') {
  const questions = [];

  for (const concept of concepts.slice(0, 3)) {
    questions.push(`What is ${concept.term} and how is it used according to ${documentTitle}?`);
  }

  if (topics.length >= 2) {
    questions.push(`What are the key differences between ${topics[0]} and ${topics[1]} in ${documentTitle}?`);
  }

  for (const topic of topics.slice(2, 5)) {
    questions.push(`How does ${documentTitle} explain the role of ${topic}?`);
  }

  if (questions.length === 0) {
    questions.push(`What are the main objectives and findings covered in ${documentTitle}?`);
    questions.push(`What key takeaways and conclusions does ${documentTitle} provide?`);
  }

  return questions.slice(0, 5);
}

module.exports = {
  extractKeyTopics,
  extractDefinitions,
  extractKeyConcepts,
  extractTakeawaysAndFacts,
  generateSuggestedQuestions,
};

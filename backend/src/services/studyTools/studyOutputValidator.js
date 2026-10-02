/**
 * Study Tools Output Validator and Sanitizer
 * Ensures all AI-generated or parsed content strictly satisfies schema, limits, and safety requirements.
 */

/**
 * Clean JSON strings from markdown code fences
 * @param {string} raw
 * @returns {string}
 */
function stripJsonFences(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

/**
 * Safely parse JSON from LLM output
 * @param {string} rawText
 * @returns {any}
 */
function safeJsonParse(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const cleaned = stripJsonFences(rawText);
  try {
    return JSON.parse(cleaned);
  } catch {
    // Attempt regex extraction of first JSON object or array
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Validate and sanitize summary output
 * @param {any} rawOutput
 * @returns {{ title: string, overview: string, keyPoints: string[], concepts: Array<{ term: string, definition: string }>, rawText: string }}
 */
function validateSummaryOutput(rawOutput) {
  if (typeof rawOutput === 'string') {
    const parsed = safeJsonParse(rawOutput);
    if (parsed && typeof parsed === 'object') {
      return validateSummaryOutput(parsed);
    }
    return {
      title: 'Notebook Summary',
      overview: rawOutput.trim(),
      keyPoints: [],
      concepts: [],
      rawText: rawOutput.trim(),
    };
  }

  if (typeof rawOutput !== 'object' || rawOutput === null) {
    return {
      title: 'Notebook Summary',
      overview: '',
      keyPoints: [],
      concepts: [],
      rawText: '',
    };
  }

  const title = typeof rawOutput.title === 'string' && rawOutput.title.trim() ? rawOutput.title.trim() : 'Notebook Summary';
  const overview = typeof rawOutput.overview === 'string' ? rawOutput.overview.trim() : (typeof rawOutput.summary === 'string' ? rawOutput.summary.trim() : '');
  
  const keyPoints = Array.isArray(rawOutput.keyPoints)
    ? rawOutput.keyPoints.filter((kp) => typeof kp === 'string' && kp.trim().length > 0).map((kp) => kp.trim())
    : [];

  const concepts = Array.isArray(rawOutput.concepts)
    ? rawOutput.concepts
        .filter((c) => c && typeof c === 'object' && typeof c.term === 'string' && c.term.trim())
        .map((c) => ({
          term: c.term.trim(),
          definition: typeof c.definition === 'string' ? c.definition.trim() : '',
        }))
    : [];

  return {
    title,
    overview,
    keyPoints,
    concepts,
    rawText: overview,
  };
}

/**
 * Validate and sanitize flashcard items
 * @param {any} rawOutput
 * @param {number} maxCount
 * @returns {Array<{ question: string, answer: string, difficulty: string, rawCitations?: string[] }>}
 */
function validateFlashcardsOutput(rawOutput, maxCount = 30) {
  let cards = rawOutput;
  if (typeof rawOutput === 'string') {
    const parsed = safeJsonParse(rawOutput);
    cards = Array.isArray(parsed) ? parsed : (parsed?.flashcards || parsed?.cards || []);
  } else if (rawOutput && typeof rawOutput === 'object' && !Array.isArray(rawOutput)) {
    cards = rawOutput.flashcards || rawOutput.cards || [];
  }

  if (!Array.isArray(cards)) {
    return [];
  }

  const validDifficulties = new Set(['easy', 'medium', 'hard']);
  const sanitized = [];
  const seenQuestions = new Set();

  for (const card of cards) {
    if (!card || typeof card !== 'object') continue;

    const question = typeof card.question === 'string' ? card.question.trim() : '';
    const answer = typeof card.answer === 'string' ? card.answer.trim() : '';

    if (!question || !answer) continue;

    // Deduplicate identical questions
    const qKey = question.toLowerCase();
    if (seenQuestions.has(qKey)) continue;
    seenQuestions.add(qKey);

    let difficulty = typeof card.difficulty === 'string' ? card.difficulty.toLowerCase().trim() : 'medium';
    if (!validDifficulties.has(difficulty)) {
      difficulty = 'medium';
    }

    sanitized.push({
      question,
      answer,
      difficulty,
      rawCitationTags: typeof card.citation === 'string' ? [card.citation] : (Array.isArray(card.citations) ? card.citations : []),
    });

    if (sanitized.length >= maxCount) break;
  }

  return sanitized;
}

/**
 * Validate and sanitize quiz questions
 * @param {any} rawOutput
 * @param {number} maxCount
 * @returns {Array<{ question: string, options: string[], correctAnswer: number, explanation: string, difficulty: string }>}
 */
function validateQuizOutput(rawOutput, maxCount = 20) {
  let questions = rawOutput;
  if (typeof rawOutput === 'string') {
    const parsed = safeJsonParse(rawOutput);
    questions = Array.isArray(parsed) ? parsed : (parsed?.questions || parsed?.quiz || []);
  } else if (rawOutput && typeof rawOutput === 'object' && !Array.isArray(rawOutput)) {
    questions = rawOutput.questions || rawOutput.quiz || [];
  }

  if (!Array.isArray(questions)) {
    return [];
  }

  const validDifficulties = new Set(['easy', 'medium', 'hard']);
  const sanitized = [];
  const seenQuestions = new Set();

  for (const item of questions) {
    if (!item || typeof item !== 'object') continue;

    const question = typeof item.question === 'string' ? item.question.trim() : '';
    if (!question) continue;

    const qKey = question.toLowerCase();
    if (seenQuestions.has(qKey)) continue;
    seenQuestions.add(qKey);

    if (!Array.isArray(item.options) || item.options.length !== 4) continue;

    const options = item.options.map((opt) => (typeof opt === 'string' ? opt.trim() : '')).filter((opt) => opt.length > 0);
    if (options.length !== 4) continue;

    let correctAnswer = parseInt(item.correctAnswer, 10);
    if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
      // If correctAnswer is specified as string letter (e.g. "A", "B", "C", "D")
      if (typeof item.correctAnswer === 'string') {
        const letter = item.correctAnswer.trim().toUpperCase();
        const map = { A: 0, B: 1, C: 2, D: 3 };
        if (map[letter] !== undefined) {
          correctAnswer = map[letter];
        } else {
          continue;
        }
      } else {
        continue;
      }
    }

    const explanation = typeof item.explanation === 'string' ? item.explanation.trim() : '';
    let difficulty = typeof item.difficulty === 'string' ? item.difficulty.toLowerCase().trim() : 'medium';
    if (!validDifficulties.has(difficulty)) {
      difficulty = 'medium';
    }

    sanitized.push({
      question,
      options,
      correctAnswer,
      explanation,
      difficulty,
      rawCitationTags: typeof item.citation === 'string' ? [item.citation] : (Array.isArray(item.citations) ? item.citations : []),
    });

    if (sanitized.length >= maxCount) break;
  }

  return sanitized;
}

/**
 * Validate and sanitize Mind Map hierarchical tree
 * @param {any} rawOutput
 * @param {number} maxDepth
 * @param {number} maxNodes
 * @returns {{ title: string, children: Array<Object> } | null}
 */
function validateMindMapOutput(rawOutput, maxDepth = 5, maxNodes = 100) {
  let root = rawOutput;
  if (typeof rawOutput === 'string') {
    root = safeJsonParse(rawOutput);
  }

  if (!root || typeof root !== 'object') {
    return null;
  }

  // If wrapped in an outer object like { mindmap: { ... } } or array
  if (Array.isArray(root)) {
    root = { title: 'Notebook Concepts', children: root };
  } else if (root.mindmap && typeof root.mindmap === 'object') {
    root = root.mindmap;
  }

  let nodeCount = 0;

  function sanitizeNode(node, currentDepth) {
    if (!node || typeof node !== 'object' || currentDepth > maxDepth || nodeCount >= maxNodes) {
      return null;
    }

    const title = typeof node.title === 'string' ? node.title.trim() : (typeof node.name === 'string' ? node.name.trim() : '');
    if (!title) return null;

    nodeCount++;

    const children = [];
    if (Array.isArray(node.children) && currentDepth < maxDepth) {
      for (const child of node.children) {
        if (nodeCount >= maxNodes) break;
        const validChild = sanitizeNode(child, currentDepth + 1);
        if (validChild) {
          children.push(validChild);
        }
      }
    }

    return {
      title,
      children,
      rawCitationTags: typeof node.citation === 'string' ? [node.citation] : (Array.isArray(node.citations) ? node.citations : []),
    };
  }

  const sanitizedRoot = sanitizeNode(root, 1);
  return sanitizedRoot;
}

module.exports = {
  stripJsonFences,
  safeJsonParse,
  validateSummaryOutput,
  validateFlashcardsOutput,
  validateQuizOutput,
  validateMindMapOutput,
};

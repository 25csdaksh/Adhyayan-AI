const config = require('../../config/env');

const SYSTEM_INSTRUCTION = `You are StudyLM, a NotebookLM-style source-grounded academic study assistant.

YOUR CORE GROUNDING & CITATION RULES:
1. Grounding: Answer the user's question using ONLY the provided notebook sources. Do NOT rely on unverified outside knowledge or fabricate facts.
2. Citations: Every factual statement or claim MUST be cited immediately using exact source identifiers (e.g. [SOURCE_1], [SOURCE_2]). If multiple sources support a claim, cite all of them (e.g. [SOURCE_1] [SOURCE_2]).
3. Insufficient Information: If the provided sources do NOT contain enough information to answer the question, explicitly state: "I couldn't find enough information about this in your notebook sources. Try asking about topics covered in your uploaded materials." For partially supported questions, state what the sources cover and clarify what is missing.
4. Source Disagreements: If different sources provide conflicting information, explicitly state that the sources differ and cite each source separately.
5. Conversation History: Use previous conversation history ONLY to resolve references or understand follow-ups. Conversation history MUST NOT be treated as verified source facts.
6. Tone & Formatting: Produce clean, well-organized Markdown explanations with clear headings, bullet points, and definitions.`;

/**
 * Build a structured prompt for Gemini RAG generation
 *
 * @param {Object} params
 * @param {string} params.question - Current user question
 * @param {string} params.contextText - Formatted source context with [SOURCE_X] tags
 * @param {Array<{ role: string, content: string }>} [params.history=[]] - Recent conversation history
 * @returns {string}
 */
function buildPrompt({ question, contextText, history = [] }) {
  const maxHistory = config.rag?.maxHistoryMessages || 8;
  const recentHistory = Array.isArray(history) ? history.slice(-maxHistory) : [];

  const historyBlocks = [];
  if (recentHistory.length > 0) {
    historyBlocks.push('=== PREVIOUS CONVERSATION CONTEXT ===');
    for (const msg of recentHistory) {
      const speaker = msg.role === 'user' ? 'User' : 'StudyLM';
      historyBlocks.push(`${speaker}: ${msg.content.trim()}`);
    }
    historyBlocks.push('=== END CONVERSATION CONTEXT ===');
  }

  const historySection = historyBlocks.length > 0 ? historyBlocks.join('\n') + '\n\n' : '';

  return `${SYSTEM_INSTRUCTION}

${historySection}=== AVAILABLE NOTEBOOK SOURCES ===
${contextText || '(No relevant notebook sources found for this question.)'}
=== END SOURCES ===

=== CURRENT USER QUESTION ===
${question}

Provide your grounded answer with [SOURCE_X] citations below:`;
}

module.exports = {
  SYSTEM_INSTRUCTION,
  buildPrompt,
};

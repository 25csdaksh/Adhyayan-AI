const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/env');

const EMBEDDING_MODEL = config.gemini.embeddingModel || 'text-embedding-004';
const EXPECTED_DIMENSIONS = config.gemini.dimensions || 768;

/**
 * Check if live Gemini API key is configured
 * @returns {boolean}
 */
function isLiveGeminiConfigured() {
  return Boolean(
    config.gemini.apiKey &&
    config.gemini.apiKey.trim() !== '' &&
    config.gemini.apiKey !== 'your_gemini_api_key_here' &&
    config.gemini.apiKey !== 'studylm_demo'
  );
}

/**
 * Check if development-only pseudo-embedding fallback is explicitly enabled
 * Must never be enabled in production
 * @returns {boolean}
 */
function isPseudoFallbackEnabled() {
  return !config.isProduction && Boolean(config.gemini.enablePseudoEmbeddingFallback);
}

/**
 * Deterministic pseudo-embedding generator for test/offline environments
 * Only available when ENABLE_PSEUDO_EMBEDDING_FALLBACK=true in development
 * @param {string} text
 * @param {number} [dimensions=EXPECTED_DIMENSIONS]
 * @returns {number[]}
 */
function generateDeterministicPseudoEmbedding(text, dimensions = EXPECTED_DIMENSIONS) {
  if (config.isProduction || !isPseudoFallbackEnabled()) {
    throw new Error('Pseudo-embedding generation is disabled in this environment.');
  }

  const vector = new Array(dimensions).fill(0);
  if (!text) return vector;

  const normalized = text.toLowerCase().trim();
  const words = normalized.split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash << 5) - hash + word.charCodeAt(c);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    vector[idx] += 1.0;
    // Spread weight to adjacent dimensions for smooth similarity
    vector[(idx + 1) % dimensions] += 0.5;
    vector[(idx + dimensions - 1) % dimensions] += 0.5;
  }

  // L2 Normalize vector
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = parseFloat((vector[i] / norm).toFixed(6));
    }
  } else {
    vector[0] = 1.0;
  }

  return vector;
}

/**
 * Validate embedding vector integrity and dimensions
 * @param {number[]} vector
 * @param {number} [expectedDim=EXPECTED_DIMENSIONS]
 */
/**
 * Validate and normalize embedding vector to exact target dimensions (L2 normalized)
 * @param {number[]} vector
 * @param {number} [expectedDim=EXPECTED_DIMENSIONS]
 * @returns {number[]}
 */
function validateAndNormalizeEmbeddingVector(vector, expectedDim = EXPECTED_DIMENSIONS) {
  if (!Array.isArray(vector) || vector.length === 0) {
    throw new Error('Generated embedding must be a non-empty array');
  }

  let finalVector = vector;
  if (vector.length > expectedDim) {
    // Truncate to expected dimensions and re-normalize
    finalVector = vector.slice(0, expectedDim);
    let norm = 0;
    for (let i = 0; i < finalVector.length; i++) {
      norm += finalVector[i] * finalVector[i];
    }
    norm = Math.sqrt(norm);
    if (norm > 0) {
      finalVector = finalVector.map((v) => parseFloat((v / norm).toFixed(6)));
    }
  } else if (vector.length < expectedDim) {
    throw new Error(
      `Embedding vector dimension mismatch: expected ${expectedDim}, received ${vector.length}`
    );
  }

  for (let i = 0; i < finalVector.length; i++) {
    if (typeof finalVector[i] !== 'number' || isNaN(finalVector[i])) {
      throw new Error(`Embedding vector contains invalid numeric value at index ${i}`);
    }
  }
  return finalVector;
}

/**
 * Validate embedding vector integrity and dimensions
 * @param {number[]} vector
 * @param {number} [expectedDim=EXPECTED_DIMENSIONS]
 */
function validateEmbeddingVector(vector, expectedDim = EXPECTED_DIMENSIONS) {
  return validateAndNormalizeEmbeddingVector(vector, expectedDim);
}

/**
 * Sleep helper for exponential backoff
 * @param {number} ms
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CANDIDATE_EMBEDDING_MODELS = Array.from(
  new Set([config.gemini.embeddingModel || 'gemini-embedding-001', 'gemini-embedding-001', 'text-embedding-004'])
).filter(Boolean);

/**
 * Generate embedding for a single text string
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function generateEmbedding(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Cannot generate embedding for empty text content');
  }

  const cleanText = text.trim();

  // If live Gemini is not configured, check if explicit opt-in dev fallback is enabled
  if (!isLiveGeminiConfigured()) {
    if (isPseudoFallbackEnabled()) {
      const vector = generateDeterministicPseudoEmbedding(cleanText, EXPECTED_DIMENSIONS);
      validateEmbeddingVector(vector, EXPECTED_DIMENSIONS);
      return vector;
    }
    throw new Error(
      'Google Gemini API key is not configured and pseudo-embedding fallback is disabled.'
    );
  }

  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  let lastError = null;

  for (const modelName of CANDIDATE_EMBEDDING_MODELS) {
    const model = genAI.getGenerativeModel({ model: modelName });
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await model.embedContent({
          content: { parts: [{ text: cleanText }] },
          outputDimensionality: EXPECTED_DIMENSIONS,
        });
        const rawVector = result?.embedding?.values;

        if (!rawVector) {
          throw new Error('Gemini API returned an empty embedding vector');
        }

        const normalized = validateAndNormalizeEmbeddingVector(rawVector, EXPECTED_DIMENSIONS);
        return normalized;
      } catch (err) {
        lastError = err;
        const errMsg = err.message || '';
        const isNotFound = errMsg.includes('404') || errMsg.includes('not found') || errMsg.includes('not supported');
        if (isNotFound) {
          // Break inner loop to try next candidate model
          break;
        }

        const isTransient =
          errMsg.includes('429') ||
          errMsg.includes('503') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('fetch failed');

        if (isTransient && attempt < maxRetries) {
          await sleep(Math.pow(2, attempt) * 500);
          continue;
        }
        break;
      }
    }
  }

  throw new Error(`Gemini embedding generation failed: ${lastError?.message || 'Unknown API error'}`);
}

/**
 * Generate embeddings for an array of texts with batching and concurrency control
 * @param {string[]} texts
 * @param {number} [batchSize=16]
 * @returns {Promise<number[][]>}
 */
async function generateEmbeddings(texts, batchSize = 16) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  const results = [];

  // If live Gemini is not configured, check if explicit opt-in dev fallback is enabled
  if (!isLiveGeminiConfigured()) {
    if (isPseudoFallbackEnabled()) {
      for (const text of texts) {
        const vector = generateDeterministicPseudoEmbedding(text || '', EXPECTED_DIMENSIONS);
        validateEmbeddingVector(vector, EXPECTED_DIMENSIONS);
        results.push(vector);
      }
      return results;
    }
    throw new Error(
      'Google Gemini API key is not configured and pseudo-embedding fallback is disabled.'
    );
  }

  // Process items in chunks
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    for (const text of batch) {
      const v = await generateEmbedding(text);
      results.push(v);
    }

    if (i + batchSize < texts.length) {
      await sleep(100);
    }
  }

  return results;
}

module.exports = {
  generateEmbedding,
  generateEmbeddings,
  validateEmbeddingVector,
  validateAndNormalizeEmbeddingVector,
  generateDeterministicPseudoEmbedding,
  isLiveGeminiConfigured,
  isPseudoFallbackEnabled,
  EMBEDDING_MODEL: CANDIDATE_EMBEDDING_MODELS[0],
  EXPECTED_DIMENSIONS,
};

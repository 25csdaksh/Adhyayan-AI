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
 * Deterministic pseudo-embedding generator for test/offline environments
 * Generates an L2-normalized 768-dimensional vector based on text content
 * @param {string} text
 * @returns {number[]}
 */
function generateDeterministicPseudoEmbedding(text, dimensions = EXPECTED_DIMENSIONS) {
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
function validateEmbeddingVector(vector, expectedDim = EXPECTED_DIMENSIONS) {
  if (!Array.isArray(vector)) {
    throw new Error('Generated embedding must be an array');
  }
  if (vector.length !== expectedDim) {
    throw new Error(
      `Embedding vector dimension mismatch: expected ${expectedDim}, received ${vector.length}`
    );
  }
  for (let i = 0; i < vector.length; i++) {
    if (typeof vector[i] !== 'number' || isNaN(vector[i])) {
      throw new Error(`Embedding vector contains invalid numeric value at index ${i}`);
    }
  }
}

/**
 * Sleep helper for exponential backoff
 * @param {number} ms
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

  // If live Gemini is not configured, return deterministic pseudo-embedding
  if (!isLiveGeminiConfigured()) {
    const vector = generateDeterministicPseudoEmbedding(cleanText, EXPECTED_DIMENSIONS);
    validateEmbeddingVector(vector, EXPECTED_DIMENSIONS);
    return vector;
  }

  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });

  // Retry with exponential backoff for transient failures (429/503)
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.embedContent(cleanText);
      const vector = result?.embedding?.values;

      if (!vector) {
        throw new Error('Gemini API returned an empty embedding vector');
      }

      validateEmbeddingVector(vector, EXPECTED_DIMENSIONS);
      return vector;
    } catch (err) {
      lastError = err;
      const isTransient =
        err.message?.includes('429') ||
        err.message?.includes('503') ||
        err.message?.includes('RESOURCE_EXHAUSTED') ||
        err.message?.includes('fetch failed');

      if (isTransient && attempt < maxRetries) {
        await sleep(Math.pow(2, attempt) * 500);
        continue;
      }
      break;
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

  // If live Gemini is not configured, process quickly in-memory
  if (!isLiveGeminiConfigured()) {
    for (const text of texts) {
      const vector = generateDeterministicPseudoEmbedding(text || '', EXPECTED_DIMENSIONS);
      validateEmbeddingVector(vector, EXPECTED_DIMENSIONS);
      results.push(vector);
    }
    return results;
  }

  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });

  // Process in batches
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    // Try batchEmbedContents API first
    let batchVectors = null;
    try {
      const requests = batch.map((t) => ({
        content: { parts: [{ text: t }] },
      }));

      const batchResult = await model.batchEmbedContents({ requests });
      if (batchResult?.embeddings && Array.isArray(batchResult.embeddings)) {
        batchVectors = batchResult.embeddings.map((e) => e.values);
      }
    } catch {
      batchVectors = null;
    }

    if (batchVectors && batchVectors.length === batch.length) {
      for (const v of batchVectors) {
        validateEmbeddingVector(v, EXPECTED_DIMENSIONS);
        results.push(v);
      }
    } else {
      // Fallback to sequential single embedding generation for this batch
      for (const text of batch) {
        const v = await generateEmbedding(text);
        results.push(v);
      }
    }

    // Small delay between batches to respect rate limits
    if (i + batchSize < texts.length) {
      await sleep(150);
    }
  }

  return results;
}

module.exports = {
  generateEmbedding,
  generateEmbeddings,
  validateEmbeddingVector,
  generateDeterministicPseudoEmbedding,
  isLiveGeminiConfigured,
  EMBEDDING_MODEL,
  EXPECTED_DIMENSIONS,
};

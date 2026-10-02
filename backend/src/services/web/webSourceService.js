const config = require('../../config/env');
const WebSource = require('../../models/WebSource');
const Chunk = require('../../models/Chunk');
const { safeFetchWebPage } = require('./webFetcher');
const { extractWebContent } = require('./webExtractor');
const { canonicalizeUrl, computeContentHash } = require('./urlCanonicalizer');
const { chunkText } = require('../document/chunker');
const { generateEmbeddings } = require('../embedding/embeddingService');

/**
 * Ingest, extract, chunk, embed, and cache a web source URL
 *
 * @param {Object} params
 * @param {string|import('mongoose').Types.ObjectId} params.notebookId
 * @param {string|import('mongoose').Types.ObjectId} params.userId
 * @param {string} params.url
 * @param {boolean} [params.forceRefresh=false]
 * @returns {Promise<import('../../models/WebSource')>}
 */
async function ingestWebSource({ notebookId, userId, url, forceRefresh = false }) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    throw new Error('Valid web page URL is required');
  }

  const cleanUrl = url.trim();
  const canonical = canonicalizeUrl(cleanUrl);

  const cacheTtlHours = config.web?.cacheTtlHours || 24;
  const cacheTtlMs = cacheTtlHours * 60 * 60 * 1000;

  // 1. Check for existing WebSource record in this notebook
  let webSource = await WebSource.findOne({
    notebookId,
    canonicalUrl: canonical,
  });

  // Freshness check: if existing and fresh and not forceRefresh, return immediately
  if (
    webSource &&
    !forceRefresh &&
    webSource.status === 'ready' &&
    webSource.expiresAt &&
    webSource.expiresAt > new Date()
  ) {
    return webSource;
  }

  if (!webSource) {
    webSource = await WebSource.create({
      userId,
      notebookId,
      url: cleanUrl,
      canonicalUrl: canonical,
      status: 'pending',
    });
  } else {
    webSource.status = 'processing';
    webSource.error = null;
    await webSource.save();
  }

  try {
    // 2. Safely fetch web page content with SSRF and redirect validation
    const fetchResult = await safeFetchWebPage(canonical);

    // 3. Extract text and metadata
    const extracted = extractWebContent(fetchResult.html, fetchResult.finalUrl);
    const contentHash = computeContentHash(extracted.mainText);

    if (!extracted.mainText || extracted.mainText.trim().length === 0) {
      throw new Error('No readable text content could be extracted from web page');
    }

    // 4. Chunk extracted text
    const rawChunks = chunkText(extracted.mainText, {
      notebookId,
    });

    if (rawChunks.length === 0) {
      throw new Error('Extracted content could not be segmented into study chunks');
    }

    // 5. Generate embeddings for chunks using existing embedding service
    const chunkTexts = rawChunks.map((c) => c.text);
    const embeddings = await generateEmbeddings(chunkTexts);

    // 6. Atomically replace chunks in database
    await Chunk.deleteMany({ webSourceId: webSource._id });

    const chunkDocuments = rawChunks.map((chunk, idx) => ({
      webSourceId: webSource._id,
      sourceKind: 'web',
      notebookId,
      chunkIndex: idx,
      text: chunk.text,
      charCount: chunk.charCount || chunk.text.length,
      tokenCount: chunk.tokenCount || Math.ceil(chunk.text.length / 4),
      embedding: embeddings[idx],
      embeddingModel: config.gemini?.embeddingModel || 'text-embedding-004',
      embeddingDimensions: config.gemini?.dimensions || 768,
      embeddedAt: new Date(),
      metadata: {
        domain: extracted.domain,
        canonicalUrl: extracted.canonicalUrl,
        title: extracted.title,
      },
    }));

    await Chunk.insertMany(chunkDocuments);

    // 7. Update WebSource to ready state
    webSource.title = extracted.title;
    webSource.description = extracted.description;
    webSource.domain = extracted.domain;
    webSource.content = extracted.mainText;
    webSource.contentHash = contentHash;
    webSource.httpStatus = fetchResult.httpStatus;
    webSource.mimeType = fetchResult.contentType;
    webSource.publishedAt = extracted.publishedAt;
    webSource.fetchedAt = new Date();
    webSource.expiresAt = new Date(Date.now() + cacheTtlMs);
    webSource.status = 'ready';
    webSource.error = null;
    await webSource.save();

    return webSource;
  } catch (err) {
    webSource.status = 'failed';
    webSource.error = err.message || 'Web source ingestion failed';
    await webSource.save();
    throw err;
  }
}

/**
 * Get web sources for a notebook with pagination
 */
async function getWebSources({ notebookId, userId, page = 1, limit = 20 }) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [sources, total] = await Promise.all([
    WebSource.find({ notebookId, userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    WebSource.countDocuments({ notebookId, userId }),
  ]);

  return {
    sources,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

/**
 * Get single web source by ID
 */
async function getWebSourceById({ notebookId, webSourceId, userId }) {
  return WebSource.findOne({
    _id: webSourceId,
    notebookId,
    userId,
  });
}

/**
 * Delete a web source and all its associated chunks
 */
async function deleteWebSource({ notebookId, webSourceId, userId }) {
  const deleted = await WebSource.findOneAndDelete({
    _id: webSourceId,
    notebookId,
    userId,
  });

  if (!deleted) {
    return null;
  }

  await Chunk.deleteMany({ webSourceId });
  return deleted;
}

module.exports = {
  ingestWebSource,
  getWebSources,
  getWebSourceById,
  deleteWebSource,
};

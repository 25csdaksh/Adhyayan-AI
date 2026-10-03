const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studylm',
  jwtSecret: process.env.JWT_SECRET || 'studylm_super_secure_jwt_secret_development_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '20', 10),
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
    chatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash',
    fallbackChatModel: process.env.GEMINI_CHAT_FALLBACK_MODEL || '',
    dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '768', 10),
    enablePseudoEmbeddingFallback:
      process.env.NODE_ENV !== 'production' &&
      process.env.ENABLE_PSEUDO_EMBEDDING_FALLBACK === 'true',
  },
  rag: {
    defaultTopK: parseInt(process.env.RAG_DEFAULT_TOP_K || '5', 10),
    maxTopK: parseInt(process.env.RAG_MAX_TOP_K || '10', 10),
    defaultScoreThreshold: parseFloat(process.env.RAG_DEFAULT_SCORE_THRESHOLD || '0.1'),
    maxContextChunks: parseInt(process.env.RAG_MAX_CONTEXT_CHUNKS || '8', 10),
    maxContextChars: parseInt(process.env.RAG_MAX_CONTEXT_CHARS || '30000', 10),
    maxHistoryMessages: parseInt(process.env.RAG_MAX_HISTORY_MESSAGES || '8', 10),
    maxChatMessageLength: parseInt(process.env.MAX_CHAT_MESSAGE_LENGTH || '5000', 10),
  },
  search: {
    defaultTopK: parseInt(process.env.DEFAULT_VECTOR_TOP_K || '5', 10),
    maxTopK: parseInt(process.env.MAX_VECTOR_TOP_K || '20', 10),
    defaultScoreThreshold: parseFloat(process.env.DEFAULT_VECTOR_SCORE_THRESHOLD || '0.5'),
  },
  processing: {
    maxTextChars: parseInt(process.env.MAX_TEXT_CHARS || '2000000', 10),
    maxChunksPerDocument: parseInt(process.env.MAX_CHUNKS_PER_DOCUMENT || '1000', 10),
    urlFetchTimeoutMs: parseInt(process.env.URL_FETCH_TIMEOUT_MS || '15000', 10),
    maxUrlResponseMb: parseInt(process.env.MAX_URL_RESPONSE_MB || '5', 10),
  },
  web: {
    fetchTimeoutMs: parseInt(process.env.WEB_FETCH_TIMEOUT_MS || '15000', 10),
    maxResponseBytes: parseInt(process.env.WEB_MAX_RESPONSE_BYTES || '5000000', 10),
    maxExtractedChars: parseInt(process.env.WEB_MAX_EXTRACTED_CHARS || '2000000', 10),
    maxRedirects: parseInt(process.env.WEB_MAX_REDIRECTS || '5', 10),
    cacheTtlHours: parseInt(process.env.WEB_SOURCE_CACHE_TTL_HOURS || '24', 10),
  },
  webSearch: {
    provider: process.env.WEB_SEARCH_PROVIDER || 'duckduckgo',
    apiKey: process.env.WEB_SEARCH_API_KEY || '',
  },
  research: {
    maxSearchResults: parseInt(process.env.RESEARCH_MAX_SEARCH_RESULTS || '5', 10),
    maxFetchedSources: parseInt(process.env.RESEARCH_MAX_FETCHED_SOURCES || '5', 10),
    maxContextChunks: parseInt(process.env.RESEARCH_MAX_CONTEXT_CHUNKS || '10', 10),
    maxContextChars: parseInt(process.env.RESEARCH_MAX_CONTEXT_CHARS || '40000', 10),
    maxHistoryMessages: parseInt(process.env.RESEARCH_MAX_HISTORY_MESSAGES || '8', 10),
    maxQueryLength: parseInt(process.env.MAX_RESEARCH_QUERY_LENGTH || '2000', 10),
  },
  billing: {
    provider: process.env.PAYMENT_PROVIDER || 'razorpay',
    currency: process.env.PAYMENT_CURRENCY || 'INR',
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID || '',
      keySecret: process.env.RAZORPAY_KEY_SECRET || '',
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
      proPlanId: process.env.RAZORPAY_PRO_PLAN_ID || 'plan_studylm_pro_monthly',
      enterprisePlanId: process.env.RAZORPAY_ENTERPRISE_PLAN_ID || 'plan_studylm_enterprise_monthly',
    },
    prices: {
      proMonthly: parseInt(process.env.PRO_PLAN_PRICE_INR || '999', 10), // ₹999 / month
      enterpriseMonthly: parseInt(process.env.ENTERPRISE_PLAN_PRICE_INR || '4999', 10), // ₹4,999 / month
    },
  },
  allowedOrigins: (process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    : [process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173']
  ).filter(Boolean),
};

// Validate critical production configurations
if (config.isProduction) {
  const missingSecrets = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    missingSecrets.push('JWT_SECRET (must be >= 32 chars)');
  }
  if (!process.env.MONGO_URI) {
    missingSecrets.push('MONGO_URI');
  }
  if (!process.env.GEMINI_API_KEY) {
    missingSecrets.push('GEMINI_API_KEY');
  }

  if (missingSecrets.length > 0) {
    console.error(`[CRITICAL CONFIG ERROR] Missing required production environment variables: ${missingSecrets.join(', ')}`);
    process.exit(1);
  }

  if (config.gemini.enablePseudoEmbeddingFallback) {
    console.error('[CRITICAL CONFIG ERROR] ENABLE_PSEUDO_EMBEDDING_FALLBACK must be false in production');
    process.exit(1);
  }
}

module.exports = config;

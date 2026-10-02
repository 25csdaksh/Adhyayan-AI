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
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004',
    chatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-flash',
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
};

// Validate critical configurations
if (!process.env.PORT) {
  console.warn('[Config Warning] PORT is not explicitly set in environment, defaulting to 5000');
}

if (!process.env.JWT_SECRET && config.isProduction) {
  console.error('[Config Error] JWT_SECRET must be defined in production environment');
  process.exit(1);
}

module.exports = config;

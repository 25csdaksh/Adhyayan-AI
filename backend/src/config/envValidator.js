/**
 * Environment and Secret Validation on Application Startup
 * Fails fast if critical production configurations are missing or insecure
 */

function validateEnvironment() {
  const isProduction = process.env.NODE_ENV === 'production';
  const errors = [];
  const warnings = [];

  // Critical Variables
  if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
    errors.push('MONGO_URI is required to connect to MongoDB database.');
  }

  if (!process.env.JWT_SECRET) {
    if (isProduction) {
      errors.push('JWT_SECRET must be explicitly defined in production.');
    } else {
      warnings.push('JWT_SECRET is not set in development, using default fallback key.');
    }
  } else if (isProduction && process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long in production.');
  }

  // Gemini API Key Validation
  if (!process.env.GEMINI_API_KEY) {
    if (isProduction) {
      errors.push('GEMINI_API_KEY is required for production embedding and RAG services.');
    } else {
      warnings.push('GEMINI_API_KEY is not set in development; AI requests may use development fallback.');
    }
  }

  // Production Pseudo-Embedding Safety
  if (isProduction && process.env.ENABLE_PSEUDO_EMBEDDING_FALLBACK === 'true') {
    errors.push('ENABLE_PSEUDO_EMBEDDING_FALLBACK must be false in production environments.');
  }

  // Print warnings safely
  warnings.forEach((warn) => {
    console.warn(`[Config Notice] ${warn}`);
  });

  // Handle fatal errors
  if (errors.length > 0) {
    console.error('====================================================');
    console.error('🛑 FATAL CONFIGURATION ERROR - STARTUP ABORTED:');
    errors.forEach((err, idx) => {
      console.error(`  ${idx + 1}. ${err}`);
    });
    console.error('====================================================');
    
    if (isProduction) {
      process.exit(1);
    }
    return false;
  }

  return true;
}

module.exports = {
  validateEnvironment,
};

const config = require('../config/env');

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'jwtsecret',
  'authorization',
  'gemini_api_key',
  'apikey',
  'apisecret',
  'cloudinary_api_secret',
  'cookie',
  'secret',
]);

/**
 * Deeply clone and redact sensitive keys from objects before logging
 */
function redactSensitiveData(data, depth = 0) {
  if (depth > 5 || data === null || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item, depth + 1));
  }

  const redacted = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
    if (SENSITIVE_KEYS.has(lowerKey)) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      redacted[key] = redactSensitiveData(value, depth + 1);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

/**
 * Production-ready structured JSON logger
 */
const logger = {
  info: (message, meta = {}) => {
    const payload = {
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...redactSensitiveData(meta),
    };
    console.log(JSON.stringify(payload));
  },

  warn: (message, meta = {}) => {
    const payload = {
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...redactSensitiveData(meta),
    };
    console.warn(JSON.stringify(payload));
  },

  error: (message, meta = {}) => {
    const errorObj = meta.error || {};
    const payload = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      ...(errorObj.message && { errorMessage: errorObj.message }),
      ...(errorObj.stack && !config.isProduction && { stack: errorObj.stack }),
      ...(errorObj.code && { errorCode: errorObj.code }),
      ...redactSensitiveData(meta),
    };
    console.error(JSON.stringify(payload));
  },

  debug: (message, meta = {}) => {
    if (config.env === 'development' || process.env.DEBUG === 'true') {
      const payload = {
        level: 'DEBUG',
        timestamp: new Date().toISOString(),
        message,
        ...redactSensitiveData(meta),
      };
      console.log(JSON.stringify(payload));
    }
  },
};

module.exports = {
  logger,
  redactSensitiveData,
};

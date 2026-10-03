const { logger } = require('../utils/logger');
const config = require('../config/env');

/**
 * Structured Request Logging Middleware
 * Logs route, method, status, duration, user ID, and requestId without exposing private content
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Do not log routine health check polling in production unless there's an error
    if (req.originalUrl.startsWith('/api/health') && statusCode < 400 && config.isProduction) {
      return;
    }

    const meta = {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode,
      durationMs,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userId: req.user?._id ? req.user._id.toString() : undefined,
      notebookId: req.params?.notebookId || undefined,
    };

    if (statusCode >= 500) {
      logger.error(`HTTP ${req.method} ${req.originalUrl} failed with status ${statusCode}`, meta);
    } else if (statusCode >= 400) {
      logger.warn(`HTTP ${req.method} ${req.originalUrl} responded with client error ${statusCode}`, meta);
    } else {
      logger.info(`HTTP ${req.method} ${req.originalUrl} completed with status ${statusCode}`, meta);
    }
  });

  next();
};

module.exports = requestLogger;

const config = require('../config/env');
const ApiError = require('../utils/apiError');
const { logger } = require('../utils/logger');
const observabilityService = require('../services/observability/observabilityService');

/**
 * Standardized Error Code Resolver
 */
function resolveErrorCode(statusCode, errName) {
  if (statusCode === 400) return 'VALIDATION_ERROR';
  if (statusCode === 401) return 'UNAUTHORIZED';
  if (statusCode === 403) return 'FORBIDDEN';
  if (statusCode === 404) return 'NOT_FOUND';
  if (statusCode === 408 || statusCode === 504) return 'TIMEOUT_ERROR';
  if (statusCode === 409) return 'CONFLICT';
  if (statusCode === 429) return 'RATE_LIMIT_EXCEEDED';
  if (errName === 'CastError') return 'INVALID_IDENTIFIER';
  if (errName === 'ValidationError') return 'VALIDATION_ERROR';
  return 'INTERNAL_ERROR';
}

/**
 * Global Centralized Production Error Handling Middleware
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;
  const requestId = req.id || req.headers?.['x-request-id'] || 'req_unknown';

  // Transform non-ApiError instances into ApiError
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    let message = error.message || 'An unexpected server error occurred.';

    // Mongoose duplicate key error (E11000)
    if (error.code === 11000) {
      statusCode = 409;
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      message = `Duplicate value entered for ${field}. Please use another value.`;
    }

    // Mongoose bad ObjectId CastError
    if (error.name === 'CastError') {
      statusCode = 400;
      message = `Invalid resource identifier format: ${error.value}`;
    }

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((e) => e.message);
      message = messages.join(', ');
    }

    // Multer file upload errors
    if (error.name === 'MulterError') {
      statusCode = 400;
      if (error.code === 'LIMIT_FILE_SIZE') {
        message = `File size exceeds the maximum allowed limit of ${config.maxFileSizeMb}MB.`;
      }
    }

    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  const statusCode = error.statusCode || 500;
  const errorCode = resolveErrorCode(statusCode, err.name);

  const responsePayload = {
    success: false,
    message: error.message,
    error: {
      code: errorCode,
      message: error.message,
      requestId,
      statusCode,
      ...(error.errors && Object.keys(error.errors).length > 0 && { details: error.errors }),
    },
    ...(!config.isProduction && { stack: error.stack }),
  };

  // Structured logging and observability
  if (statusCode >= 500) {
    logger.error(`[Unhandled Error] ${req.method} ${req.originalUrl}: ${error.message}`, {
      error,
      requestId,
      statusCode,
      url: req.originalUrl,
      method: req.method,
      userId: req.user?._id?.toString(),
    });
    observabilityService.captureException(error, { requestId, url: req.originalUrl });
  }

  res.status(statusCode).json(responsePayload);
};

module.exports = errorHandler;

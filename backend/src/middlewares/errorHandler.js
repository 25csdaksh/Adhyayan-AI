const config = require('../config/env');
const ApiError = require('../utils/apiError');

/**
 * Global Centralized Error Handling Middleware
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose / MongoDB errors
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    let message = error.message || 'Internal Server Error';

    // Mongoose duplicate key error
    if (error.code === 11000) {
      statusCode = 409;
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      message = `Duplicate value entered for ${field}`;
    }

    // Mongoose bad ObjectId CastError
    if (error.name === 'CastError') {
      statusCode = 400;
      message = `Invalid resource identifier: ${error.value}`;
    }

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((e) => e.message);
      message = messages.join(', ');
    }

    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    ...(error.errors && Object.keys(error.errors).length > 0 && { errors: error.errors }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    ...(!config.isProduction && { stack: error.stack }),
  };

  // Log server errors (5xx)
  if (error.statusCode >= 500) {
    console.error(`[Error 500] [${req.method}] ${req.originalUrl}:`, error);
  }

  res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;

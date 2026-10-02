const ApiError = require('../utils/apiError');

/**
 * Middleware to handle unmatched routes (404)
 */
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Endpoint not found: [${req.method}] ${req.originalUrl}`));
};

module.exports = notFoundHandler;

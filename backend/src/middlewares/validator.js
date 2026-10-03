const mongoose = require('mongoose');
const ApiError = require('../utils/apiError');

/**
 * Validates that specified request route parameters are valid MongoDB ObjectIds
 * @param {...string} paramNames
 */
const validateObjectIds = (...paramNames) => {
  return (req, res, next) => {
    for (const name of paramNames) {
      const val = req.params[name];
      if (val && !mongoose.Types.ObjectId.isValid(val)) {
        return next(ApiError.badRequest(`Invalid identifier format for parameter '${name}': ${val}`));
      }
    }
    next();
  };
};

/**
 * Validates and normalizes pagination query parameters (page, limit)
 */
const validatePagination = (req, res, next) => {
  if (req.query.page !== undefined) {
    const pageNum = parseInt(req.query.page, 10);
    if (isNaN(pageNum) || pageNum < 1 || pageNum > 10000) {
      return next(ApiError.badRequest("Query parameter 'page' must be an integer between 1 and 10000."));
    }
    req.query.page = pageNum;
  }

  if (req.query.limit !== undefined) {
    const limitNum = parseInt(req.query.limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return next(ApiError.badRequest("Query parameter 'limit' must be an integer between 1 and 100."));
    }
    req.query.limit = limitNum;
  }

  next();
};

/**
 * Validates request body against field constraints
 * @param {Object} schema - e.g. { title: { required: true, minLength: 1, maxLength: 120 } }
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return next(ApiError.badRequest('Request body must be a valid JSON object.'));
    }

    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      if (rules.required && (value === undefined || value === null || (typeof value === 'string' && value.trim() === ''))) {
        errors.push({ field, message: `Field '${field}' is required.` });
        continue;
      }

      if (value !== undefined && value !== null) {
        if (rules.type && typeof value !== rules.type) {
          errors.push({ field, message: `Field '${field}' must be of type '${rules.type}'.` });
        }

        if (typeof value === 'string') {
          if (rules.minLength && value.trim().length < rules.minLength) {
            errors.push({ field, message: `Field '${field}' must have at least ${rules.minLength} characters.` });
          }
          if (rules.maxLength && value.trim().length > rules.maxLength) {
            errors.push({ field, message: `Field '${field}' cannot exceed ${rules.maxLength} characters.` });
          }
        }

        if (typeof value === 'number') {
          if (rules.min !== undefined && value < rules.min) {
            errors.push({ field, message: `Field '${field}' must be at least ${rules.min}.` });
          }
          if (rules.max !== undefined && value > rules.max) {
            errors.push({ field, message: `Field '${field}' cannot exceed ${rules.max}.` });
          }
        }

        if (rules.enum && !rules.enum.includes(value)) {
          errors.push({ field, message: `Field '${field}' must be one of: ${rules.enum.join(', ')}.` });
        }
      }
    }

    if (errors.length > 0) {
      return next(new ApiError(400, 'Validation failed for request parameters.', errors));
    }

    next();
  };
};

module.exports = {
  validateObjectIds,
  validatePagination,
  validateBody,
};

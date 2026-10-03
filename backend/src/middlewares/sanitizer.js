/**
 * NoSQL Injection and Parameter Sanitization Middleware
 * Recursively strips keys starting with '$' or containing '.' from request body, query, and params
 */

function sanitizeObject(obj, depth = 0) {
  if (depth > 8 || obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, depth + 1));
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    // Drop keys that attempt MongoDB operator injection
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    clean[key] = sanitizeObject(value, depth + 1);
  }
  return clean;
}

const noSqlSanitizer = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
};

module.exports = {
  noSqlSanitizer,
  sanitizeObject,
};

const crypto = require('crypto');

/**
 * Request Correlation ID Middleware
 * Assigns or propagates a unique Request ID across the lifecycle of each HTTP request
 */
const requestIdMiddleware = (req, res, next) => {
  // Use existing valid incoming header or generate a cryptographically random request ID
  const incomingId = req.headers['x-request-id'];
  const requestId =
    typeof incomingId === 'string' && incomingId.length <= 64 && /^[a-zA-Z0-9_-]+$/.test(incomingId)
      ? incomingId
      : `req_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;

  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
};

module.exports = requestIdMiddleware;

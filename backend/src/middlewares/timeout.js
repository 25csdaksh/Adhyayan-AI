/**
 * Request Timeout Middleware
 * Enforces bounded execution time on Express route handlers
 */
const requestTimeout = (timeoutMs = 60000) => {
  return (req, res, next) => {
    // Configure server socket timeout
    req.setTimeout(timeoutMs, () => {
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          message: 'Request timed out waiting for server processing.',
          error: {
            code: 'TIMEOUT_ERROR',
            message: `Request exceeded maximum timeout limit of ${timeoutMs / 1000}s`,
            requestId: req.id,
          },
        });
      }
    });

    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          message: 'Request timed out waiting for server processing.',
          error: {
            code: 'TIMEOUT_ERROR',
            message: `Request exceeded maximum timeout limit of ${timeoutMs / 1000}s`,
            requestId: req.id,
          },
        });
      }
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
};

module.exports = requestTimeout;

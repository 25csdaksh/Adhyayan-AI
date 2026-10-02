/**
 * Wrapper for async route handlers to automatically catch errors and pass to next()
 * @param {Function} requestHandler
 * @returns {Function} Express middleware function
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

module.exports = asyncHandler;

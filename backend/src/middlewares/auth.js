const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware to authenticate requests using JWT Bearer tokens
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication token is required. Please sign in.');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw ApiError.unauthorized('Authentication token is missing.');
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Session has expired. Please log in again.');
    }
    throw ApiError.unauthorized('Invalid authentication token.');
  }

  // Load user from database
  const user = await User.findById(decoded.userId);

  if (!user) {
    throw ApiError.unauthorized('User account no longer exists.');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account is currently disabled. Please contact support.');
  }

  // Attach authenticated user to request context
  req.user = user;
  next();
});

module.exports = {
  authenticate,
};

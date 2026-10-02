const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate a signed JWT token
 * @param {object} payload - minimal payload: { userId, role }
 * @returns {string} Signed JWT
 */
const generateToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      role: payload.role || 'user',
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
    }
  );
};

/**
 * Verify a JWT token
 * @param {string} token
 * @returns {object} Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

module.exports = {
  generateToken,
  verifyToken,
};

const express = require('express');
const {
  register,
  login,
  getCurrentUser,
  updateProfile,
  logout,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');
const { authRateLimiter } = require('../middlewares/rateLimiter');
const { validateBody } = require('../middlewares/validator');

const router = express.Router();

// Public auth endpoints with rate limiting & validation
router.post(
  '/register',
  authRateLimiter,
  validateBody({
    name: { required: true, minLength: 2, maxLength: 60 },
    email: { required: true, minLength: 5, maxLength: 100 },
    password: { required: true, minLength: 8, maxLength: 128 },
  }),
  register
);

router.post(
  '/login',
  authRateLimiter,
  validateBody({
    email: { required: true },
    password: { required: true },
  }),
  login
);

router.post('/logout', logout);

// Protected user endpoints
router.get('/me', authenticate, getCurrentUser);
router.patch(
  '/profile',
  authenticate,
  validateBody({
    name: { minLength: 2, maxLength: 60 },
  }),
  updateProfile
);

module.exports = router;

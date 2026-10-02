const express = require('express');
const {
  register,
  login,
  getCurrentUser,
  updateProfile,
  logout,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected user endpoints
router.get('/me', authenticate, getCurrentUser);
router.patch('/profile', authenticate, updateProfile);

module.exports = router;

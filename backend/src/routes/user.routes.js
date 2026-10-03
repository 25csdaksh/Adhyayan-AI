const express = require('express');
const {
  getProfile,
  updateProfile,
  updatePassword,
  getUsage,
  exportData,
  deleteAccount,
} = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth');
const { authRateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.use(authenticate);

router.route('/profile').get(getProfile).patch(updateProfile);
router.route('/password').put(authRateLimiter, updatePassword);
router.route('/usage').get(getUsage);
router.route('/export-data').get(exportData);
router.route('/me').delete(deleteAccount);

module.exports = router;

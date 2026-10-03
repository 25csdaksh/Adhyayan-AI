const express = require('express');
const {
  createWebSource,
  getWebSources,
  getWebSourceById,
  refreshWebSource,
  deleteWebSource,
} = require('../controllers/webSource.controller');
const { authenticate } = require('../middlewares/auth');
const { uploadRateLimiter } = require('../middlewares/rateLimiter');
const { validateObjectIds, validatePagination } = require('../middlewares/validator');

const router = express.Router({ mergeParams: true });

// Protect all web source routes and validate notebookId param
router.use(authenticate);
router.use(validateObjectIds('notebookId'));

router.post('/', uploadRateLimiter, createWebSource);
router.get('/', validatePagination, getWebSources);
router.get('/:webSourceId', validateObjectIds('webSourceId'), getWebSourceById);
router.post('/:webSourceId/refresh', uploadRateLimiter, validateObjectIds('webSourceId'), refreshWebSource);
router.delete('/:webSourceId', validateObjectIds('webSourceId'), deleteWebSource);

module.exports = router;


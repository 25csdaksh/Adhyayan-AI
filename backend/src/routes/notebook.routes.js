const express = require('express');
const {
  createNotebook,
  getNotebooks,
  getNotebookById,
  updateNotebook,
  deleteNotebook,
} = require('../controllers/notebook.controller');
const { authenticate } = require('../middlewares/auth');
const { validateObjectIds, validatePagination } = require('../middlewares/validator');
const { searchRateLimiter } = require('../middlewares/rateLimiter');

const documentRoutes = require('./document.routes');
const chatRoutes = require('./chat.routes');
const studyToolRoutes = require('./studyTool.routes');
const webSourceRoutes = require('./webSource.routes');
const researchRoutes = require('./research.routes');
const { searchNotebook } = require('../controllers/search.controller');

const router = express.Router();

// All notebook operations require valid JWT authentication
router.use(authenticate);

// Vector search endpoint for a specific notebook
router.post(
  '/:notebookId/search',
  validateObjectIds('notebookId'),
  searchRateLimiter,
  searchNotebook
);

// Re-route into document routes
router.use('/:notebookId/documents', documentRoutes);

// Re-route into chat routes
router.use('/:notebookId/chats', chatRoutes);

// Re-route into study tools routes
router.use('/:notebookId/study-tools', studyToolRoutes);

// Re-route into web source routes
router.use('/:notebookId/web-sources', webSourceRoutes);

// Re-route into research routes
router.use('/:notebookId/research', researchRoutes);

router.route('/')
  .post(createNotebook)
  .get(validatePagination, getNotebooks);

router.route('/:id')
  .get(validateObjectIds('id'), getNotebookById)
  .patch(validateObjectIds('id'), updateNotebook)
  .delete(validateObjectIds('id'), deleteNotebook);

module.exports = router;


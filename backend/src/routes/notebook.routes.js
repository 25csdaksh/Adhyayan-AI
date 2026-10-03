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

// Phase 13 Controllers
const { getMemory: getNotebookMem, updateMemory: updateNotebookMem } = require('../controllers/notebookMemory.controller');
const { getRelationships, detectRelationships } = require('../controllers/sourceRelationship.controller');
const {
  getSavedInsights,
  createSavedInsight,
  updateSavedInsight,
  deleteSavedInsight,
} = require('../controllers/savedInsight.controller');
const { getBookmarks, addBookmark, removeBookmark } = require('../controllers/bookmark.controller');
const { getActivity } = require('../controllers/activity.controller');
const { searchAll } = require('../controllers/universalSearch.controller');
const { getOverview, getRecommendations } = require('../controllers/overview.controller');
const { getChunkPreview } = require('../controllers/sourcePreview.controller');

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

// Universal multi-category search
router.get(
  '/:notebookId/universal-search',
  validateObjectIds('notebookId'),
  searchAll
);

// Knowledge Overview and Study Recommendations
router.get(
  '/:notebookId/overview',
  validateObjectIds('notebookId'),
  getOverview
);
router.get(
  '/:notebookId/recommendations',
  validateObjectIds('notebookId'),
  getRecommendations
);

// Notebook Memory & Custom Instructions
router
  .route('/:notebookId/memory')
  .get(validateObjectIds('notebookId'), getNotebookMem)
  .patch(validateObjectIds('notebookId'), updateNotebookMem);

// Source Relationships
router.get(
  '/:notebookId/relationships',
  validateObjectIds('notebookId'),
  getRelationships
);
router.post(
  '/:notebookId/relationships/detect',
  validateObjectIds('notebookId'),
  detectRelationships
);

// Saved Insights
router
  .route('/:notebookId/insights')
  .get(validateObjectIds('notebookId'), getSavedInsights)
  .post(validateObjectIds('notebookId'), createSavedInsight);

router
  .route('/:notebookId/insights/:id')
  .patch(validateObjectIds('notebookId', 'id'), updateSavedInsight)
  .delete(validateObjectIds('notebookId', 'id'), deleteSavedInsight);

// Bookmarks
router
  .route('/:notebookId/bookmarks')
  .get(validateObjectIds('notebookId'), getBookmarks)
  .post(validateObjectIds('notebookId'), addBookmark);

router.delete(
  '/:notebookId/bookmarks/:id',
  validateObjectIds('notebookId', 'id'),
  removeBookmark
);

// Research Activity Timeline
router.get(
  '/:notebookId/activity',
  validateObjectIds('notebookId'),
  validatePagination,
  getActivity
);

// Deep Link Citation Chunk Preview
router.get(
  '/:notebookId/chunks/:chunkId/preview',
  validateObjectIds('notebookId', 'chunkId'),
  getChunkPreview
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



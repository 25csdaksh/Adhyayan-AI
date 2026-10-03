const express = require('express');
const {
  createSummary,
  createFlashcards,
  createQuiz,
  createMindMap,
  getStudyTools,
  getStudyToolById,
  deleteStudyTool,
} = require('../controllers/studyTool.controller');
const { authenticate } = require('../middlewares/auth');
const { aiRateLimiter } = require('../middlewares/rateLimiter');
const { validateObjectIds, validatePagination } = require('../middlewares/validator');

const router = express.Router({ mergeParams: true });

// Protect all study tool routes and validate notebookId param
router.use(authenticate);
router.use(validateObjectIds('notebookId'));

// Generation endpoints (AI rate limited)
router.post('/summary', aiRateLimiter, createSummary);
router.post('/flashcards', aiRateLimiter, createFlashcards);
router.post('/quiz', aiRateLimiter, createQuiz);
router.post('/mindmap', aiRateLimiter, createMindMap);

// History and inspection endpoints
router.get('/', validatePagination, getStudyTools);
router.get('/:studyToolId', validateObjectIds('studyToolId'), getStudyToolById);
router.delete('/:studyToolId', validateObjectIds('studyToolId'), deleteStudyTool);

module.exports = router;


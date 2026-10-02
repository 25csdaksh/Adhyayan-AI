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

const router = express.Router({ mergeParams: true });

// Protect all study tool routes
router.use(authenticate);

// Generation endpoints
router.post('/summary', createSummary);
router.post('/flashcards', createFlashcards);
router.post('/quiz', createQuiz);
router.post('/mindmap', createMindMap);

// History and inspection endpoints
router.get('/', getStudyTools);
router.get('/:studyToolId', getStudyToolById);
router.delete('/:studyToolId', deleteStudyTool);

module.exports = router;

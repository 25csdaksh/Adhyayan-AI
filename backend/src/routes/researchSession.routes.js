const express = require('express');
const {
  createResearchSession,
  getResearchSessions,
  getResearchSessionById,
  deleteResearchSession,
  exportResearchSession,
} = require('../controllers/researchSession.controller');
const { validateObjectIds, validatePagination } = require('../middlewares/validator');
const { aiRateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(validateObjectIds('notebookId'), aiRateLimiter, createResearchSession)
  .get(validateObjectIds('notebookId'), validatePagination, getResearchSessions);

router
  .route('/:id')
  .get(validateObjectIds('notebookId', 'id'), getResearchSessionById)
  .delete(validateObjectIds('notebookId', 'id'), deleteResearchSession);

router.post(
  '/:id/export',
  validateObjectIds('notebookId', 'id'),
  exportResearchSession
);

module.exports = router;

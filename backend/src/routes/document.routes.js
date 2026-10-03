const express = require('express');
const {
  createDocument,
  getDocuments,
  getDocumentById,
  getDocumentStatus,
  reprocessDocument,
  refreshDocument,
  getDocumentChunks,
  updateDocument,
  deleteDocument,
  getDocumentAnalysis,
  triggerAnalyzeDocument,
  getDocumentCoverage,
} = require('../controllers/document.controller');
const { authenticate } = require('../middlewares/auth');
const { uploadMiddleware } = require('../middlewares/upload');
const { uploadRateLimiter } = require('../middlewares/rateLimiter');
const { validateObjectIds, validatePagination } = require('../middlewares/validator');

const router = express.Router({ mergeParams: true });

// Require authentication and validate notebookId parameter
router.use(authenticate);
router.use(validateObjectIds('notebookId'));

router
  .route('/')
  .post(uploadRateLimiter, uploadMiddleware, createDocument)
  .get(validatePagination, getDocuments);

router
  .route('/:documentId')
  .all(validateObjectIds('documentId'))
  .get(getDocumentById)
  .patch(updateDocument)
  .delete(deleteDocument);

router.get('/:documentId/status', validateObjectIds('documentId'), getDocumentStatus);
router.post('/:documentId/process', validateObjectIds('documentId'), uploadRateLimiter, reprocessDocument);
router.post('/:documentId/refresh', validateObjectIds('documentId'), uploadRateLimiter, refreshDocument);
router.post('/:documentId/embed', validateObjectIds('documentId'), uploadRateLimiter, reprocessDocument);
router.get('/:documentId/chunks', validateObjectIds('documentId'), validatePagination, getDocumentChunks);
router.get('/:documentId/analysis', validateObjectIds('documentId'), getDocumentAnalysis);
router.post('/:documentId/analyze', validateObjectIds('documentId'), uploadRateLimiter, triggerAnalyzeDocument);
router.get('/:documentId/coverage', validateObjectIds('documentId'), getDocumentCoverage);

module.exports = router;

const express = require('express');
const {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} = require('../controllers/document.controller');
const { authenticate } = require('../middlewares/auth');
const { uploadMiddleware } = require('../middlewares/upload');

const router = express.Router({ mergeParams: true });

// Require authentication for all document endpoints
router.use(authenticate);

router
  .route('/')
  .post(uploadMiddleware, createDocument)
  .get(getDocuments);

router
  .route('/:documentId')
  .get(getDocumentById)
  .patch(updateDocument)
  .delete(deleteDocument);

module.exports = router;

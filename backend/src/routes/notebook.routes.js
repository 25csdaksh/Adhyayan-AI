const express = require('express');
const {
  createNotebook,
  getNotebooks,
  getNotebookById,
  updateNotebook,
  deleteNotebook,
} = require('../controllers/notebook.controller');
const { authenticate } = require('../middlewares/auth');

const documentRoutes = require('./document.routes');
const { searchNotebook } = require('../controllers/search.controller');

const router = express.Router();

// All notebook operations require valid JWT authentication
router.use(authenticate);

// Vector search endpoint for a specific notebook
router.post('/:notebookId/search', searchNotebook);

// Re-route into document routes
router.use('/:notebookId/documents', documentRoutes);

router.route('/')
  .post(createNotebook)
  .get(getNotebooks);

router.route('/:id')
  .get(getNotebookById)
  .patch(updateNotebook)
  .delete(deleteNotebook);

module.exports = router;

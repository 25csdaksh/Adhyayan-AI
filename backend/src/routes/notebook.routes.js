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

const router = express.Router();

// All notebook operations require valid JWT authentication
router.use(authenticate);

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

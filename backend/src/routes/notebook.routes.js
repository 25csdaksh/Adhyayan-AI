const express = require('express');
const {
  createNotebook,
  getNotebooks,
  getNotebookById,
  updateNotebook,
  deleteNotebook,
} = require('../controllers/notebook.controller');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// All notebook operations require valid JWT authentication
router.use(authenticate);

router.route('/')
  .post(createNotebook)
  .get(getNotebooks);

router.route('/:id')
  .get(getNotebookById)
  .patch(updateNotebook)
  .delete(deleteNotebook);

module.exports = router;

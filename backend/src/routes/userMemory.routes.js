const express = require('express');
const {
  getMemories,
  createMemory,
  updateMemory,
  deleteMemory,
} = require('../controllers/userMemory.controller');
const { authenticate } = require('../middlewares/auth');
const { validateObjectIds, validatePagination } = require('../middlewares/validator');

const router = express.Router();

// All memory routes require JWT authentication
router.use(authenticate);

router
  .route('/')
  .get(validatePagination, getMemories)
  .post(createMemory);

router
  .route('/:id')
  .patch(validateObjectIds('id'), updateMemory)
  .delete(validateObjectIds('id'), deleteMemory);

module.exports = router;

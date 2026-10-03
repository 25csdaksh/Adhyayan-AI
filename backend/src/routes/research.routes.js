const express = require('express');
const { runResearch } = require('../controllers/research.controller');
const { authenticate } = require('../middlewares/auth');
const { aiRateLimiter } = require('../middlewares/rateLimiter');
const { validateObjectIds } = require('../middlewares/validator');

const router = express.Router({ mergeParams: true });

// Protect all research routes and validate notebookId
router.use(authenticate);
router.use(validateObjectIds('notebookId'));

router.post('/', aiRateLimiter, runResearch);

module.exports = router;


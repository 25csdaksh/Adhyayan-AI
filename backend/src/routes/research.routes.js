const express = require('express');
const { runResearch } = require('../controllers/research.controller');
const { authenticate } = require('../middlewares/auth');

const router = express.Router({ mergeParams: true });

// Protect all research routes
router.use(authenticate);

router.post('/', runResearch);

module.exports = router;

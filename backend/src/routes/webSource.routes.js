const express = require('express');
const {
  createWebSource,
  getWebSources,
  getWebSourceById,
  refreshWebSource,
  deleteWebSource,
} = require('../controllers/webSource.controller');
const { authenticate } = require('../middlewares/auth');

const router = express.Router({ mergeParams: true });

// Protect all web source routes
router.use(authenticate);

router.post('/', createWebSource);
router.get('/', getWebSources);
router.get('/:webSourceId', getWebSourceById);
router.post('/:webSourceId/refresh', refreshWebSource);
router.delete('/:webSourceId', deleteWebSource);

module.exports = router;

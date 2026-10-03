const express = require('express');
const {
  getHealthStatus,
  getLiveness,
  getReadiness,
} = require('../controllers/health.controller');

const router = express.Router();

// GET /api/health
router.get('/', getHealthStatus);

// GET /api/health/live (Liveness probe)
router.get('/live', getLiveness);

// GET /api/health/ready (Readiness probe)
router.get('/ready', getReadiness);

module.exports = router;

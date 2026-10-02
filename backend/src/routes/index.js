const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const notebookRoutes = require('./notebook.routes');

const router = express.Router();

// Mount sub-routers
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/notebooks', notebookRoutes);

module.exports = router;

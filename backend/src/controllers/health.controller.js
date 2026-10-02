const mongoose = require('mongoose');
const config = require('../config/env');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getDatabaseStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    state: states[mongoose.connection.readyState] || 'unknown',
    host: mongoose.connection.host || 'none',
    name: mongoose.connection.name || 'none',
  };
};

/**
 * Health check controller
 * GET /api/health
 */
const getHealthStatus = asyncHandler(async (req, res) => {
  const dbStatus = getDatabaseStatus();

  const healthData = {
    status: 'ok',
    service: 'StudyLM Backend API',
    version: '1.0.0',
    phase: 'Phase 01 - Foundation',
    environment: config.env,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    system: {
      nodeVersion: process.version,
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
    },
  };

  return ApiResponse.success(res, healthData, 'StudyLM API is healthy and operational', 200);
});

module.exports = {
  getHealthStatus,
};

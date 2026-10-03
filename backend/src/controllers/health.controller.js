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
    connected: mongoose.connection.readyState === 1,
    host: mongoose.connection.host || 'none',
    name: mongoose.connection.name || 'none',
  };
};

/**
 * Full Diagnostic Health check controller
 * GET /api/health
 */
const getHealthStatus = asyncHandler(async (req, res) => {
  const dbStatus = getDatabaseStatus();

  const healthData = {
    status: dbStatus.connected ? 'ok' : 'degraded',
    service: 'StudyLM Backend API',
    version: '1.0.0',
    phase: 'Phase 12 - Production Hardening & Observability',
    environment: config.env,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    dependencies: {
      geminiConfigured: Boolean(config.gemini.apiKey),
      cloudinaryConfigured: Boolean(config.cloudinary.cloudName && config.cloudinary.apiKey),
      pseudoEmbeddingFallback: config.gemini.enablePseudoEmbeddingFallback,
      vectorDimensions: config.gemini.dimensions,
    },
    system: {
      nodeVersion: process.version,
      memoryUsageMB: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
    },
  };

  const statusCode = dbStatus.connected ? 200 : 503;
  return ApiResponse.success(res, healthData, 'StudyLM system health status', statusCode);
});

/**
 * Liveness Probe (K8s / Container)
 * GET /api/health/live
 */
const getLiveness = asyncHandler(async (req, res) => {
  return res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

/**
 * Readiness Probe (K8s / Load Balancer)
 * GET /api/health/ready
 */
const getReadiness = asyncHandler(async (req, res) => {
  const dbStatus = getDatabaseStatus();
  const isReady = dbStatus.connected;

  if (isReady) {
    return res.status(200).json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(503).json({
    status: 'not_ready',
    database: dbStatus.state,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  getHealthStatus,
  getLiveness,
  getReadiness,
};

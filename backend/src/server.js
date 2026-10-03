const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const { validateEnvironment } = require('./config/envValidator');
const { logger } = require('./utils/logger');
const { startStaleJobRecovery } = require('./services/document/staleJobRecoveryService');

// Validate critical environment configurations before accepting traffic
validateEnvironment();

let server;
let recoveryInterval;

/**
 * Initialize application services and start HTTP server
 */
const startServer = () => {
  // Start HTTP Server
  server = app.listen(config.port, () => {
    logger.info(`🚀 StudyLM Backend Service running in ${config.env} mode on port ${config.port}`, {
      port: config.port,
      env: config.env,
      serverUrl: `http://localhost:${config.port}`,
      healthEndpoint: `http://localhost:${config.port}/api/health`,
    });
    console.log('====================================================');
    console.log(`🚀 StudyLM Backend Service is running`);
    console.log(`📡 Environment:  ${config.env}`);
    console.log(`🌐 Server URL:   http://localhost:${config.port}`);
    console.log(`🩺 Health check: http://localhost:${config.port}/api/health`);
    console.log('====================================================');
  });

  // Initiate database connection asynchronously
  connectDB()
    .then(() => {
      // Start background stale document recovery task
      recoveryInterval = startStaleJobRecovery(10 * 60 * 1000); // Check every 10m
    })
    .catch((err) => {
      logger.warn(`[MongoDB Notice] Database connection initialized with notice: ${err.message}`);
    });
};

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`[Server] Received ${signal}. Initiating graceful shutdown...`);
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);

  // Force exit timeout if cleanup hangs (10 seconds)
  const forceExitTimer = setTimeout(() => {
    logger.error('[Server] Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  // Clear background timers
  if (recoveryInterval) {
    clearInterval(recoveryInterval);
  }

  if (server) {
    server.close(async () => {
      logger.info('[Server] HTTP server stopped accepting connections.');
      try {
        if (mongoose.connection && mongoose.connection.readyState !== 0) {
          await mongoose.connection.close(false);
          logger.info('[Server] MongoDB connection cleanly closed.');
        }
      } catch (dbErr) {
        logger.error('[Server] Error closing database connection:', dbErr);
      }
      clearTimeout(forceExitTimer);
      process.exit(0);
    });
  } else {
    clearTimeout(forceExitTimer);
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  logger.error('[Process Error] Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  logger.error('[Process Error] Uncaught Exception:', err);
  process.exit(1);
});

startServer();


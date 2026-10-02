const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');

let server;

/**
 * Initialize application services and start HTTP server
 */
const startServer = () => {
  // Start HTTP Server immediately
  server = app.listen(config.port, () => {
    console.log('====================================================');
    console.log(`🚀 StudyLM Backend Service is running`);
    console.log(`📡 Environment:  ${config.env}`);
    console.log(`🌐 Server URL:   http://localhost:${config.port}`);
    console.log(`🩺 Health check: http://localhost:${config.port}/api/health`);
    console.log('====================================================');
  });

  // Initiate database connection asynchronously without blocking server startup
  connectDB().catch((err) => {
    console.warn(`[MongoDB Notice] Database connection initialized with notice: ${err.message}`);
  });
};

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
  if (server) {
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error('[Process Error] Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('[Process Error] Uncaught Exception:', err);
  process.exit(1);
});

startServer();

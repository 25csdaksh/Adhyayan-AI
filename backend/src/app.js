const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const apiRoutes = require('./routes');
const notFoundHandler = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const requestIdMiddleware = require('./middlewares/requestId');
const requestLogger = require('./middlewares/requestLogger');
const { noSqlSanitizer } = require('./middlewares/sanitizer');
const requestTimeout = require('./middlewares/timeout');
const { generalRateLimiter } = require('./middlewares/rateLimiter');

const app = express();

// Request Correlation ID
app.use(requestIdMiddleware);

// Security HTTP headers
app.use(helmet());

// CORS Configuration supporting explicit production origins & dev local ports
const devOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      const isAllowed = config.allowedOrigins.includes(origin);
      const isDevLocal = !config.isProduction && (devOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin));

      if (isAllowed || isDevLocal) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'Retry-After'],
  })
);

// Structured & morgan logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Request execution timeout
app.use(requestTimeout(90000));

// Body parsers with rawBody capture for webhook signature verification
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NoSQL Operator Injection Sanitizer
app.use(noSqlSanitizer);

// General Tier Rate Limiting
app.use(generalRateLimiter);

// Root welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to StudyLM API Backend (Phase 12: Production Hardened)',
    healthEndpoint: '/api/health',
    authEndpoints: '/api/auth',
    documentation: 'https://github.com/25csdaksh/Adhyayan-AI',
  });
});

// Main API Routes
app.use('/api', apiRoutes);

// Catch 404s
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;


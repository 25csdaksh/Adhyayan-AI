const config = require('../config/env');

/**
 * High-performance in-memory sliding window rate limiter
 */
class SlidingWindowLimiter {
  constructor(windowMs, maxRequests, tierName = 'general') {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.tierName = tierName;
    this.hits = new Map();

    // Periodic cleanup of stale entries every 60s
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, timestamps] of this.hits.entries()) {
        const valid = timestamps.filter((t) => now - t < this.windowMs);
        if (valid.length === 0) {
          this.hits.delete(key);
        } else {
          this.hits.set(key, valid);
        }
      }
    }, 60000);

    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  isAllowed(key) {
    const now = Date.now();
    const timestamps = this.hits.get(key) || [];
    const valid = timestamps.filter((t) => now - t < this.windowMs);

    if (valid.length >= this.maxRequests) {
      const oldest = valid[0];
      const retryAfterSeconds = Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000));
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    valid.push(now);
    this.hits.set(key, valid);
    return {
      allowed: true,
      remaining: this.maxRequests - valid.length,
      retryAfterSeconds: 0,
    };
  }

  reset() {
    this.hits.clear();
  }
}

/**
 * Factory to create Express rate limiting middleware for a specific tier
 */
function createRateLimiter({
  windowMs = 60000,
  maxRequests = 100,
  tierName = 'general',
  message = 'Too many requests. Please try again later.',
}) {
  const limiter = new SlidingWindowLimiter(windowMs, maxRequests, tierName);

  const middleware = (req, res, next) => {
    // Allow bypassing rate limits in automated test environments when configured
    if (process.env.NODE_ENV === 'test' && process.env.ENABLE_TEST_RATE_LIMIT !== 'true') {
      return next();
    }

    // Key can be authenticated user ID or client IP
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const rateKey = req.user?._id ? `user:${req.user._id}:${tierName}` : `ip:${clientIp}:${tierName}`;

    const { allowed, remaining, retryAfterSeconds } = limiter.isAllowed(rateKey);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (!allowed) {
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
          requestId: req.id,
          retryAfterSeconds,
          tier: tierName,
        },
      });
    }

    next();
  };

  middleware.limiterInstance = limiter;
  return middleware;
}

// Configured Limiters for Application Endpoints
const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  maxRequests: parseInt(process.env.RATE_LIMIT_GENERAL_MAX || '600', 10),
  tierName: 'general',
  message: 'General API rate limit exceeded. Please slow down your requests.',
});

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  maxRequests: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '30', 10),
  tierName: 'auth',
  message: 'Too many authentication attempts. Please try again in a few minutes.',
});

const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 min
  maxRequests: parseInt(process.env.RATE_LIMIT_AI_MAX || '60', 10),
  tierName: 'ai',
  message: 'AI operation rate limit reached. Please wait a moment before sending more queries.',
});

const uploadRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  maxRequests: parseInt(process.env.RATE_LIMIT_UPLOAD_MAX || '40', 10),
  tierName: 'upload',
  message: 'Document upload limit reached. Please wait before uploading additional files.',
});

const searchRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 min
  maxRequests: parseInt(process.env.RATE_LIMIT_SEARCH_MAX || '100', 10),
  tierName: 'search',
  message: 'Search rate limit exceeded. Please slow down your search requests.',
});

module.exports = {
  createRateLimiter,
  generalRateLimiter,
  authRateLimiter,
  aiRateLimiter,
  uploadRateLimiter,
  searchRateLimiter,
  SlidingWindowLimiter,
};

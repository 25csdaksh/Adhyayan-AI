# StudyLM — Production Hardening & Deployment Guide

This document defines the production requirements, architecture hardening, configuration flags, operational safeguards, and disaster recovery procedures for **StudyLM (Adhyayan-AI)**.

---

## 1. Production Architecture Overview

StudyLM is architected as a resilient, multi-source grounded AI research platform.

```text
[ Client (Vite React + Tailwind) ]
                │
                ▼ (HTTPS / Strict CORS / Correlation ID / Helmet)
[ Express API Gateway ] ────► [ Sliding Window Rate Limiters (5 Tiers) ]
                │
                ├────► [ NoSQL Injection & Body Sanitizer ]
                ├────► [ Health & Readiness Probes (/live, /ready) ]
                │
                ▼
[ Controllers & Route Handlers ]
                │
                ├────► [ MongoDB Atlas (Vector Search & Metadata) ]
                ├────► [ Cloudinary (Secure Asset Storage) ]
                └────► [ AI Concurrency Manager & Request Deduplicator ]
                                │
                                ▼ (Bounded Concurrency & Exponential Retries)
                       [ Google Gemini 2.5 Flash API ]
```

---

## 2. Environment Variables & Secret Validation

Startup validation (`backend/src/config/envValidator.js`) performs strict pre-flight checks. Missing critical values in production immediately aborts startup (`process.exit(1)`).

| Variable | Environment | Description | Production Constraint |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | All | `development` / `production` / `test` | Must be `production` |
| `PORT` | All | Server listening port | Default: `5000` |
| `MONGO_URI` | All | MongoDB connection string | Required |
| `JWT_SECRET` | All | Secret key for JWT authentication | Required (Min 32 characters) |
| `GEMINI_API_KEY` | All | Google Gemini API Key | Required for embeddings & RAG |
| `ENABLE_PSEUDO_EMBEDDING_FALLBACK` | Production | Fallback flag for mock embeddings | **MUST be `false`** |
| `CLIENT_URL` | Production | Allowed frontend origin | Required for strict CORS |
| `MAX_CONCURRENT_AI_REQUESTS` | All | Max simultaneous AI workers | Default: `6` |
| `PROCESSING_STALE_AFTER_MS` | All | Stale document recovery timeout | Default: `1800000` (30m) |

---

## 3. Tiered Rate Limiting System

Sliding-window memory rate limiting (`backend/src/middlewares/rateLimiter.js`) protects endpoints by Client IP and Authenticated User ID:

1. **General API Tier**: 600 requests / 15 minutes
2. **Authentication Tier**: 30 attempts / 15 minutes
3. **AI & RAG Tier**: 60 operations / 1 minute
4. **Document Ingestion Tier**: 40 uploads / 15 minutes
5. **Vector Search Tier**: 100 searches / 1 minute

When limits are exceeded, the API returns **HTTP 429 Too Many Requests** with `Retry-After` header and structured payload:
```json
{
  "success": false,
  "message": "AI operation rate limit reached. Please wait a moment before sending more queries.",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "AI operation rate limit reached. Please wait a moment before sending more queries.",
    "requestId": "req_1727951234_abc123",
    "retryAfterSeconds": 45,
    "tier": "ai"
  }
}
```

---

## 4. AI Quota Protection & Concurrency Throttle

`AiConcurrencyManager` safeguards Gemini API quota through:
- **Bounded Concurrency**: Limits concurrent calls to `MAX_CONCURRENT_AI_REQUESTS` (default 6).
- **In-Flight Request Deduplication**: Duplicate simultaneous requests with the same prompt hash attach to existing in-flight promises, preventing double billing.
- **Bounded Exponential Backoff**: Retries transient HTTP 429 / 503 errors up to 3 times with jitter.
- **Safety Timeout**: Request handlers time out at 90s, preventing hanging sockets.

---

## 5. Health & Readiness Probes

Container orchestrators (Kubernetes, AWS ECS, Docker Compose) monitor service health using dedicated endpoints:

- **`GET /api/health`**: General application health status.
- **`GET /api/health/live`**: Liveness probe (returns 200 if process is alive).
- **`GET /api/health/ready`**: Readiness probe (verifies MongoDB connectivity, vector search readiness, and AI configuration).

---

## 6. Stale Job Recovery & Background Reliability

- Background documents in state `processing` older than `PROCESSING_STALE_AFTER_MS` (30m) are automatically marked `failed` with descriptive error messages by `staleJobRecoveryService.js`.
- Clean error states allow users to re-trigger document processing safely without orphaned chunks or partial embedding leaks.

---

## 7. Graceful Shutdown

Upon `SIGTERM` or `SIGINT`:
1. Server stops accepting new inbound connections.
2. Background timer tasks and interval workers are cleared.
3. Active requests are allowed up to 10 seconds to complete cleanly.
4. MongoDB connection is cleanly closed (`mongoose.connection.close(false)`).
5. Process exits with code 0.

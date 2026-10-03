# StudyLM — Production Launch Checklist

## Pre-Launch Verification & Operations Runbook

---

### 1. Environment & Secrets Management
- [x] `NODE_ENV=production` verified in runtime environment.
- [x] `ENABLE_PSEUDO_EMBEDDING_FALLBACK=false` enforced for production builds.
- [x] `GEMINI_API_KEY` validated with `text-embedding-004` and `gemini-1.5-flash` models.
- [x] `JWT_SECRET` configured with high-entropy 256-bit secret.
- [x] Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) verified.
- [x] MongoDB Atlas connection URI secured over TLS with replica set support.
- [x] Zero hardcoded secrets, API keys, or JWT tokens in repository or git history.

---

### 2. Database & Search Indexes
- [x] MongoDB Atlas Vector Search index `vector_index` active on `chunks.embedding`.
- [x] Compound multi-tenant indexes created on all 16 collections:
  - `User`: `{ email: 1 }`
  - `Notebook`: `{ ownerId: 1, createdAt: -1 }`
  - `Document`: `{ notebookId: 1, userId: 1, createdAt: -1 }`
  - `Chunk`: `{ documentId: 1, chunkIndex: 1 }`, `{ notebookId: 1 }`
  - `WebSource`: `{ notebookId: 1, userId: 1 }`
  - `ChatSession`: `{ notebookId: 1, userId: 1, updatedAt: -1 }`
  - `ChatMessage`: `{ sessionId: 1, createdAt: 1 }`
  - `UserMemory`: `{ userId: 1, type: 1, active: 1 }`
  - `NotebookMemory`: `{ notebookId: 1 }` (unique)
  - `SavedInsight`: `{ notebookId: 1, createdAt: -1 }`, text index on `{ title: 'text', content: 'text' }`
  - `Bookmark`: `{ userId: 1, targetType: 1, targetId: 1 }` (unique)
  - `SourceRelationship`: `{ notebookId: 1, 'sourceA.id': 1, 'sourceB.id': 1 }` (unique)
  - `ResearchSession`: `{ notebookId: 1, createdAt: -1 }`, `{ userId: 1, createdAt: -1 }`
  - `ActivityLog`: `{ notebookId: 1, createdAt: -1 }`
  - `UsageRecord`: `{ userId: 1, date: 1 }` (unique), `{ userId: 1, month: 1 }`

---

### 3. Security, Hardening & Rate Limiting
- [x] Multi-tier API rate limiting enabled:
  - Auth rate limiter: 10 requests / 15 mins
  - AI generation rate limiter: 30 requests / min
  - Vector search rate limiter: 60 requests / min
  - General API rate limiter: 200 requests / 15 mins
- [x] Hop-by-hop SSRF validation for external URL ingestion and web research.
- [x] Strict NoSQL injection sanitization on all request bodies and query parameters.
- [x] Strict CORS origin validation against `CLIENT_URL`.
- [x] Security response headers configured via Helmet (HSTS, CSP, X-Frame-Options).

---

### 4. Reliability & Observability
- [x] Production health probes:
  - Liveness probe: `/api/health`
  - Readiness probe: `/api/health/ready` (validates MongoDB connection)
- [x] Structured JSON logger with request IDs and correlation tracking.
- [x] Safe AI concurrency bounded semaphore preventing quota exhaustion.
- [x] Graceful shutdown handling (`SIGTERM`/`SIGINT`) waiting for in-flight requests.

---

### 5. Productization, Subscriptions & Monetization (Phase 16)
- [x] Subscription and billing data models (`Subscription`, `Payment`, `BillingEvent`) with compound indexes.
- [x] Server-authoritative checkout and pricing (₹999/mo Pro, ₹4,999/mo Enterprise).
- [x] Cryptographic HMAC-SHA256 signature verification on payment completion and webhooks.
- [x] Idempotent webhook processing preventing duplicate activations or replay attacks.
- [x] Real-time entitlement synchronization with graceful cancellation at period end.
- [x] Full UI for plan selection, Razorpay modal checkout, and subscription management.

---

### 6. Production Deployment Readiness (Phase 17)
- [x] Multi-tier PM2 cluster configuration (`ecosystem.config.js`).
- [x] Hardened Nginx reverse proxy configuration with TLS and rate limiting (`nginx/studylm.conf`).
- [x] Containerized multi-stage Docker and Docker Compose definitions (`docker-compose.yml`).
- [x] Strict CORS origin lockdown via `ALLOWED_ORIGINS`.
- [x] GitHub Actions automated CI verification (`.github/workflows/ci.yml`).
- [x] Production disaster recovery runbook and MongoDB backup procedures (`docs/OPERATIONS.md`).
- [x] 100% test pass rate across all 14 project test suites (106/106 tests passed).

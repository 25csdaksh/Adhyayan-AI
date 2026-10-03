# StudyLM — Production Security Architecture & Audit Report

## 1. Security Architecture Summary

```text
Incoming HTTPS Request
         │
         ▼
Nginx Reverse Proxy (TLS 1.2/1.3, Rate Limiting, HTTP->HTTPS Redirect)
         │
         ▼
Helmet HTTP Headers (HSTS, NoSniff, XSS Protection, Frameguard)
         │
         ▼
CORS Lockdown (Strict Origin Whitelist via ALLOWED_ORIGINS)
         │
         ▼
Request Correlation ID (X-Request-Id)
         │
         ▼
NoSQL Sanitizer ($ & dot operator stripping)
         │
         ▼
JWT Authentication (256-bit Secret, Bcrypt Cost Factor 12)
         │
         ▼
Ownership & IDOR Scoping (userId & notebookId DB isolation)
         │
         ▼
SSRF Defense Layer (Hop-by-Hop DNS/IP & Cloud Metadata Filtering)
         │
         ▼
Server-Authoritative Entitlements & Cryptographic Billing Verification
```

---

## 2. Security Safeguards Matrix

| Area | Implementation | Status |
| :--- | :--- | :--- |
| **Authentication** | Bcrypt (cost factor 12) + Signed JWTs (`7d` expiry) | Active & Verified |
| **Data Isolation** | Strict `userId` and `notebookId` scoping on all queries | Active & Verified |
| **SSRF Defense** | Private IP, Link-Local, and Cloud Metadata (`169.254.169.254`) blocking | Active & Verified |
| **CORS** | Strict domain whitelisting, credentials support without wildcards | Active & Verified |
| **NoSQL Injection** | Recursive request body and query sanitizer | Active & Verified |
| **Rate Limiting** | Tiered rate limits (General, Auth, AI, Web Ingestion, Webhooks) | Active & Verified |
| **Secret Protection** | Zero secrets committed, strict `.gitignore` rules, fail-safe boot checks | Active & Verified |
| **Payment Security** | HMAC-SHA256 timing-safe cryptographic verification & webhook idempotency | Active & Verified |
| **AI Grounding** | Grounded citation mapping, zero-evidence refusal, source bounding | Active & Verified |

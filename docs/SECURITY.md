# StudyLM — Security & Threat Modeling Policy

This document outlines the security controls, SSRF protections, authorization model, sanitization routines, and threat mitigations implemented in **StudyLM (Adhyayan-AI)**.

---

## 1. Authentication & Authorization

- **JWT Authentication**: Tokens are signed using cryptographically secure algorithms and verified on every private endpoint.
- **Strict Owner Isolation**: Every query (`Notebook`, `Document`, `Chunk`, `ChatSession`, `StudyTool`, `WebSource`) filters by `ownerId: req.user._id`.
- **IDOR Protection**: Requests with valid MongoDB ObjectIds belonging to other users return `404 Not Found` or `403 Forbidden`.
- **ObjectId Validation**: Middleware rejects malformed identifier parameters with `400 Bad Request` before database queries execute.

---

## 2. Server-Side Request Forgery (SSRF) Defense

The web ingestion and web research pipelines enforce multi-layered SSRF validation (`backend/src/services/web/webSecurity.js`):

- **Protocol Restrictions**: Strictly permits `http:` and `https:`. Blocks `file://`, `ftp://`, `gopher://`, `javascript:`, and local schemes.
- **IP Range Filtering**:
  - `127.0.0.0/8` & `::1` (Loopback)
  - `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` (RFC 1918 Private)
  - `169.254.169.254` (Cloud Instance Metadata)
  - `100.64.0.0/10` (Carrier-Grade NAT)
  - `fc00::/7` (IPv6 Unique Local)
  - `fe80::/10` (IPv6 Link Local)
- **Pre-Flight DNS Resolution**: Resolves target hostnames against public DNS and verifies every resolved IP address before making network requests.
- **Redirect Revalidation**: Any HTTP redirect is intercepted and re-validated against the SSRF filter before being followed.
- **Response Size Limits**: Enforces a strict 10MB payload limit on fetched web documents.

---

## 3. Injection Prevention & Sanitization

- **NoSQL Operator Sanitizer (`noSqlSanitizer`)**: Recursively strips keys starting with `$` (e.g. `$where`, `$gt`, `$ne`, `$regex`) and keys containing `.` from `req.body`, `req.query`, and `req.params`.
- **Structured JSON Queries**: All database operations use Mongoose schemas and strict field mappings, preventing query injection.
- **XSS Protection**: React frontend safely escapes JSX content. Citations and markdown badges are parsed via deterministic tokenizers.

---

## 4. HTTP Headers & CORS Hardening

- **Helmet**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: no-referrer-when-downgrade`
  - Strict Content-Security-Policy (CSP) headers
- **Hardened CORS**:
  - Whitelists explicit production frontend domains.
  - Exposes only safe headers (`X-Request-Id`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`).
  - Blocks unknown origins in production.

---

## 5. File & Upload Security

- **MIME Type Validation**: Supports only `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`, and `text/markdown`.
- **Upload Size Bounds**: Hard limit of 25MB for document files and 10MB for JSON bodies.
- **Sanitized Filenames**: Strips path traversal characters (`../`, `..\\`) from filenames before processing.
- **Cloudinary Cleanup**: If document chunking or text extraction fails, uploaded Cloudinary assets are automatically removed.

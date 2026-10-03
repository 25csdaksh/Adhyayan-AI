# StudyLM — Payment Security & Cryptographic Verification

## 1. Security Principles
- **Zero Trust on Client Data:** Client requests cannot specify pricing, amounts, or valid subscription durations. All pricing is read directly from server-side immutable plan configurations.
- **Cryptographic Signatures:** Payments and webhooks are verified using HMAC-SHA256 digests computed using secrets stored only in server environment variables.
- **Timing Safe Comparisons:** Signatures are compared using `crypto.timingSafeEqual` to eliminate timing attack vectors.
- **Webhook Idempotency:** All incoming webhook events are indexed by unique `eventId` in the `BillingEvent` collection to prevent replay attacks and double processing.
- **Secret Isolation:** Payment gateway secrets and API keys are never exposed in frontend code, client responses, or logs.
- **PCI Compliance:** StudyLM never processes, captures, or stores raw credit card numbers, CVVs, or bank credentials. All payment processing occurs on PCI-DSS certified gateway modal interfaces.

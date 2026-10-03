# StudyLM — Production Billing & Subscription System

## 1. Overview
StudyLM provides an enterprise-grade, decoupled subscription and billing architecture. The platform supports server-authoritative checkout creation, cryptographic payment verification, idempotent webhook processing, automatic entitlement synchronization, and graceful cancellation workflows.

---

## 2. Billing Architecture & Flow

```text
User Selects Plan (Pro / Enterprise)
         │
         ▼
POST /api/billing/checkout
(Server validates requested plan, reads immutable price catalog, creates provider order)
         │
         ▼
Client Receives Checkout Payload (orderId, amount, currency, keyId)
         │
         ▼
User Completes Payment on Gateway (Razorpay / Test Simulator)
         │
         ├──► POST /api/billing/verify (Instant Client Confirmation via HMAC-SHA256)
         │           │
         │           ▼
         │    Subscription Activated (30-day period)
         │           │
         │           ▼
         │    User.plan Synchronized to 'pro' / 'enterprise'
         │
         └──► POST /api/billing/webhook (Gateway Event — Primary Source of Truth)
                     │
                     ▼
              Cryptographic Signature Verification
                     │
                     ▼
              BillingEvent Idempotency Check (Deduplication)
                     │
                     ▼
              Subscription & Payment Records Synchronized
                     │
                     ▼
              User Entitlements & Quotas Updated
```

---

## 3. Subscription State Machine

| State | Description | Effective User Plan |
| :--- | :--- | :--- |
| `created` | Checkout initiated, order created, awaiting payment. | `free` |
| `active` | Payment captured, valid billing period active. | `pro` / `enterprise` |
| `canceled` (with grace period) | User requested cancellation; remains active until `currentPeriodEnd`. | `pro` / `enterprise` |
| `past_due` | Renewal attempt failed, grace retry window. | `pro` / `enterprise` (grace) |
| `paused` | Subscription paused by provider. | `free` |
| `expired` | Billing period ended after cancellation or non-payment. | `free` |

---

## 4. API Reference

### Public / Authenticated Endpoints
- `GET /api/billing/plans` — Returns centralized plan catalog.
- `POST /api/billing/webhook` — Unauthenticated, signature-verified webhook receiver.

### Protected User Endpoints (Requires JWT)
- `GET /api/billing/subscription` — Returns current subscription status, days remaining, renewal date.
- `GET /api/billing/payments` — Returns payment transaction history.
- `POST /api/billing/checkout` — Initializes checkout session (`{ plan: 'pro', billingCycle: 'monthly' }`).
- `POST /api/billing/verify` — Verifies payment completion (`{ orderId, paymentId, signature, planKey }`).
- `POST /api/billing/cancel` — Cancels active subscription (`{ cancelImmediately: false }`).
- `POST /api/billing/resume` — Resumes subscription scheduled to cancel at period end.

---

## 5. Idempotent Webhook Handling
Every incoming webhook is verified with the provider's HMAC-SHA256 signature against the raw request body. The event is tracked in MongoDB collection `BillingEvent` with a unique constraint on `eventId`. Duplicate deliveries return `{ received: true, idempotent: true }` without repeating database operations.

# StudyLM — Plan Quotas & Usage Entitlements

## 1. Overview
StudyLM features a centralized entitlement and usage tracking engine (`backend/src/services/usage/entitlementService.js`).
Quotas and feature-gates are managed without external billing vendor dependencies.

---

## 2. Plan Tier Matrix

| Feature / Resource | Free Starter Plan | Pro Researcher Plan | Enterprise Academic |
|---|---|---|---|
| **Max Notebooks** | 15 workspaces | 100 workspaces | 1,000 workspaces |
| **Max Sources per Notebook** | 30 sources | 200 sources | 1,000 sources |
| **Max File Upload Size** | 25 MB / file | 100 MB / file | 250 MB / file |
| **Monthly AI RAG Requests** | 300 requests | 3,000 requests | 25,000 requests |
| **Monthly Research Sessions** | 30 sessions | 500 sessions | 5,000 sessions |
| **Monthly Study Tools** | 60 generations | 1,000 generations | 10,000 generations |
| **Multi-Format Ingestion** | PDF, DOCX, TXT, Web | PDF, DOCX, TXT, Web | PDF, DOCX, TXT, Web |
| **Citation Deep Links** | Yes | Yes | Yes |
| **Research Memory** | Yes | Yes | Yes |
| **Priority Processing** | Standard | High Priority | Dedicated Queue |
| **Team Collaboration** | Individual | Individual | Multi-Seat |

---

## 3. Usage Tracking & Safe Aggregations
Usage metrics are tracked in MongoDB using the `UsageRecord` collection:
- **Zero Secret Leakage**: Raw API keys, passwords, or full user prompts are never recorded in usage metrics.
- **Aggregated Dimensions**: Daily and monthly counters for AI requests, embedding operations, research sessions, and approximate token volumes.
- **User Dashboard**: Users can inspect their current quota consumption in the Account Settings tab.

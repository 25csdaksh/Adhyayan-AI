# StudyLM — Plan Catalog & Feature Entitlements

## 1. Plan Comparison Matrix

| Feature / Limit | Free Starter | Pro Researcher | Enterprise Academic |
| :--- | :--- | :--- | :--- |
| **Price** | ₹0 / forever | ₹999 / month | ₹4,999 / month |
| **Notebooks** | 15 | 100 | 1,000 |
| **Sources / Notebook** | 30 | 200 | 1,000 |
| **Max File Upload** | 25 MB | 100 MB | 250 MB |
| **Monthly AI Chat RAG** | 300 requests | 3,000 requests | 25,000 requests |
| **Deep Research Sessions** | 30 / month | 500 / month | 5,000 / month |
| **Study Tools Generated** | 60 / month | 1,000 / month | 10,000 / month |
| **Web Ingestion & URLs** | Included | Included | Included |
| **Citation Previews** | Included | Included | Included |
| **Personal Memory** | Included | Included | Included |
| **Priority Queue** | No | Yes | Dedicated SLA |
| **Data Export (JSON)** | Yes | Yes | Yes |
| **Team Workspaces** | No | No | Yes |

---

## 2. Server-Side Quota Enforcement
When a user reaches a plan limit, backend endpoints reject requests with HTTP `429 Too Many Requests` or `403 Forbidden` and return standard machine-readable JSON payloads:

```json
{
  "error": "PLAN_LIMIT_REACHED",
  "message": "You have reached your notebook limit of 15 on the Free Starter plan. Upgrade to Pro for increased capacity.",
  "metric": "notebooks",
  "currentUsage": 15,
  "limit": 15,
  "plan": "free",
  "upgradeAvailable": true
}
```

# StudyLM — Operations, Observability & Disaster Recovery Manual

This manual provides runbooks, log querying guidelines, troubleshooting steps, and disaster recovery procedures for **StudyLM (Adhyayan-AI)**.

---

## 1. Observability & Logging Architecture

### Request Correlation
Every incoming HTTP request receives a unique `X-Request-Id` (propagated from upstream proxies or generated cryptographically). All log entries and error responses include this correlation ID for distributed tracing.

### Structured JSON Logs
Application logs are formatted as structured JSON:
```json
{
  "level": "INFO",
  "timestamp": "2026-10-03T10:15:30.123Z",
  "message": "HTTP POST /api/notebooks/651234/chats/655678/messages completed with status 200",
  "requestId": "req_1727951234_abc123",
  "method": "POST",
  "path": "/api/notebooks/651234/chats/655678/messages",
  "statusCode": 200,
  "durationMs": 1420,
  "userId": "651111222233334444555566"
}
```

### Sensitive Data Redaction
The structured logger (`backend/src/utils/logger.js`) automatically masks:
- Passwords & password hashes
- JWT tokens & authorization headers
- Gemini API keys
- Cloudinary secret credentials
- Raw document content payloads

---

## 2. Common Operational Runbooks

### Runbook 1: Gemini AI Quota Exhaustion (HTTP 429)
**Symptom**: Logs display `RATE_LIMIT_EXCEEDED` or Gemini API responds with `RESOURCE_EXHAUSTED`.
**Resolution**:
1. Check `observabilityService` metric `ai.deduped_requests` and `ai.concurrent_active`.
2. Increase `MAX_CONCURRENT_AI_REQUESTS` in `.env` or adjust rate limits.
3. Review user usage patterns in MongoDB `chats` collection.
4. Scale Gemini API quota in Google Cloud Console.

### Runbook 2: Stuck Document Processing Jobs
**Symptom**: Document remains in `status: "processing"` for > 15 minutes.
**Resolution**:
1. Verify `staleJobRecoveryService` is running (logs indicate periodic recovery scans).
2. Manually trigger stale job recovery via administrative script or wait for the 10-minute sweep to transition the document to `failed`.
3. Instruct user to re-upload or click "Retry Processing" in the StudyLM UI.

### Runbook 3: MongoDB Vector Search Latency Spike
**Symptom**: Chat queries take > 10s to retrieve initial chunks.
**Resolution**:
1. Verify MongoDB Atlas Vector Search index definition:
   ```json
   {
     "fields": [
       {
         "type": "vector",
         "path": "embedding",
         "numDimensions": 768,
         "similarity": "cosine"
       },
       {
         "type": "filter",
         "path": "notebookId"
       },
       {
         "type": "filter",
         "path": "ownerId"
       }
     ]
   }
   ```
2. Check MongoDB CPU and RAM utilization on Atlas Dashboard.

---

## 3. Disaster Recovery & Backup Strategy

### MongoDB Atlas Backups
- **Continuous Backups**: Enable Point-In-Time Restore (PITR) in MongoDB Atlas with a 7-day retention window.
- **Daily Snapshots**: Automated daily cluster snapshots retained for 30 days.

### Cloudinary Asset Recovery
- Enable Cloudinary versioning and automatic backup to an isolated AWS S3 bucket.
- Original raw files can be reconstructed from chunk records if necessary.

### Database Restoration Checklist
1. Deploy new MongoDB cluster in the primary region.
2. Restore latest snapshot from MongoDB Atlas backup portal.
3. Verify collection indexes and rebuild Atlas Vector Search index on `chunks` collection:
   `node scripts/syncVectorIndexes.js`
4. Update `MONGO_URI` in production environment configuration.
5. Perform health check probe: `GET /api/health/ready`.

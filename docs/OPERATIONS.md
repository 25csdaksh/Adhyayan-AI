# StudyLM — Production Operations & Recovery Runbook

## 1. Process Management & Scaling (PM2)

### Start Service in Cluster Mode
```bash
pm2 start ecosystem.config.js --env production
```

### Zero-Downtime Reload
```bash
pm2 reload studylm-backend --update-env
```

### Monitoring & Logs
```bash
pm2 status
pm2 logs studylm-backend --lines 100
```

---

## 2. Containerized Deployment (Docker)

### Build and Launch Multi-Container Stack
```bash
docker-compose up -d --build
```

### Health & Logs Inspection
```bash
docker-compose ps
docker-compose logs -f backend
```

---

## 3. MongoDB Atlas Backup & Disaster Recovery Runbook

### Continuous Backup Architecture
- **Point-in-Time Restore (PITR):** Configured on MongoDB Atlas with 7-day continuous oplog retention.
- **Snapshot Policy:** Daily automated snapshots with 30-day retention and geo-redundant storage.

### Recovery Procedure
1. Navigate to **MongoDB Atlas Console** ➔ **Clusters** ➔ **Backup**.
2. Select **Restore Snapshot** or **Point-in-Time Restore**.
3. Choose the target timestamp immediately prior to the incident.
4. Verify cluster connectivity and Vector Search index synchronization:
   ```bash
   node -e "require('./backend/src/config/db')().then(() => console.log('DB Connected'))"
   ```
5. Run backend health probe:
   ```bash
   curl -i https://api.studylm.ai/api/health/ready
   ```

---

## 4. Incident Response & Troubleshooting

| Symptom | Cause | Action |
| :--- | :--- | :--- |
| `503 Service Unavailable` on `/api/health/ready` | MongoDB connection dropped | Check MongoDB Atlas IP access list & connection string. |
| `429 Too Many Requests` on AI endpoints | User monthly quota exceeded | User reached plan limit; prompt upgrade or adjust limits. |
| Webhook verification failure (`400`) | Mismatched secret or payload tampering | Verify `RAZORPAY_WEBHOOK_SECRET` against gateway dashboard. |
| CORS failure on browser | Origin not in `ALLOWED_ORIGINS` | Add frontend domain to `ALLOWED_ORIGINS` in production `.env`. |

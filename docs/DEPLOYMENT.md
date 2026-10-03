# StudyLM — Production Deployment Guide

## 1. Production Architecture Overview
StudyLM is deployed as a modern decoupled web application:
- **Frontend**: Vite React SPA hosted via static web server or CDN (Cloudflare / Vercel / Nginx).
- **Backend**: Express.js REST API with Google Gemini and Cloudinary integrations.
- **Database**: MongoDB Atlas with Atlas Vector Search for 768-dimensional embeddings.

---

## 2. Environment Variables Specification

### Backend Configuration (`backend/.env`)
```bash
# Server & Runtime
PORT=5000
NODE_ENV=production
CLIENT_URL=https://app.studylm.ai

# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/studylm?retryWrites=true&w=majority

# Authentication
JWT_SECRET=<secure-random-256-bit-key>
JWT_EXPIRES_IN=7d

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=<cloudinary_cloud_name>
CLOUDINARY_API_KEY=<cloudinary_api_key>
CLOUDINARY_API_SECRET=<cloudinary_api_secret>
MAX_FILE_SIZE_MB=25

# Google Gemini AI
GEMINI_API_KEY=<google_gemini_api_key>
GEMINI_EMBEDDING_MODEL=text-embedding-004
GEMINI_CHAT_MODEL=gemini-1.5-flash
EMBEDDING_DIMENSIONS=768
ENABLE_PSEUDO_EMBEDDING_FALLBACK=false

# Plan Quotas & Limits
LIMIT_FREE_NOTEBOOKS=15
LIMIT_FREE_SOURCES_PER_NOTEBOOK=30
LIMIT_FREE_MONTHLY_AI=300
LIMIT_FREE_MONTHLY_RESEARCH=30
LIMIT_FREE_MONTHLY_STUDY_TOOLS=60

# Subscription & Billing Configuration
PAYMENT_PROVIDER=razorpay
PAYMENT_CURRENCY=INR
RAZORPAY_KEY_ID=<your_razorpay_key_id>
RAZORPAY_KEY_SECRET=<your_razorpay_key_secret>
RAZORPAY_WEBHOOK_SECRET=<your_razorpay_webhook_secret>
PRO_PLAN_PRICE_INR=999
ENTERPRISE_PLAN_PRICE_INR=4999
```

### Frontend Configuration (`frontend/.env.production`)
```bash
VITE_API_URL=https://api.studylm.ai/api
```

---

## 3. Deployment Steps

### Step 1: Database Setup
1. Create MongoDB Atlas cluster (M10+ recommended for production).
2. Configure Vector Search Index on `chunks` collection:
```json
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "embedding": {
        "dimensions": 768,
        "similarity": "cosine",
        "type": "knnVector"
      },
      "notebookId": {
        "type": "filter"
      },
      "sourceType": {
        "type": "filter"
      }
    }
  }
}
```

### Step 2: Backend Build & Start
```bash
cd backend
npm ci --only=production
node src/server.js
```

### Step 3: Frontend Build
```bash
cd frontend
npm ci
npm run build
# Deploy 'dist/' folder to CDN / Nginx web root
```

---

## 4. Health & Smoke Testing
1. **Liveness Check**: `curl -f https://api.studylm.ai/api/health`
2. **Readiness Check**: `curl -f https://api.studylm.ai/api/health/ready`
3. Verify TLS/HTTPS certificate and CORS origin restrictions.

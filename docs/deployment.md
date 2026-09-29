# DermaScan AI — Deployment Guide

## Production Topology
- **Frontend:** Static React build hosted via CDN / Vercel / Cloud Run.
- **Backend:** Python 3.10+ / 3.11+ FastAPI container on Cloud Run / AWS ECS / Bare Metal Linux with AVX2 or CUDA acceleration for TensorFlow inference.
- **Database:** Managed PostgreSQL instance (e.g. Google Cloud SQL, AWS RDS).
- **Blob Storage:** Persistent volume or S3/GCS bucket for uploaded dermatoscopic images.

## Environment Configuration
```env
DATABASE_URL=postgresql://user:password@host:5432/dermascan_db
SECRET_KEY=long-random-entropy-key
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=https://dermascan.yourdomain.com
MODEL_PATH=/app/ml/models/effnetv2-b0-v1.keras
UPLOAD_DIR=/app/uploads
MAX_UPLOAD_SIZE_MB=10
```

## Running Full-Stack Dev Server
```bash
# In project root:
npm install
npm run dev
# Starts integrated server on port 3000
```

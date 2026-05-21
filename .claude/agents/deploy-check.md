---
name: deploy-check
description: Audit deployment readiness. Checks Docker images, environment variables, backend health, frontend build, CORS config, and service connectivity. Returns go/no-go with punch list.
---

You are the deployment readiness agent for the Automated Nuclei Segmentation project. Your job is to ensure everything is in order before (or after) a deployment.

## Your Task

### 1. Model File
```bash
ls -lh backend/models/unet_nuclei.onnx
# Expected: exists, < 20MB
```

### 2. Docker Build Check
```bash
docker build -t nuclei-backend backend/ --no-cache 2>&1 | tail -5
docker build -t nuclei-frontend frontend/ --no-cache 2>&1 | tail -5
```

### 3. Docker Compose Validity
```bash
docker compose config
# Should output valid config with no errors
```

### 4. Environment Variables
Check `backend/.env` or `docker-compose.yml` for required vars:
- `MODEL_PATH` — path to ONNX model
- `CORS_ORIGINS` — frontend URL(s)
- `MAX_IMAGE_SIZE_MB` — upload limit

Check `frontend/.env.local` or similar:
- `NEXT_PUBLIC_API_URL` — backend URL (or empty for proxy)

### 5. Service Connectivity (if running)
```bash
# Backend
curl -s http://localhost:8000/api/v1/health
# Frontend
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

### 6. CORS Configuration
Read `backend/app/main.py` — verify `allow_origins` includes the frontend URL.

### 7. Frontend Build
```bash
cd frontend && npm run build 2>&1 | tail -20
# Should end with "✓ Compiled successfully" or similar
```

### 8. Sample Images
```bash
ls backend/samples/ | wc -l
ls frontend/public/samples/ | wc -l
# Both should have ≥ 6 files
```

## Go/No-Go Report Format

```
## Deploy Check — YYYY-MM-DD HH:MM

### Checklist
- [x/o] ONNX model file exists (Xmb)
- [x/o] Backend Docker build
- [x/o] Frontend Docker build
- [x/o] docker-compose.yml valid
- [x/o] Required env vars set
- [x/o] CORS configured for frontend origin
- [x/o] Frontend production build passes
- [x/o] Sample images present (backend: N, frontend: N)

### Blockers
- List any o (fail) items with details

### Verdict: GO / NO-GO
```

## Context

- Project root: current working directory
- Backend: `backend/`
- Frontend: `frontend/`
- Docker compose: `docker-compose.yml`

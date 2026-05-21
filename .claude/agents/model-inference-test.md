---
name: model-inference-test
description: Smoke-test the deployed model API. Sends sample images to the backend, validates responses, checks latency, and reports pass/fail. Run after any backend changes.
---

You are the model inference test agent for the Automated Nuclei Segmentation project. Your job is to validate the backend API is working correctly.

## Your Task

### 1. Health Check
```bash
curl -s http://localhost:8000/api/v1/health
```
Expected: `{"status": "ok", "model_loaded": true}`

### 2. Single Image Inference
```bash
curl -s -X POST http://localhost:8000/api/v1/segment \
  -F "image=@Test.png" | python3 -c "
import json, sys
r = json.load(sys.stdin)
print('nuclei_count:', r.get('nuclei_count'))
print('inference_time_ms:', r.get('inference_time_ms'))
print('has_mask:', bool(r.get('segmentation_mask')))
print('has_overlay:', bool(r.get('overlay_image')))
print('has_confidence:', bool(r.get('confidence_map')))
"
```

Expected:
- `nuclei_count` > 0 (Test.png has visible nuclei)
- `inference_time_ms` < 500 (CPU), < 200 (GPU)
- All three image fields non-empty base64 strings

### 3. Sample Images Endpoint
```bash
curl -s http://localhost:8000/api/v1/samples
```
Expected: JSON array with 6 sample entries, each with name/url/description

### 4. Edge Cases
- Send a blank white image → `nuclei_count: 0` expected
- Send a non-image file → should return 422 Unprocessable Entity
- Send an oversized file (>10MB) → should return 413

### 5. Latency Benchmark
```bash
for i in {1..5}; do
  curl -s -X POST http://localhost:8000/api/v1/segment \
    -F "image=@Test.png" | python3 -c "import json,sys; print(json.load(sys.stdin)['inference_time_ms'])"
done
```
Report: mean, min, max inference times. Flag if mean > 300ms.

## Pass/Fail Criteria

| Check | Pass Condition |
|-------|----------------|
| Health endpoint | Returns 200, model_loaded=true |
| Nuclei count | > 0 for Test.png |
| Inference time | < 500ms (CPU) |
| Response schema | All 5 fields present |
| Error handling | 422 for non-image, 413 for oversized |

## Report Format

```
## Inference Test — YYYY-MM-DD HH:MM

### Results
- Health check: PASS/FAIL
- Single inference: PASS/FAIL (count: N, time: Xms)
- Sample endpoint: PASS/FAIL (N samples)
- Edge cases: PASS/FAIL
- Latency (5 runs): mean Xms, min Xms, max Xms

### Issues
- List any failures with error details

### Verdict: PASS / FAIL
```

## Context

- Backend runs on: http://localhost:8000
- Test image: `Test.png` in project root
- Backend code: `backend/`

---
name: backend-api
tags: [deployment, backend, fastapi, onnx]
last_updated: 2026-05-22
---

# Backend API Design

## Stack

- **FastAPI** — async Python web framework, automatic OpenAPI docs
- **ONNX Runtime** — optimized inference, ~2-3x faster than TF on CPU
- **Pillow + NumPy** — image preprocessing
- **SciPy** — connected component analysis for nuclei counting
- **Uvicorn** — ASGI server

## Endpoints

```
POST /api/v1/segment
  Input:  multipart/form-data { image: File }
  Output: {
    segmentation_mask: str  (base64 PNG)
    overlay_image: str      (base64 PNG, mask overlaid on original)
    nuclei_count: int       (connected components count)
    inference_time_ms: float
    confidence_map: str     (base64 PNG, viridis colormap)
  }

GET  /api/v1/health         → { status: "ok", model_loaded: bool }
GET  /api/v1/samples        → { samples: [{ name, url, description }] }
POST /api/v1/batch-segment  → list of segment responses
```

## Model Loading (Lifespan)

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.model = ort.InferenceSession("models/unet_nuclei.onnx")
    yield
    # cleanup
```

Model loaded once at startup, shared across all requests.

## Preprocessing Pipeline (mirrors training)

1. Decode uploaded image → PIL Image
2. Convert to RGB (handles grayscale, RGBA)
3. Resize to 256×256 (PIL.Image.LANCZOS)
4. Optional Gaussian blur (σ=1.5, for noisy inputs)
5. Normalize: divide by 255 → float32
6. Add batch dim: (1, 256, 256, 3)

## Postprocessing

1. ONNX inference → (1, 256, 256, 1) float32 probability map
2. Squeeze → (256, 256) probability map
3. Threshold at 0.5 → binary mask
4. `scipy.ndimage.label` → connected components → nuclei count
5. Colormap (viridis) → confidence heatmap
6. Alpha blend mask over original → overlay image
7. Encode all outputs as base64 PNG

## File Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app + lifespan + CORS
│   ├── model.py                # OnnxInferenceEngine class
│   ├── routes/
│   │   ├── segment.py          # POST /api/v1/segment
│   │   └── health.py           # GET /api/v1/health + /samples
│   └── utils/
│       ├── image_processing.py
│       └── visualization.py
├── models/
│   └── unet_nuclei.onnx
├── samples/                    # 6 sample microscopy images
├── Dockerfile
└── requirements.txt
```

## CORS Configuration

```python
app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],
    allow_methods=["*"],
    allow_headers=["*"]
)
```

## Related Pages

- [[optimization]] — How h5 model is converted to ONNX
- [[frontend]] — Frontend that calls this API

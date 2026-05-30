# Automated Nuclei Segmentation

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.10-FF6F00?logo=tensorflow&logoColor=white)](https://tensorflow.org)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![CI](https://github.com/ToniBirat7/Nuclei_Segmentation_U-Net_VGG_x_RFC/actions/workflows/ci.yml/badge.svg)](https://github.com/ToniBirat7/Nuclei_Segmentation_U-Net_VGG_x_RFC/actions/workflows/ci.yml)
[![DOI](https://img.shields.io/badge/DOI-10.3126%2Finjet.v2i2.78595-blue)](https://doi.org/10.3126/injet.v2i2.78595)

U-Net deep learning model for automated nuclei detection in microscopy images — published at **KEC Conference 2025 / InJET Special Issue**. Upload a microscopy image and get instant segmentation masks, confidence heatmaps, and nuclei counts.

> **97.5% accuracy · 0.88 IoU · ~99ms inference · 1.94M parameters**

---

## Results

| Model | Accuracy | Precision | Recall | IoU |
|---|---|---|---|---|
| DeepLabV3+ | 91.2% | 88.7% | 89.1% | 80.5 |
| DeepResNet | 94.6% | 88.6% | 81.7% | 85.3 |
| **Proposed U-Net** | **97.5%** | **94.5%** | **95.1%** | **88.2** |

Robustness across dataset splits (IoU): 0.88 (670/10/60) · 0.85 (592/74/74) · 0.83 (518/148/74)

---

## Quick Start

### Local Development

**Backend** (Python 3.11+, [uv](https://docs.astral.sh/uv/) required):
```bash
cd backend
uv venv && uv pip install -e .
uv run uvicorn app.main:app --reload
# API docs: http://localhost:8000/docs
```

**Frontend** (Node 22+):
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:3000
```

> **Note:** The backend requires `backend/models/unet_nuclei.onnx`. Convert the Keras model first:
> ```bash
> pip install tf2onnx tensorflow==2.10.1
> python scripts/convert_model.py
> ```

### Docker (one command)

```bash
docker compose up
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
```

---

## Architecture

The backend serves a **U-Net** trained on the [2018 Data Science Bowl](https://www.kaggle.com/competitions/data-science-bowl-2018/data) nuclei dataset, converted to ONNX for fast CPU inference.

```
Encoder (contracting)          Decoder (expanding)
256×256×16  ──────────────────────────── 256×256×16
     ↓ pool              skip                ↑ up
128×128×32  ──────────────────────────── 128×128×32
     ↓ pool              skip                ↑ up
 64×64×64   ──────────────────────────────  64×64×64
     ↓ pool              skip                ↑ up
 32×32×128  ──────────────────────────────  32×32×128
     ↓ pool              skip                ↑ up
         16×16×256 (bottleneck)
                    ↓
              256×256×1 sigmoid output → threshold 0.5 → binary mask
```

**Preprocessing pipeline:** Resize → 256×256 · Gaussian filter σ=1.5 · Normalize ÷ 255  
**Explainability:** Grad-CAM + LRP (mean relevance 0.45, confidence score 0.902)

---

## API Reference

### `POST /api/v1/segment`

Upload a microscopy image, receive segmentation outputs.

```bash
curl -F "image=@sample.png" http://localhost:8000/api/v1/segment
```

Response:
```json
{
  "segmentation_mask": "<base64 PNG>",
  "overlay_image":     "<base64 PNG>",
  "confidence_map":    "<base64 PNG>",
  "nuclei_count":      42,
  "inference_time_ms": 85.3
}
```

### `GET /api/v1/health`

```json
{ "status": "ok", "model_loaded": true }
```

### `GET /api/v1/samples`

```json
{ "samples": [{ "name": "sample_01.png", "url": "/samples/sample_01.png", "description": "..." }] }
```

Interactive docs available at `http://localhost:8000/docs` (Swagger UI).

---

## Project Structure

```
├── backend/              # FastAPI + ONNX Runtime server
│   ├── app/
│   │   ├── main.py       # FastAPI app, CORS, lifespan model loading
│   │   ├── model.py      # OnnxInferenceEngine class
│   │   ├── routes/       # segment.py, health.py
│   │   └── utils/        # image_processing.py, visualization.py
│   ├── models/           # unet_nuclei.onnx (after conversion)
│   ├── samples/          # 6 sample microscopy images
│   └── tests/            # pytest test suite
├── frontend/             # Next.js 16 + Tailwind CSS app
│   ├── app/              # App Router pages + API routes
│   ├── components/       # UploadZone, ResultsPanel, MetricsDisplay, …
│   └── lib/api.ts        # Backend API client
├── scripts/
│   └── convert_model.py  # Keras h5 → ONNX converter
├── docs/
│   ├── papers/           # Published paper + LIME reference
│   ├── notebooks/        # training.ipynb
│   └── eval-images/      # Grad-CAM + LRP visualizations
├── .wiki-nuclei-unet/    # LLM wiki — 15 pages of project knowledge
└── docker-compose.yml
```

---

## Dataset

**2018 Kaggle Data Science Bowl** — 740 microscopy images with instance segmentation masks.
- 670 train / 10 val / 60 test (stratified across imaging modalities)
- Mean nuclei per image: 71 ± 9
- ~27% of images have significant nuclear overlap
- Images sized 256×256 to 1024×1024; all resized to 256×256

[Dataset on Kaggle →](https://www.kaggle.com/competitions/data-science-bowl-2018/data)

---

## Running Tests

```bash
cd backend
uv run pytest tests/ -v
```

Tests cover: health endpoint, segmentation response schema, invalid file rejection, samples listing, batch inference. Tests that require the ONNX model are automatically skipped when the model file is absent.

---

## Cite This Work

```bibtex
@article{gautam2025nuclei,
  title   = {Automated Nuclei Segmentation in Microscopy Images},
  author  = {Gautam, Birat and Gautam, Prakash},
  journal = {InJET Special Issue, KEC Conference 2025},
  year    = {2025},
  doi     = {10.3126/injet.v2i2.78595},
  url     = {https://doi.org/10.3126/injet.v2i2.78595}
}
```

---

## Authors

**Birat Gautam** · **Prakash Gautam**  
Sunway College Kathmandu · KEC Conference 2025

---

*Built with FastAPI · ONNX Runtime · Next.js 16 · Tailwind CSS · Framer Motion*

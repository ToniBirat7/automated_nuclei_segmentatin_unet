# Wiki Log

Append-only chronological record of wiki operations.

Parse recent entries: `grep "^## \[" log.md | tail -10`

---

## [2026-05-22] ingest | Research Paper — Automated Nuclei Detection in Microscopy Images
- Source: `automated_nuclei_segmentation_in_microscopy_images.pdf` (KEC 2025, InJET)
- Pages created: `sources/research-paper.md`, `entities/unet-architecture.md`, `entities/dataset.md`, `entities/model-performance.md`, `entities/explainability.md`, `entities/vgg16-rfc-baseline.md`, `concepts/nuclei-segmentation.md`, `concepts/iou-metric.md`, `concepts/grad-cam.md`, `concepts/lrp.md`, `concepts/data-augmentation.md`
- Key findings: U-Net achieves 97.5% accuracy, 0.88 IoU, outperforms DeepLabV3+ and DeepResNet

## [2026-05-22] ingest | Training Notebook — training.ipynb
- Source: `training.ipynb` (74 cells, full implementation)
- Pages created: `sources/training-notebook.md`
- Pages updated: `entities/unet-architecture.md`, `entities/dataset.md`
- Key findings: ~1.94M trainable parameters, Adam optimizer lr=0.001, 50 epochs, RTX 3060 ~2.5h training

## [2026-05-22] project | Deployment planning initiated
- Created: `deployment/backend-api.md`, `deployment/frontend.md`, `deployment/optimization.md`
- Stack decided: FastAPI + ONNX Runtime (backend), Next.js 14 + Tailwind (frontend)
- Model conversion: h5 → ONNX via tf2onnx

## [2026-05-22] init | Wiki initialized
- Created wiki structure with 15 pages across 4 categories
- Schema documented in project CLAUDE.md

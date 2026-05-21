# Nuclei Segmentation Wiki — Index

> Catalog of all wiki pages. Updated on every ingest. Read this first when answering queries.

## Overview
- [Overview](overview.md) — Project thesis, current state, deployment status

## Entities
- [U-Net Architecture](entities/unet-architecture.md) — Encoder-decoder, 1.94M params, skip connections
- [Dataset](entities/dataset.md) — 2018 Data Science Bowl, 740 images, preprocessing pipeline
- [Model Performance](entities/model-performance.md) — 97.5% accuracy, 0.88 IoU, SOTA comparison
- [VGG16 + RFC Baseline](entities/vgg16-rfc-baseline.md) — Alternative approach, feature extraction + Random Forest
- [Explainability](entities/explainability.md) — Grad-CAM + LRP analysis, 0.902 confidence score

## Concepts
- [Nuclei Segmentation](concepts/nuclei-segmentation.md) — Problem domain, clinical relevance, challenges
- [IoU Metric](concepts/iou-metric.md) — Intersection over Union, threshold at 0.5
- [Grad-CAM](concepts/grad-cam.md) — Gradient-weighted Class Activation Mapping in U-Net
- [LRP](concepts/lrp.md) — Layer-wise Relevance Propagation, pixel-wise attribution
- [Data Augmentation](concepts/data-augmentation.md) — Rotation, flips, brightness, Gaussian filtering

## Sources
- [Research Paper](sources/research-paper.md) — KEC 2025 / InJET published paper summary
- [Training Notebook](sources/training-notebook.md) — training.ipynb implementation details

## Deployment
- [Backend API](deployment/backend-api.md) — FastAPI + ONNX Runtime design
- [Frontend](deployment/frontend.md) — Next.js 14 app design and components
- [Optimization](deployment/optimization.md) — h5 → ONNX conversion, quantization

---
*Last updated: 2026-05-22 | Pages: 15 | Sources ingested: 2*

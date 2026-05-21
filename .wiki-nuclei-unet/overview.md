---
name: overview
tags: [project, overview, deployment]
last_updated: 2026-05-22
---

# Project Overview — Automated Nuclei Segmentation

## Thesis

A U-Net convolutional neural network trained on the 2018 Data Science Bowl dataset achieves state-of-the-art automated nuclei segmentation in microscopy images, with 97.5% accuracy and 0.88 IoU, suitable for clinical diagnostics and drug discovery pipelines in resource-constrained environments.

## What This Project Is

Published research (KEC Conference 2025, InJET Special Issue) by Birat Gautam and Prakash Gautam, Sunway College Kathmandu. The system automatically delineates cell nuclei in microscopy images — a foundational step in biomedical image analysis that enables cell counting, morphology analysis, and disease diagnosis.

**Key claim:** U-Net outperforms DeepLabV3+ (80.5% IoU) and DeepResNet (85.3% IoU) on the same dataset, while remaining computationally feasible for resource-constrained settings like Nepal.

## Current State

| Layer | Status |
|-------|--------|
| Research | ✅ Published (KEC 2025) |
| Model | ✅ Trained (`final_unet_model.h5`, 23.5MB) |
| Backend API | 🔄 In progress (FastAPI + ONNX) |
| Frontend | 🔄 In progress (Next.js 14) |
| Deployment | 🔄 Planned (Docker compose) |

## Core Numbers

- **Accuracy:** 97.5% (vs 91.2% DeepLabV3+, 94.6% DeepResNet)
- **IoU:** 0.88 (stable across dataset splits 0.83–0.88)
- **Parameters:** 1.94M trainable
- **Inference:** ~99.37ms on RTX 3060
- **Model size:** 23.5MB (.h5), ~6MB target (ONNX quantized)

## The Problem

Manual nuclei annotation by pathologists is:
- Time-consuming (hours per slide)
- Subjective (inter-observer variability)
- Bottleneck for high-throughput screening

This system eliminates the bottleneck while providing interpretable results via Grad-CAM and LRP explainability.

## Related Pages

- [[unet-architecture]] — Technical architecture details
- [[dataset]] — Training data, splits, preprocessing
- [[model-performance]] — Full performance analysis
- [[backend-api]] — Deployment architecture
- [[frontend]] — UI design

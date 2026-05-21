---
name: nuclei-segmentation
tags: [concept, biology, medical-imaging, segmentation]
last_updated: 2026-05-22
---

# Nuclei Segmentation

## Problem Statement

Identify and delineate the boundaries of cell nuclei in microscopy images. Produces a binary mask where 1 = nucleus, 0 = background.

## Why It Matters

Nuclear morphology and distribution reveal:
- **Cell health** — size, shape, density indicate normal vs abnormal
- **Division cycles** — mitotic figures in actively dividing cells
- **Therapeutic response** — drug compound effects on cellular morphology
- **Cancer grading** — quantitative nuclear changes in malignant cells (Pantanowitz et al., 2020)
- **Drug discovery** — high-throughput screening of compound effects (Sero et al., 2022)

## Challenges

1. **Overlapping nuclei** (~27% of images in DSB 2018) — adjacent nuclei share boundary pixels
2. **Variable image quality** — contrast range 0.4–0.9, brightness 0.2–0.8
3. **Size variability** — nuclei area 8–45 pixels, circularity 0.6–0.9
4. **Multiple imaging modalities** — brightfield, fluorescence, phase-contrast have different appearances
5. **Scale** — high-throughput imaging generates large volumes requiring automated analysis

## Evolution of Approaches

| Era | Approach | Limitation |
|-----|----------|------------|
| Classical | Intensity thresholding + watershed | Fails on varying contrast and overlap |
| Hybrid ML | SVM/Random Forest + feature engineering | Requires expert feature design |
| Deep Learning | U-Net (this project) | Requires GPU, training data |

## Resource-Constrained Context

This project explicitly targets applicability in Nepal, where medical imaging infrastructure is limited. The U-Net's ~99ms inference time and moderate model size (~23.5MB) make it deployable on accessible hardware.

## Related Pages

- [[unet-architecture]] — Solution architecture
- [[dataset]] — Training data characteristics
- [[model-performance]] — Solution performance

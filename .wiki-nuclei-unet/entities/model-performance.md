---
name: model-performance
tags: [performance, evaluation, metrics, sota]
last_updated: 2026-05-22
source_count: 2
---

# Model Performance

## Training Results (50 epochs)

| Metric | Training | Validation |
|--------|----------|------------|
| Accuracy | 97.10% | 97.05% |
| IoU | 0.8829 | 0.8826 |
| Loss | 0.0753 | 0.0717 |

The near-identical train/val metrics and lower validation loss confirm no overfitting. Model converged rapidly in first 10 epochs; stable thereafter.

## SOTA Comparison (60-image test set)

| Model | Accuracy | Precision | Recall | IoU |
|-------|----------|-----------|--------|-----|
| DeepLabV3+ | 91.2% | 88.7% | 89.1% | 80.5% |
| DeepResNet | 94.6% | 88.6% | 81.7% | 85.3% |
| **Proposed U-Net** | **97.5%** | **94.5%** | **95.1%** | **88.2%** |

U-Net exceeds DeepLabV3+ by +6.3% accuracy, +7.7% IoU. Outperforms DeepResNet by +2.9% accuracy, +2.9% IoU.

## Inference Performance

- **Mean inference time:** 99.37ms
- **Median inference time:** 98.27ms
- **Hardware:** NVIDIA RTX 3060 GPU
- **Distribution:** Normal, range 60–180ms (figure 8 in paper)

## Key Observations

- Model effectively handles ~27% of images with nuclei overlap (challenging boundary delineation)
- High confidence score on LRP analysis: 0.902 — decisions based on genuine nuclear features, not artifacts
- Grad-CAM confirms attention focuses on nuclear boundaries (red) vs background (blue)
- Visual inspection: correctly handles varying sizes, shapes, and densities

## Related Pages

- [[unet-architecture]] — Architecture that achieves these results
- [[iou-metric]] — How IoU is computed
- [[explainability]] — Grad-CAM and LRP validation of results
- [[dataset]] — Test set composition

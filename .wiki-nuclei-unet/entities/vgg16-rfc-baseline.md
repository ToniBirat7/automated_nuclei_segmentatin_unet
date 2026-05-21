---
name: vgg16-rfc-baseline
tags: [model, baseline, vgg16, random-forest]
last_updated: 2026-05-22
source_count: 1
---

# VGG16 + Random Forest Classifier Baseline

## Summary

Alternative two-step approach using pre-trained VGG16 for feature extraction followed by a Random Forest Classifier for pixel-level segmentation. Serves as a comparison baseline against the U-Net approach.

## Pipeline

### Step 1 — Feature Extraction (VGG16)
- Pre-trained VGG16 with ImageNet weights
- Features extracted from `block1_conv2` (early layer, preserves spatial detail)
- Input shape: 256×256×3
- Early layer chosen to retain fine-grained texture features critical for nucleus boundaries

### Step 2 — Classification (Random Forest)
- Hyperparameter tuning via **Optuna** (Bayesian optimization)
- Grid search parameters:
  - `n_estimators`: [10, 15]
  - `max_depth`: [10, 20]
  - `min_samples_split`: [2, 5]
  - `min_samples_leaf`: [1, 2]
- Interactive Plotly dashboard generated for hyperparameter analysis

## Comparison vs U-Net

| Aspect | VGG16 + RFC | U-Net |
|--------|-------------|-------|
| Architecture | Hybrid (pretrained + ML) | End-to-end deep learning |
| Training time | Faster | ~2.5h |
| Inference | Faster (simpler classifier) | ~99ms GPU |
| Accuracy | Lower | 97.5% |
| Generalization | Feature engineering dependent | Learned end-to-end |

## Why U-Net Won

The RFC requires careful feature selection and cannot learn global context. U-Net's skip connections allow simultaneous local texture + global context capture, critical for overlapping nuclei (~27% of images).

## Related Pages

- [[unet-architecture]] — The winning approach
- [[model-performance]] — Full comparison results

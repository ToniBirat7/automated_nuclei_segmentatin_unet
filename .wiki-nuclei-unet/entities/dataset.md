---
name: dataset
tags: [data, dataset, preprocessing]
last_updated: 2026-05-22
source_count: 2
---

# Dataset — 2018 Data Science Bowl

## Source

Kaggle 2018 Data Science Bowl nuclei segmentation competition dataset. Each image has a unique `imageId` folder containing `images/` and `masks/` subfolders. Masks are individual per-nucleus binary images, consolidated during preprocessing.

## Statistics

| Metric | Value |
|--------|-------|
| Total images | 740 |
| Training images | 670 (90%) |
| Validation images | 10 |
| Test images | 60 |
| Image size range | 256×256 to 1024×1024 pixels |
| Mean nuclei per image | 71 ± 9 |
| Nuclei area range | 8–45 pixels |
| Circularity indices | 0.6–0.9 |
| Normalized contrast range | 0.4–0.9 |
| Mean intensity range | 0.2–0.8 |
| Images with significant overlap | ~27% |

## Preprocessing Pipeline

1. **Resize** all images to 256×256 (standardizes variable input sizes)
2. **Mask consolidation** — combine individual per-nucleus masks into unified binary mask via pixel-wise max operation
3. **Normalize** pixel values (divide by 255, float32)
4. **Gaussian filtering** σ=1.5 — reduces noise while preserving edges
5. **Data augmentation** (training only):
   - Random rotations 0–360°
   - Horizontal + vertical flips
   - Brightness/contrast adjustments

## Dataset Split Robustness

IoU remains stable across different splits, confirming model generalizability:

| Split | Train | Val | Test | IoU |
|-------|-------|-----|------|-----|
| Original (used) | 670 | 10 | 60 | 0.88 |
| 80-10-10 | 592 | 74 | 74 | 0.85 |
| 70-20-10 | 518 | 148 | 74 | 0.83 |

## Local Path

```
Nuclei_Dataset/
├── stage1_train/   # 670 training image folders
└── stage1_test/    # 60 test image folders
```

## Related Pages

- [[unet-architecture]] — Model trained on this data
- [[data-augmentation]] — Augmentation details
- [[nuclei-segmentation]] — Why this dataset matters

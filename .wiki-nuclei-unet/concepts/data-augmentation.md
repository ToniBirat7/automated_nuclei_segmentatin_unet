---
name: data-augmentation
tags: [concept, training, preprocessing, augmentation]
last_updated: 2026-05-22
---

# Data Augmentation Strategy

## Rationale

740 total images is modest for deep learning. U-Net is data-efficient (Ronneberger et al. demonstrated results with 30 images), but augmentation further improves generalization across the diverse microscopy conditions in the dataset.

## Techniques Applied (Training Only)

| Technique | Parameters | Rationale |
|-----------|-----------|-----------|
| Random rotation | 0–360° | Nuclei have no preferred orientation |
| Horizontal flip | 50% probability | Mirror symmetry valid for cell images |
| Vertical flip | 50% probability | Same |
| Brightness adjustment | Controlled range | Handles imaging condition variation (contrast 0.4–0.9) |
| Contrast adjustment | Controlled range | Handles mean intensity variation (0.2–0.8) |
| Gaussian filtering | σ=1.5 | Applied to all images; reduces noise, preserves edges |

## Effect on Performance

Dataset split robustness testing shows marginal IoU degradation when training size decreases:
- 670 training images → 0.88 IoU
- 592 training images → 0.85 IoU
- 518 training images → 0.83 IoU

This stable degradation profile (vs sharp drop without augmentation) confirms augmentation effectiveness.

## Gaussian Filtering Note

σ=1.5 was carefully calibrated — too high blurs nucleus boundaries (critical for segmentation), too low retains noise that confuses the model. Applied as a preprocessing step, not augmentation.

## Related Pages

- [[dataset]] — Dataset characteristics that motivated these choices
- [[unet-architecture]] — Model trained with this augmented data

---
name: iou-metric
tags: [concept, metric, evaluation]
last_updated: 2026-05-22
---

# IoU Metric (Intersection over Union)

## Definition

Measures spatial overlap between predicted segmentation mask and ground truth:

```
IoU = (Intersection + ε) / (Union + ε)
    = (|predicted ∩ ground_truth| + 1e-7) / (|predicted| + |ground_truth| - |predicted ∩ ground_truth| + 1e-7)
```

ε = 1e-7 prevents division by zero.

## Implementation in This Project

```python
def iou_metric(y_true, y_pred):
    y_pred = tf.cast(y_pred > 0.5, tf.float32)  # threshold at 0.5
    intersection = tf.reduce_sum(y_true * y_pred)
    union = tf.reduce_sum(y_true) + tf.reduce_sum(y_pred) - intersection
    iou = (intersection + 1e-7) / (union + 1e-7)
    return iou
```

## Why IoU Over Accuracy

Pixel accuracy is misleading for segmentation when background heavily outnumbers foreground (nuclei are small objects). IoU penalizes both false positives and false negatives equally, capturing true boundary delineation quality.

## Threshold Choice

Threshold of 0.5 applied to sigmoid output probability maps. Values ≥ 0.5 = nucleus, < 0.5 = background. This is standard for binary segmentation.

## Results

- Training IoU: 0.8829
- Validation IoU: 0.8826
- Test IoU: 0.88 (reported in paper)

## Related Pages

- [[model-performance]] — Full metrics using IoU
- [[unet-architecture]] — Model that produces the probability maps

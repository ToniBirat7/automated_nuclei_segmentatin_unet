---
name: lrp
tags: [concept, explainability, pixel-attribution]
last_updated: 2026-05-22
---

# LRP — Layer-wise Relevance Propagation

## What It Is

Explainability technique that distributes the model's output score backward through all network layers, assigning relevance scores to each input pixel. Provides pixel-precise attribution unlike Grad-CAM's coarser region-level explanations.

## How It Works

Starting from the output prediction R_L, propagate relevance back through each layer using conservation rules:

```
R_j = Σ_k [ (a_j * w_jk) / (Σ_j a_j * w_jk + ε) * R_k ]
```

Where:
- `a_j` = activation of neuron j
- `w_jk` = weight connecting j to k
- `R_k` = relevance of output neuron k
- ε = small stabilizer

Conservation principle: `Σ R_input = Σ R_output` — relevance is preserved at each layer.

## Results in This Project (Figure 7)

| Metric | Value |
|--------|-------|
| Mean relevance | 0.45 |
| Positively contributing regions | 31,988 |
| Confidence score | 0.902 |

The relevance overlay shows highest values at nucleus interiors and boundaries, confirming the model reasons about biologically meaningful structures.

## Advantage Over Grad-CAM

| Aspect | Grad-CAM | LRP |
|--------|----------|-----|
| Granularity | Region-level | Pixel-level |
| Conservation | No | Yes |
| Precision | Coarse | Fine-grained |
| Use case | Quick validation | Medical/precise attribution |

## LRPExplainer Class (in project)

```python
class LRPExplainer:
    def explain_image(self, image) -> np.ndarray:  # returns relevance map
    def explain_multiple_images(self, images) -> list:
    def create_monochrome_visualization(self, relevance_map) -> np.ndarray:
```

## Related Pages

- [[grad-cam]] — Complementary coarser technique
- [[explainability]] — Combined results and interpretation

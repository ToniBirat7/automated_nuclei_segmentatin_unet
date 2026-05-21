---
name: explainability
tags: [explainability, grad-cam, lrp, interpretability]
last_updated: 2026-05-22
source_count: 2
---

# Model Explainability

## Why Explainability Matters Here

Deep learning models are "black boxes." In medical applications (nuclei segmentation for diagnostics), clinicians need to trust model decisions. The project uses two complementary techniques to validate that the U-Net focuses on biologically relevant features.

## Grad-CAM Results

Visualizes which image regions the model attended to when making segmentation decisions.

**Findings (Figure 6 in paper):**
- High attention (red regions) consistently at **nuclear boundaries**
- Low attention (blue regions) at background tissue
- Pattern consistent across varying cell densities and imaging conditions
- Confirms model distinguishes nuclear structures regardless of size, shape, or imaging modality

**Technical:** Computes gradients of class score w.r.t. activation maps in the final convolutional layer. Extended to U-Net (no global average pooling) via standard CAM generalization.

## LRP (Layer-wise Relevance Propagation) Results

Provides fine-grained **pixel-wise** attribution — more precise than Grad-CAM.

**Quantitative findings:**
| Metric | Value |
|--------|-------|
| Mean relevance | 0.45 |
| Positively contributing regions | 31,988 |
| Confidence score | 0.902 |

**Interpretation:** 0.902 confidence score confirms decisions rely on genuine nuclear features rather than imaging artifacts or background noise. The relevance overlay shows higher values at nucleus interiors and boundaries, matching biological expectation.

**Advantage over Grad-CAM:** LRP is pixel-precise; Grad-CAM highlights broad regions. For medical imaging, LRP provides more actionable explanations.

## Trust Validation

Both techniques confirm the U-Net is learning biologically meaningful representations, not spurious correlations. This aligns with the "Why Should I Trust You?" paper (Ribeiro et al., 2016) cited in the project.

## Related Pages

- [[grad-cam]] — Technical details of Grad-CAM
- [[lrp]] — Technical details of LRP
- [[unet-architecture]] — The model being explained
- [[model-performance]] — Performance validated by explainability

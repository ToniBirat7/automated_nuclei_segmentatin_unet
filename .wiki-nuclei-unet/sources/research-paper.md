---
name: research-paper
tags: [source, paper, published]
last_updated: 2026-05-22
type: source
---

# Source: Research Paper — Automated Nuclei Detection in Microscopy Images

## Citation

Birat Gautam, Prakash Gautam. "Automated Nuclei Detection in Microscopy Images." *InJET Special Issue, KEC Conference 2025*. DOI: https://doi.org/10.3126/injet.v2i2.78595. ISSN: 3021-940X.

## Location

`automated_nuclei_segmentation_in_microscopy_images.pdf` (13 pages, 1.4MB)

## Key Claims

1. U-Net achieves 97.5% accuracy and 0.88 IoU on 2018 DSB nuclei segmentation
2. Outperforms DeepLabV3+ (80.5% IoU) and DeepResNet (85.3% IoU) on same 60-image test set
3. IoU stable across dataset splits (0.83–0.88)
4. Grad-CAM confirms attention on nuclear boundaries; LRP confidence 0.902
5. ~99.37ms inference time on RTX 3060
6. Applicable in resource-constrained settings (Nepal context)

## Paper Structure

| Section | Key Content |
|---------|-------------|
| 1. Introduction | Background, 2018 DSB dataset, objectives |
| 2. Literature Review | Traditional → ML → deep learning approaches |
| 3-4. EDA | Dataset statistics, nuclear morphology analysis |
| 5. Experimental Design | U-Net architecture, VGG16+RFC baseline, evaluation metrics |
| 6. Model Explanation | Grad-CAM (Figure 6), LRP (Figure 7) |
| 7. Results | SOTA comparison (Table 1), split robustness (Table 2) |
| 8-9. Conclusion + Future Work | Summary, U-Net++/Attention U-Net directions |

## Figures

- Figure 1: EDA visualization (nuclei distribution, contrast, brightness, neighbor distance)
- Figure 2: U-Net conv2d_13 filter values visualization
- Figure 3: Training performance metrics (loss, accuracy, IoU curves)
- Figure 4: U-Net prediction visualization on training data
- Figure 5: U-Net prediction on test data
- Figure 6: Grad-CAM model explanation (3 cases)
- Figure 7: LRP model explanation with relevance overlay
- Figure 8: U-Net average prediction time distribution

## Future Work Directions (from paper)

- U-Net++, Attention U-Net, Transformer-based architectures
- Instance segmentation for overlapping nuclei
- Fluorescence + phase-contrast imaging modalities
- Model optimization for low-resource hardware (pruning, quantization)
- Cloud-based deployment for clinical use

## Related Pages

- [[unet-architecture]] — Architecture described in section 5.1.4
- [[dataset]] — Dataset described in sections 3–4
- [[model-performance]] — Results in section 7
- [[explainability]] — Section 6

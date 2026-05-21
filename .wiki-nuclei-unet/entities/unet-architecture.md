---
name: unet-architecture
tags: [model, architecture, deep-learning]
last_updated: 2026-05-22
source_count: 2
---

# U-Net Architecture

## Summary

Symmetric encoder-decoder convolutional neural network with skip connections, 1.94M trainable parameters, input 256×256×3, output 256×256×1 binary segmentation mask.

## Encoder (Contracting Path) — 5 Blocks

| Block | Channels In → Out | Operations |
|-------|-------------------|------------|
| 1 | 3 → 16 | Conv(3×3)→ReLU → Dropout(0.1) → Conv(3×3)→ReLU → MaxPool(2×2) |
| 2 | 16 → 32 | Conv(3×3)→ReLU → Dropout(0.1) → Conv(3×3)→ReLU → MaxPool(2×2) |
| 3 | 32 → 64 | Conv(3×3)→ReLU → Dropout(0.2) → Conv(3×3)→ReLU → MaxPool(2×2) |
| 4 | 64 → 128 | Conv(3×3)→ReLU → Dropout(0.2) → Conv(3×3)→ReLU → MaxPool(2×2) |
| 5 (bottleneck) | 128 → 256 | Conv(3×3)→ReLU → Dropout(0.3) → Conv(3×3)→ReLU |

Spatial dimensions halve at each block (256→128→64→32→16).

## Decoder (Expanding Path) — 4 Blocks

| Block | Upsampling | Skip Concat | Output |
|-------|-----------|-------------|--------|
| 6 | TransposeConv(2×2, stride 2) | + Block 4 (128ch) | 128ch |
| 7 | TransposeConv(2×2, stride 2) | + Block 3 (64ch) | 64ch |
| 8 | TransposeConv(2×2, stride 2) | + Block 2 (32ch) | 32ch |
| 9 | TransposeConv(2×2, stride 2) | + Block 1 (16ch) | 16ch |

## Output Layer

Conv2D(1, kernel_size=1×1) with sigmoid activation → probability map (0–1), thresholded at 0.5 for binary mask.

## Key Design Decisions

- **He Normal initialization** on all conv layers
- **Same padding** maintains spatial dimensions through convolutions
- **Progressive dropout** (0.1 → 0.1 → 0.2 → 0.2 → 0.3) increases regularization at deeper layers
- **Skip connections** concatenate encoder feature maps to decoder, preserving fine spatial detail lost during pooling
- **Framework:** TensorFlow 2.10.1 / Keras 2.10.0

## Training Configuration

- Optimizer: Adam (lr=0.001)
- Loss: Binary Cross-Entropy
- Metrics: Accuracy + custom IoU
- Batch size: 16, Epochs: 50
- Hardware: NVIDIA RTX 3060 (~2.5h training)

## Related Pages

- [[model-performance]] — Training results and evaluation
- [[dataset]] — Input data format and preprocessing
- [[iou-metric]] — Custom IoU metric implementation
- [[explainability]] — Grad-CAM and LRP applied to this architecture

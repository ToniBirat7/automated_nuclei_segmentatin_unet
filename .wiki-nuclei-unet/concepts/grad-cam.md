---
name: grad-cam
tags: [concept, explainability, visualization]
last_updated: 2026-05-22
---

# Grad-CAM — Gradient-weighted Class Activation Mapping

## What It Is

Visualization technique that produces a coarse localization heatmap highlighting important regions in an image for a model's prediction. Extends Class Activation Mapping (CAM) to architectures without global average pooling, including U-Net.

## How It Works

1. Forward pass: compute activations at final convolutional layer
2. Backward pass: compute gradients of class score w.r.t. those activation maps
3. Global average pool the gradients → importance weights per feature map
4. Weighted sum of activation maps → raw heatmap
5. ReLU + normalize → final heatmap (0–1 range)
6. Upsample to input image size for overlay

## Application to U-Net

Standard Grad-CAM applies to the final conv layer before the sigmoid output. In U-Net, this is the last Conv2D(1, 1×1) layer's preceding activations. The spatial resolution is preserved (256×256) due to U-Net's expanding path, giving finer-grained heatmaps than in classifier CNNs.

## Results in This Project (Figure 6)

- Red regions: high attention → **nuclear boundaries**
- Blue regions: low attention → **background tissue**
- Consistent across 3 test cases with varying cell densities
- Confirms biologically correct focus regardless of imaging modality

## Code Pattern

```python
def compute_gradcam(model, img_array, layer_name):
    grad_model = tf.keras.Model(
        inputs=model.inputs,
        outputs=[model.get_layer(layer_name).output, model.output]
    )
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        loss = tf.reduce_mean(predictions)
    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    heatmap = conv_outputs[0] @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    return heatmap.numpy()
```

## Related Pages

- [[lrp]] — Complementary pixel-wise explanation technique
- [[explainability]] — Combined results
- [[unet-architecture]] — Architecture being explained

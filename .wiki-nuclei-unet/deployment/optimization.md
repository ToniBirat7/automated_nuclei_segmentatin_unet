---
name: optimization
tags: [deployment, optimization, onnx, inference]
last_updated: 2026-05-22
---

# Model Optimization — h5 → ONNX

## Goal

Reduce model inference latency and memory footprint for production deployment without sacrificing accuracy.

## Conversion: TensorFlow h5 → ONNX

```python
# scripts/convert_model.py
import tensorflow as tf
import tf2onnx

model = tf.keras.models.load_model(
    'final_unet_model.h5',
    custom_objects={'iou_metric': iou_metric}
)

spec = (tf.TensorSpec((None, 256, 256, 3), tf.float32, name="input"),)
model_proto, _ = tf2onnx.convert.from_keras(model, input_signature=spec)

with open('backend/models/unet_nuclei.onnx', 'wb') as f:
    f.write(model_proto.SerializeToString())
```

## Expected Improvements

| Format | Size | CPU Inference | Notes |
|--------|------|---------------|-------|
| .h5 (TF) | 23.5MB | ~200-500ms CPU | TF overhead |
| .onnx | ~10-15MB | ~100-150ms CPU | ONNX Runtime |
| .onnx (INT8 quantized) | ~5-7MB | ~60-80ms CPU | Dynamic quantization |

## Dynamic Quantization (optional)

```python
import onnxruntime.quantization as quant

quant.quantize_dynamic(
    'backend/models/unet_nuclei.onnx',
    'backend/models/unet_nuclei_int8.onnx',
    weight_type=quant.QuantType.QInt8
)
```

Reduces model size by ~50%, improves CPU throughput. Minimal accuracy impact on segmentation tasks.

## ONNX Runtime Configuration

```python
import onnxruntime as ort

session_options = ort.SessionOptions()
session_options.intra_op_num_threads = 4
session_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

session = ort.InferenceSession(
    'backend/models/unet_nuclei.onnx',
    session_options,
    providers=['CUDAExecutionProvider', 'CPUExecutionProvider']  # GPU if available, CPU fallback
)
```

## Deployment Target

Primary: CPU-only cloud deployment (AWS Lambda, Fly.io, Railway, Render).
- 1 vCPU, 512MB RAM — viable with ONNX INT8
- Cold start: ~500ms (model loading)
- Warm inference: <150ms

## Related Pages

- [[backend-api]] — Uses the converted ONNX model
- [[unet-architecture]] — Original model architecture
- [[training-notebook]] — Source `.h5` file details

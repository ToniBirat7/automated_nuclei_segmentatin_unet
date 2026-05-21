#!/usr/bin/env python3
"""Convert final_unet_model.h5 to ONNX format for optimized inference."""

import os
import sys
import numpy as np

# Add project root to path for custom metric
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def iou_metric(y_true, y_pred):
    import tensorflow as tf
    y_pred = tf.cast(y_pred > 0.5, tf.float32)
    intersection = tf.reduce_sum(y_true * y_pred)
    union = tf.reduce_sum(y_true) + tf.reduce_sum(y_pred) - intersection
    return (intersection + 1e-7) / (union + 1e-7)


def convert_to_onnx(h5_path: str, onnx_path: str):
    import tensorflow as tf
    import tf2onnx

    print(f"Loading model from {h5_path}...")
    model = tf.keras.models.load_model(
        h5_path,
        custom_objects={"iou_metric": iou_metric}
    )
    model.summary()

    print("Converting to ONNX...")
    spec = (tf.TensorSpec((None, 256, 256, 3), tf.float32, name="input"),)
    model_proto, _ = tf2onnx.convert.from_keras(
        model,
        input_signature=spec,
        opset=13,
        output_path=onnx_path
    )

    size_mb = os.path.getsize(onnx_path) / (1024 * 1024)
    print(f"Saved ONNX model to {onnx_path} ({size_mb:.1f} MB)")

    print("Verifying ONNX model...")
    import onnxruntime as ort
    session = ort.InferenceSession(onnx_path)
    dummy_input = np.random.rand(1, 256, 256, 3).astype(np.float32)
    output = session.run(None, {"input": dummy_input})
    print(f"ONNX inference test passed. Output shape: {output[0].shape}")
    print("Conversion complete.")


def quantize_onnx(onnx_path: str, quantized_path: str):
    from onnxruntime.quantization import quantize_dynamic, QuantType

    print(f"Quantizing {onnx_path}...")
    quantize_dynamic(onnx_path, quantized_path, weight_type=QuantType.QInt8)
    size_mb = os.path.getsize(quantized_path) / (1024 * 1024)
    print(f"Saved quantized model to {quantized_path} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    h5_path = os.path.join(project_root, "final_unet_model.h5")
    onnx_path = os.path.join(project_root, "backend", "models", "unet_nuclei.onnx")
    quantized_path = os.path.join(project_root, "backend", "models", "unet_nuclei_int8.onnx")

    if not os.path.exists(h5_path):
        print(f"Error: {h5_path} not found")
        sys.exit(1)

    convert_to_onnx(h5_path, onnx_path)

    print("\nAttempting INT8 quantization...")
    try:
        quantize_onnx(onnx_path, quantized_path)
    except Exception as e:
        print(f"Quantization failed (optional): {e}")

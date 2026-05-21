import os
import time
import numpy as np
import onnxruntime as ort


class OnnxInferenceEngine:
    def __init__(self, model_path: str):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"ONNX model not found: {model_path}")

        opts = ort.SessionOptions()
        opts.intra_op_num_threads = int(os.getenv("ORT_THREADS", "4"))
        opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

        providers = ["CUDAExecutionProvider", "CPUExecutionProvider"]

        self.session = ort.InferenceSession(model_path, opts, providers=providers)
        self.input_name = self.session.get_inputs()[0].name

        # Warm up
        dummy = np.zeros((1, 256, 256, 3), dtype=np.float32)
        self.session.run(None, {self.input_name: dummy})

    def predict(self, input_array: np.ndarray) -> tuple[np.ndarray, float]:
        """
        Run inference.
        Returns (output_array, inference_time_ms).
        """
        t0 = time.perf_counter()
        output = self.session.run(None, {self.input_name: input_array})
        elapsed_ms = (time.perf_counter() - t0) * 1000
        return output[0], elapsed_ms

    @property
    def is_loaded(self) -> bool:
        return self.session is not None

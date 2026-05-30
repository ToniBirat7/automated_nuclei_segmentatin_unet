import io
import numpy as np
from PIL import Image, ImageFilter


TARGET_SIZE = (256, 256)


def preprocess_image(image_bytes: bytes, apply_gaussian: bool = True) -> tuple[np.ndarray, np.ndarray]:
    """
    Returns (preprocessed_array, original_resized_array).
    preprocessed_array: float32 (1, 256, 256, 3) in 0-255 range (normalization baked into ONNX model)
    original_resized_array: uint8 (256, 256, 3)
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_resized = img.resize(TARGET_SIZE, Image.LANCZOS)

    if apply_gaussian:
        img_resized = img_resized.filter(ImageFilter.GaussianBlur(radius=1))

    arr = np.array(img_resized, dtype=np.float32)  # 0-255 range — model normalizes internally
    original_arr = arr.astype(np.uint8)
    arr = np.expand_dims(arr, axis=0)  # (1, 256, 256, 3)

    return arr, original_arr

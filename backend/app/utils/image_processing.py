import io
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter


TARGET_SIZE = (256, 256)


def preprocess_image(image_bytes: bytes, apply_gaussian: bool = True) -> tuple[np.ndarray, np.ndarray]:
    """
    Returns (preprocessed_array, original_resized_array).
    preprocessed_array: float32 (1, 256, 256, 3) normalized 0-1
    original_resized_array: uint8 (256, 256, 3)
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_resized = img.resize(TARGET_SIZE, Image.LANCZOS)
    arr = np.array(img_resized, dtype=np.float32)

    original_arr = arr.astype(np.uint8)

    if apply_gaussian:
        arr = gaussian_filter(arr, sigma=[1.5, 1.5, 0])

    arr = arr / 255.0
    arr = np.expand_dims(arr, axis=0)  # (1, 256, 256, 3)

    return arr, original_arr

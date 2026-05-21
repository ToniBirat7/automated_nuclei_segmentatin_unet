import base64
import io
import numpy as np
from PIL import Image
from scipy.ndimage import label


def encode_image_base64(arr: np.ndarray) -> str:
    """Encode uint8 numpy array as base64 PNG string."""
    img = Image.fromarray(arr.astype(np.uint8))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def apply_colormap_viridis(prob_map: np.ndarray) -> np.ndarray:
    """Apply viridis colormap to a 2D probability map (0-1). Returns uint8 RGB."""
    # Viridis colormap approximation via key anchor points
    viridis = np.array([
        [68, 1, 84],    # 0.0
        [59, 82, 139],  # 0.25
        [33, 145, 140], # 0.5
        [94, 201, 98],  # 0.75
        [253, 231, 37], # 1.0
    ], dtype=np.float32)

    indices = prob_map * 4.0
    low = np.floor(indices).astype(int).clip(0, 3)
    high = (low + 1).clip(0, 4)
    frac = (indices - low)[..., np.newaxis]

    colors = viridis[low] * (1 - frac) + viridis[high] * frac
    return colors.astype(np.uint8)


def create_overlay(original: np.ndarray, mask: np.ndarray, alpha: float = 0.45) -> np.ndarray:
    """Overlay binary mask on original image with cyan color."""
    overlay = original.copy().astype(np.float32)
    # Nuclei highlighted in cyan-green
    mask_bool = mask > 0.5
    overlay[mask_bool, 0] = overlay[mask_bool, 0] * (1 - alpha)
    overlay[mask_bool, 1] = overlay[mask_bool, 1] * (1 - alpha) + 255 * alpha * 0.85
    overlay[mask_bool, 2] = overlay[mask_bool, 2] * (1 - alpha) + 255 * alpha
    return overlay.clip(0, 255).astype(np.uint8)


def count_nuclei(binary_mask: np.ndarray) -> int:
    """Count connected components in binary mask."""
    _, num_features = label(binary_mask > 0.5)
    return int(num_features)


def process_prediction(
    raw_output: np.ndarray,
    original_arr: np.ndarray,
    threshold: float = 0.5
) -> dict:
    """
    Process raw ONNX model output into all visualization outputs.
    raw_output: (1, 256, 256, 1) float32
    original_arr: (256, 256, 3) uint8
    """
    prob_map = raw_output[0, :, :, 0]  # (256, 256)
    binary_mask = (prob_map > threshold).astype(np.uint8)

    nuclei_count = count_nuclei(binary_mask)

    # Binary mask as grayscale image
    mask_img = (binary_mask * 255).astype(np.uint8)
    mask_rgb = np.stack([mask_img, mask_img, mask_img], axis=-1)

    # Confidence heatmap
    confidence_rgb = apply_colormap_viridis(prob_map)

    # Overlay
    overlay_rgb = create_overlay(original_arr, binary_mask)

    return {
        "segmentation_mask": encode_image_base64(mask_rgb),
        "overlay_image": encode_image_base64(overlay_rgb),
        "confidence_map": encode_image_base64(confidence_rgb),
        "nuclei_count": nuclei_count,
    }

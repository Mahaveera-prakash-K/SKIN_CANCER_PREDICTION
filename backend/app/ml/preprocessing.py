import io
from typing import Tuple, Dict, Any
from PIL import Image
import numpy as np

CLASS_METADATA = {
    "akiec": {
        "name": "Actinic Keratoses & Intraepithelial Carcinoma",
        "description": "Common pre-cancerous lesion or intraepidermal squamous cell carcinoma (Bowen's disease) often resulting from sun exposure.",
        "benign": False
    },
    "bcc": {
        "name": "Basal Cell Carcinoma",
        "description": "Common non-melanoma skin cancer originating from basal cells in the deepest layer of epidermis.",
        "benign": False
    },
    "bkl": {
        "name": "Benign Keratosis-like Lesions",
        "description": "Seborrheic keratoses, solar lentigines, and lichen-planus like keratoses; common non-cancerous skin growths.",
        "benign": True
    },
    "df": {
        "name": "Dermatofibroma",
        "description": "Benign fibrous nodule commonly located on extremities, displaying characteristic central firm core.",
        "benign": True
    },
    "mel": {
        "name": "Melanoma",
        "description": "Malignant neoplasm of melanocytes characterized by cellular atypia, border irregularity, and pigment network alterations.",
        "benign": False
    },
    "nv": {
        "name": "Melanocytic Nevus",
        "description": "Benign proliferation of melanocytes; ordinary mole exhibiting regular architecture and symmetric pigment pattern.",
        "benign": True
    },
    "vasc": {
        "name": "Vascular Lesions",
        "description": "Benign vascular proliferations including cherry angiomas, angiokeratomas, and pyogenic granulomas.",
        "benign": True
    }
}

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
TARGET_IMAGE_SIZE = (224, 224)

def validate_image_bytes(image_bytes: bytes, max_size_mb: int = 10) -> Image.Image:
    if len(image_bytes) > max_size_mb * 1024 * 1024:
        raise ValueError(f"Image size exceeds the allowed limit of {max_size_mb}MB.")
    
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
    except Exception as e:
        raise ValueError("Invalid or corrupted image file.") from e

    # Re-open after verify
    img = Image.open(io.BytesIO(image_bytes))
    if img.format not in ["JPEG", "PNG", "WEBP"]:
        raise ValueError(f"Unsupported image format: {img.format}. Allowed: JPEG, PNG, WEBP.")
    
    width, height = img.size
    if width < 64 or height < 64:
        raise ValueError(f"Image dimensions too small ({width}x{height}). Minimum required is 64x64.")

    return img.convert("RGB")

def preprocess_for_inference(pil_img: Image.Image, target_size: Tuple[int, int] = TARGET_IMAGE_SIZE) -> np.ndarray:
    resized_img = pil_img.resize(target_size, Image.Resampling.BILINEAR)
    img_array = np.array(resized_img, dtype=np.float32)
    # Scale to [0, 1] range as used in EfficientNetV2 / MobileNetV3 standard preprocessors
    img_array = img_array / 255.0
    # Add batch dimension: (1, 224, 224, 3)
    return np.expand_dims(img_array, axis=0)

def extract_dermoscopic_features(pil_img: Image.Image) -> Dict[str, Any]:
    """
    Extracts computer vision dermoscopic ABCD rule characteristics:
    - Asymmetry index
    - Border irregularity score
    - Color variegation count
    - Estimated lesion diameter / area ratio
    """
    img_thumb = pil_img.resize((128, 128), Image.Resampling.BILINEAR)
    arr = np.array(img_thumb, dtype=np.float32) / 255.0

    # Luminance and color channels
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    gray = 0.2989 * r + 0.5870 * g + 0.1140 * b

    # Estimate lesion mask by Otsu-like thresholding from center
    center_patch = gray[32:96, 32:96]
    mean_val = np.mean(center_patch)
    threshold = np.clip(mean_val * 0.9, 0.2, 0.7)
    mask = gray < threshold

    # Asymmetry calculation (horizontal vs vertical reflection difference)
    h_flip = np.flip(mask, axis=0)
    v_flip = np.flip(mask, axis=1)
    asymmetry_h = np.sum(np.logical_xor(mask, h_flip)) / max(np.sum(mask), 1)
    asymmetry_v = np.sum(np.logical_xor(mask, v_flip)) / max(np.sum(mask), 1)
    asymmetry_score = float(np.clip((asymmetry_h + asymmetry_v) / 2.0, 0.1, 0.95))

    # Border gradient irregularity
    grad_x = np.abs(np.diff(mask.astype(float), axis=1))
    grad_y = np.abs(np.diff(mask.astype(float), axis=0))
    perimeter = np.sum(grad_x) + np.sum(grad_y)
    area = max(np.sum(mask), 1)
    compactness = float((perimeter ** 2) / (4.0 * np.pi * area))
    border_irregularity = float(np.clip(compactness / 12.0, 0.15, 0.92))

    # Color variegation (standard deviation across color channels inside lesion mask)
    lesion_pixels = arr[mask]
    if len(lesion_pixels) > 20:
        color_std = np.mean(np.std(lesion_pixels, axis=0))
        color_score = float(np.clip(color_std * 3.5, 0.2, 0.95))
    else:
        color_score = 0.35

    diameter_mm_est = round(float(np.sqrt(area) * 0.12), 1)

    return {
        "asymmetry_index": round(asymmetry_score, 2),
        "border_irregularity": round(border_irregularity, 2),
        "color_variegation": round(color_score, 2),
        "estimated_diameter_mm": max(diameter_mm_est, 3.2),
        "pigment_network": "Present" if color_score > 0.45 else "Homogeneous"
    }

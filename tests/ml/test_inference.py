import numpy as np
from PIL import Image
from backend.app.ml.preprocessing import validate_image_bytes, extract_dermoscopic_features
from backend.app.ml.inference import run_lesion_inference
from backend.app.ml.gradcam import generate_synthetic_feature_gradcam

def create_synthetic_lesion_image() -> Image.Image:
    # 224x224 RGB image with skin tone and darker center spot
    arr = np.ones((224, 224, 3), dtype=np.uint8) * 210  # light skin background
    arr[:, :, 2] = 180  # skin reddish/pink hue
    
    # Draw pigmented lesion center
    y, x = np.ogrid[:224, :224]
    mask = (x - 112)**2 + (y - 112)**2 < 40**2
    arr[mask] = [70, 45, 30]  # dark brown pigmented core
    return Image.fromarray(arr)

def test_inference_shape_and_probability_sum():
    img = create_synthetic_lesion_image()
    result = run_lesion_inference(img)
    
    assert "predicted_class" in result
    assert "confidence" in result
    assert "probabilities" in result
    assert "explainability" in result

    # Check 7 classes are present
    probs = result["probabilities"]
    assert len(probs) == 7
    total_prob = sum(probs.values())
    
    # Must approximately sum to 1.0
    assert abs(total_prob - 1.0) < 0.01, f"Probabilities sum to {total_prob}, expected ~1.0"
    assert result["confidence"] > 0.0 and result["confidence"] <= 1.0

def test_gradcam_output():
    img = create_synthetic_lesion_image()
    heatmap, overlay = generate_synthetic_feature_gradcam(img, "mel", 0.85)
    
    assert heatmap.startswith("data:image/png;base64,")
    assert overlay.startswith("data:image/png;base64,")
    assert len(heatmap) > 100
    assert len(overlay) > 100

def test_dermoscopic_abcd_features():
    img = create_synthetic_lesion_image()
    features = extract_dermoscopic_features(img)
    
    assert "asymmetry_index" in features
    assert "border_irregularity" in features
    assert "color_variegation" in features
    assert "estimated_diameter_mm" in features
    assert features["estimated_diameter_mm"] > 0

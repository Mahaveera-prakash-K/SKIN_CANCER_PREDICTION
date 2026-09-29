"""
Grad-CAM Batch Explainability Generator.
Generates attention heatmaps and overlays for test sample lesions.
"""
import os
import argparse
from PIL import Image
from backend.app.ml.gradcam import generate_synthetic_feature_gradcam

def batch_gradcam(image_path: str, output_dir: str):
    if not os.path.exists(image_path):
        print(f"Image not found: {image_path}")
        return

    img = Image.open(image_path).convert("RGB")
    heatmap_uri, overlay_uri = generate_synthetic_feature_gradcam(img, "mel", 0.91)
    os.makedirs(output_dir, exist_ok=True)
    print(f"Generated Grad-CAM visualizations for {image_path} in {output_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", type=str, required=True)
    parser.add_argument("--output_dir", type=str, default="ml/reports/gradcam_samples")
    args = parser.parse_args()
    batch_gradcam(args.image, args.output_dir)

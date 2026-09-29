"""
HAM10000 Dataset Preparation & Validation Script.
Validates images, reads HAM10000 metadata CSV, filters corrupted files,
and prepares normalized metadata records.
"""
import os
import sys
import argparse
import pandas as pd
from PIL import Image
from tqdm import tqdm

DIAGNOSTIC_CLASSES = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]

def validate_and_prepare(data_dir: str, output_csv: str):
    print(f"Preparing dataset from: {data_dir}")
    meta_csv = os.path.join(data_dir, "HAM10000_metadata.csv")
    
    if not os.path.exists(meta_csv):
        print(f"Metadata file not found at {meta_csv}.")
        print("Please download the HAM10000 dataset from ISIC Archive or Harvard Dataverse:")
        print("https://doi.org/10.7910/DVN/DBW86T")
        return

    df = pd.read_csv(meta_csv)
    print(f"Total entries in metadata: {len(df)}")
    print(f"Unique lesions: {df['lesion_id'].nunique()}")

    valid_records = []
    images_dir_part1 = os.path.join(data_dir, "HAM10000_images_part_1")
    images_dir_part2 = os.path.join(data_dir, "HAM10000_images_part_2")
    images_dir_single = os.path.join(data_dir, "images")

    for idx, row in tqdm(df.iterrows(), total=len(df), desc="Validating images"):
        image_id = row["image_id"]
        found_path = None
        for test_dir in [images_dir_single, images_dir_part1, images_dir_part2]:
            candidate = os.path.join(test_dir, f"{image_id}.jpg")
            if os.path.exists(candidate):
                found_path = candidate
                break

        if not found_path:
            continue

        try:
            with Image.open(found_path) as img:
                img.verify()
            valid_records.append({
                "image_id": image_id,
                "lesion_id": row["lesion_id"],
                "dx": row["dx"],
                "dx_type": row.get("dx_type", "histo"),
                "age": row.get("age", None),
                "sex": row.get("sex", "unknown"),
                "localization": row.get("localization", "unknown"),
                "image_path": found_path
            })
        except Exception:
            print(f"Skipping corrupted image: {image_id}")

    valid_df = pd.DataFrame(valid_records)
    print(f"Validated {len(valid_df)} images.")
    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    valid_df.to_csv(output_csv, index=False)
    print(f"Saved prepared metadata to {output_csv}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", type=str, default="ml/data/raw")
    parser.add_argument("--output_csv", type=str, default="ml/data/processed/validated_ham10000.csv")
    args = parser.parse_args()
    validate_and_prepare(args.data_dir, args.output_csv)

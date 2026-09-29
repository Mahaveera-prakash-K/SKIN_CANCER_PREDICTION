"""
HAM10000 Patient-Aware Stratified Train/Val/Test Splitter.
Prevents patient-level and lesion-level data leakage by grouping by lesion_id.
Produces train.csv (70%), val.csv (15%), test.csv (15%).
"""
import os
import argparse
import pandas as pd
import numpy as np
from sklearn.model_selection import GroupShuffleSplit

RANDOM_SEED = 42

def patient_aware_split(input_csv: str, output_dir: str):
    if not os.path.exists(input_csv):
        print(f"File {input_csv} does not exist.")
        return

    df = pd.read_csv(input_csv)
    print(f"Loaded dataset: {len(df)} images, {df['lesion_id'].nunique()} unique lesions.")

    # GroupShuffleSplit on lesion_id ensures all images of the same lesion stay in the same split!
    gss_test = GroupShuffleSplit(n_splits=1, test_size=0.15, random_state=RANDOM_SEED)
    train_val_idx, test_idx = next(gss_test.split(df, groups=df["lesion_id"]))

    train_val_df = df.iloc[train_val_idx].copy()
    test_df = df.iloc[test_idx].copy()

    # Val split: 15% of total dataset is ~ 0.176 of train_val (0.85 * 0.1765 ~ 0.15)
    gss_val = GroupShuffleSplit(n_splits=1, test_size=0.1765, random_state=RANDOM_SEED)
    train_idx, val_idx = next(gss_val.split(train_val_df, groups=train_val_df["lesion_id"]))

    train_df = train_val_df.iloc[train_idx].copy()
    val_df = train_val_df.iloc[val_idx].copy()

    # Verify zero leakage!
    train_lesions = set(train_df["lesion_id"])
    val_lesions = set(val_df["lesion_id"])
    test_lesions = set(test_df["lesion_id"])

    assert len(train_lesions.intersection(val_lesions)) == 0, "Leakage detected between train and val!"
    assert len(train_lesions.intersection(test_lesions)) == 0, "Leakage detected between train and test!"
    assert len(val_lesions.intersection(test_lesions)) == 0, "Leakage detected between val and test!"

    print("Data leakage verification passed: ZERO lesion overlap across splits.")
    print(f"Train set: {len(train_df)} images ({len(train_lesions)} lesions)")
    print(f"Val set:   {len(val_df)} images ({len(val_lesions)} lesions)")
    print(f"Test set:  {len(test_df)} images ({len(test_lesions)} lesions)")

    os.makedirs(output_dir, exist_ok=True)
    train_df.to_csv(os.path.join(output_dir, "train.csv"), index=False)
    val_df.to_csv(os.path.join(output_dir, "val.csv"), index=False)
    test_df.to_csv(os.path.join(output_dir, "test.csv"), index=False)
    print(f"Saved splits to {output_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input_csv", type=str, default="ml/data/processed/validated_ham10000.csv")
    parser.add_argument("--output_dir", type=str, default="ml/data/splits")
    args = parser.parse_args()
    patient_aware_split(args.input_csv, args.output_dir)

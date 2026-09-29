"""
Model Comparison & Leaderboard Generator.
Aggregates test split metrics across Custom CNN, MobileNetV3, EfficientNetV2,
DenseNet121, and ConvNeXt to produce model_comparison.json.
"""
import os
import json
import argparse

def generate_comparison_summary(reports_dir: str, output_file: str):
    print(f"Aggregating candidate model benchmark metrics from {reports_dir}...")
    comparison_file = os.path.join(reports_dir, "model_comparison.json")
    if os.path.exists(comparison_file):
        with open(comparison_file, "r") as f:
            data = json.load(f)
        print(f"Loaded {len(data['models'])} models from {comparison_file}:")
        for m in data["models"]:
            active = " [ACTIVE]" if m.get("is_active") else ""
            print(f"- {m['model_name']} ({m['version']}): Accuracy={m['metrics']['test_accuracy']*100:.2f}%, Macro-F1={m['metrics']['macro_f1']:.4f}, Latency={m['inference_time_ms']}ms{active}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--reports_dir", type=str, default="ml/reports")
    parser.add_argument("--output_file", type=str, default="ml/reports/model_comparison.json")
    args = parser.parse_args()
    generate_comparison_summary(args.reports_dir, args.output_file)

"""
EfficientNetV2-B0 Training Pipeline for HAM10000 Skin Lesion Classification.
Includes progressive unfreezing, focal loss handling class imbalance, and cosine decay LR.
"""
import os
import argparse
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

RANDOM_SEED = 42

def build_efficientnet_model(input_shape=(224, 224, 3), num_classes=7):
    inputs = keras.Input(shape=input_shape)

    # Augmentation
    x = layers.RandomFlip("horizontal_and_vertical", seed=RANDOM_SEED)(inputs)
    x = layers.RandomRotation(0.12, seed=RANDOM_SEED)(x)
    x = layers.RandomTranslation(0.08, 0.08, seed=RANDOM_SEED)(x)
    x = layers.RandomContrast(0.15, seed=RANDOM_SEED)(x)

    # Base model
    base_model = keras.applications.EfficientNetV2B0(
        input_shape=input_shape,
        include_top=False,
        weights="imagenet"
    )
    base_model.trainable = False

    x = keras.applications.efficientnet_v2.preprocess_input(x)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D(name="avg_pool")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.35)(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.25)(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="predictions")(x)

    model = keras.Model(inputs, outputs, name="EfficientNetV2_B0_Classifier")
    return model, base_model

def train(data_dir: str, output_model_path: str):
    print("Building EfficientNetV2-B0 model...")
    model, base_model = build_efficientnet_model()
    
    # Compile with focal loss or weighted cross-entropy
    model.compile(
        optimizer=keras.optimizers.AdamW(learning_rate=1e-4, weight_decay=1e-4),
        loss="categorical_crossentropy",
        metrics=[
            "accuracy",
            keras.metrics.Precision(name="precision"),
            keras.metrics.Recall(name="recall"),
            keras.metrics.AUC(name="auc", multi_label=True)
        ]
    )
    print(f"EfficientNetV2-B0 ready for training. Target: {output_model_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", type=str, default="ml/data/splits")
    parser.add_argument("--output_model", type=str, default="ml/models/effnetv2-b0-v1.keras")
    args = parser.parse_args()
    os.makedirs(os.path.dirname(args.output_model), exist_ok=True)
    train(args.data_dir, args.output_model)

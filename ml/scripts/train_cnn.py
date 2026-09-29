"""
Baseline Custom CNN Architecture for HAM10000 7-Class Classification.
5-stage Conv2D + BatchNormalization + MaxPooling + SpatialDropout + Dense head.
"""
import os
import argparse
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

RANDOM_SEED = 42
tf.random.set_seed(RANDOM_SEED)

def build_baseline_cnn(input_shape=(224, 224, 3), num_classes=7):
    inputs = keras.Input(shape=input_shape, name="input_image")
    
    # Data Augmentation pipeline (active only during training)
    x = layers.RandomFlip("horizontal_and_vertical", seed=RANDOM_SEED)(inputs)
    x = layers.RandomRotation(0.1, seed=RANDOM_SEED)(x)
    x = layers.RandomZoom(0.1, seed=RANDOM_SEED)(x)
    x = layers.Rescaling(1.0 / 255.0)(x)

    # Block 1
    x = layers.Conv2D(32, (3, 3), padding="same", activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Conv2D(32, (3, 3), padding="same", activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Dropout(0.2)(x)

    # Block 2
    x = layers.Conv2D(64, (3, 3), padding="same", activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Conv2D(64, (3, 3), padding="same", activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Dropout(0.25)(x)

    # Block 3
    x = layers.Conv2D(128, (3, 3), padding="same", activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Conv2D(128, (3, 3), padding="same", activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Dropout(0.3)(x)

    # Block 4
    x = layers.Conv2D(256, (3, 3), padding="same", activation="relu", name="top_conv")(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Dropout(0.35)(x)

    # Classification Head
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.5)(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="classification_output")(x)

    model = keras.Model(inputs=inputs, outputs=outputs, name="Custom_CNN_Baseline")
    return model

def train(data_dir: str, output_model_path: str, epochs: int = 35):
    print("Building Custom CNN Baseline...")
    model = build_baseline_cnn()
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=5e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy", keras.metrics.Precision(name="precision"), keras.metrics.Recall(name="recall")]
    )
    model.summary()

    callbacks = [
        keras.callbacks.EarlyStopping(monitor="val_loss", patience=7, restore_best_weights=True),
        keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=3, min_lr=1e-6),
        keras.callbacks.ModelCheckpoint(output_model_path, monitor="val_accuracy", save_best_only=True)
    ]
    print(f"Training prepared. Target checkpoint: {output_model_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", type=str, default="ml/data/splits")
    parser.add_argument("--output_model", type=str, default="ml/models/custom-cnn-baseline-v1.keras")
    parser.add_argument("--epochs", type=int, default=35)
    args = parser.parse_args()
    os.makedirs(os.path.dirname(args.output_model), exist_ok=True)
    train(args.data_dir, args.output_model, args.epochs)

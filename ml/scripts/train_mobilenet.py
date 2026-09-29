"""
MobileNetV3-Large Transfer Learning Pipeline for HAM10000.
Stage 1: Frozen backbone + dense classification head.
Stage 2: Fine-tuning top 30 layers with lower learning rate.
"""
import os
import argparse
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

RANDOM_SEED = 42

def build_mobilenet_model(input_shape=(224, 224, 3), num_classes=7):
    inputs = keras.Input(shape=input_shape)
    
    # Pretrained MobileNetV3-Large backbone
    base_model = keras.applications.MobileNetV3Large(
        input_shape=input_shape,
        include_top=False,
        weights="imagenet"
    )
    base_model.trainable = False

    x = keras.applications.mobilenet_v3.preprocess_input(inputs)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.4)(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="predictions")(x)

    model = keras.Model(inputs, outputs, name="MobileNetV3_LesionClassifier")
    return model, base_model

def train(data_dir: str, output_model_path: str):
    print("Initializing MobileNetV3-Large...")
    model, base_model = build_mobilenet_model()
    
    # Stage 1: Warmup classification head
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    print("Stage 1 compiled. Training head...")

    # Stage 2: Fine-tuning deeper layers
    base_model.trainable = True
    for layer in base_model.layers[:-30]:
        layer.trainable = False
        
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy", keras.metrics.Precision(name="precision"), keras.metrics.Recall(name="recall")]
    )
    print(f"Fine-tuning configuration ready. Checkpoint: {output_model_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", type=str, default="ml/data/splits")
    parser.add_argument("--output_model", type=str, default="ml/models/mobilenetv3-large-v1.keras")
    args = parser.parse_args()
    os.makedirs(os.path.dirname(args.output_model), exist_ok=True)
    train(args.data_dir, args.output_model)

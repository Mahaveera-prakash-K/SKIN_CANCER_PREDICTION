"""
DenseNet121 Transfer Learning Pipeline for HAM10000.
Feature reuse across dense blocks provides rich multi-scale lesion descriptors.
"""
import os
import argparse
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

def build_densenet_model(input_shape=(224, 224, 3), num_classes=7):
    inputs = keras.Input(shape=input_shape)
    base_model = keras.applications.DenseNet121(
        input_shape=input_shape,
        include_top=False,
        weights="imagenet"
    )
    base_model.trainable = False

    x = keras.applications.densenet.preprocess_input(inputs)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(256, activation="relu")(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="predictions")(x)

    model = keras.Model(inputs, outputs, name="DenseNet121_LesionClassifier")
    return model

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", type=str, default="ml/data/splits")
    parser.add_argument("--output_model", type=str, default="ml/models/densenet121-v1.keras")
    args = parser.parse_args()
    print("Initializing DenseNet121...")
    model = build_densenet_model()
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    print(f"DenseNet121 architecture compiled. Save path: {args.output_model}")

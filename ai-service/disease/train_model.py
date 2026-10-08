"""
train_model.py
================
Module: Crop Disease Detection - CNN training script.

The paper specifies a "pre-trained Convolutional Neural Network (CNN)".
We use transfer learning on MobileNetV2 (pretrained on ImageNet) + a small
custom classifier head trained on the PlantVillage dataset.

HOW TO TRAIN:
1. Download PlantVillage from Kaggle:
   https://www.kaggle.com/datasets/emmarex/plantdisease
2. Place the class folders inside ai-service/disease/dataset/, e.g.:
       ai-service/disease/dataset/Tomato___Early_blight/
       ai-service/disease/dataset/Tomato___healthy/
       ...
3. Run:  python disease/train_model.py
   This saves plant_disease_model.h5 + class_names.json.
4. Restart main.py - predict.py automatically loads your trained model.
"""

import os
import json
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
MODEL_PATH = os.path.join(BASE_DIR, "plant_disease_model.h5")
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "class_names.json")

IMG_SIZE = (160, 160)
BATCH_SIZE = 32
EPOCHS = 8


def build_model(num_classes: int):
    base_model = MobileNetV2(input_shape=IMG_SIZE + (3,), include_top=False, weights="imagenet")
    base_model.trainable = False  # freeze pretrained layers (transfer learning)

    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(128, activation="relu"),
        layers.Dropout(0.3),
        layers.Dense(num_classes, activation="softmax"),
    ])

    model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
    return model


def train():
    if not os.path.exists(DATASET_DIR):
        raise FileNotFoundError(
            f"Dataset folder not found at {DATASET_DIR}.\n"
            "Download PlantVillage from Kaggle and place the class folders "
            "inside ai-service/disease/dataset/ before running this script."
        )

    datagen = ImageDataGenerator(
        rescale=1.0 / 255, validation_split=0.2, rotation_range=15, horizontal_flip=True,
    )

    train_gen = datagen.flow_from_directory(
        DATASET_DIR, target_size=IMG_SIZE, batch_size=BATCH_SIZE,
        subset="training", class_mode="categorical"
    )
    val_gen = datagen.flow_from_directory(
        DATASET_DIR, target_size=IMG_SIZE, batch_size=BATCH_SIZE,
        subset="validation", class_mode="categorical"
    )

    class_names = list(train_gen.class_indices.keys())
    print(f"Found {len(class_names)} classes: {class_names}")

    model = build_model(num_classes=len(class_names))
    model.fit(train_gen, validation_data=val_gen, epochs=EPOCHS)

    model.save(MODEL_PATH)
    with open(CLASS_NAMES_PATH, "w") as f:
        json.dump(class_names, f)

    print(f"Model saved to {MODEL_PATH}")


if __name__ == "__main__":
    train()

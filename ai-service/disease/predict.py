"""
predict.py
==========
Crop Disease Detection prediction logic.

Uses the trained MobileNetV2 model to identify the crop/disease and
returns structured information for the frontend.
"""

import os
import json
import random
import numpy as np
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "plant_disease_model.h5")
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "class_names.json")

IMG_SIZE = (160, 160)

_model = None
_class_names = None


# -------------------------------------------------------------------
# Disease information
# -------------------------------------------------------------------

DISEASE_INFO = {
    "Pepper_bell__Bacterial_spot": {
        "crop": "Pepper Bell",
        "disease": "Bacterial Spot",
        "symptoms": "Small dark brown or black spots may appear on leaves and fruit.",
        "action": "Remove severely affected leaves and fruits. Avoid handling plants when they are wet.",
        "prevention": "Use clean planting material, maintain good spacing and avoid overhead watering."
    },

    "Pepper_bell__healthy": {
        "crop": "Pepper Bell",
        "disease": "Healthy",
        "symptoms": "No major disease symptoms were identified by the model.",
        "action": "Continue normal crop care and monitor the plant regularly.",
        "prevention": "Maintain appropriate watering, nutrition, spacing and field hygiene."
    },

    "Potato___Early_blight": {
        "crop": "Potato",
        "disease": "Early Blight",
        "symptoms": "Dark lesions can develop on leaves, often with characteristic concentric ring patterns.",
        "action": "Remove badly affected foliage and avoid prolonged leaf wetness.",
        "prevention": "Maintain good field sanitation, adequate spacing and balanced crop nutrition."
    },

    "Potato___healthy": {
        "crop": "Potato",
        "disease": "Healthy",
        "symptoms": "No major disease symptoms were identified by the model.",
        "action": "Continue normal potato crop management and regularly inspect the plants.",
        "prevention": "Maintain good field hygiene, proper irrigation and balanced nutrition."
    },

    "Potato___Late_blight": {
        "crop": "Potato",
        "disease": "Late Blight",
        "symptoms": "Dark water-soaked lesions may develop on leaves and can spread rapidly under favorable conditions.",
        "action": "Remove severely affected plant material and avoid prolonged leaf wetness.",
        "prevention": "Improve air circulation, monitor weather conditions and use disease-management practices recommended locally."
    },

    "Tomato_Bacterial_spot": {
        "crop": "Tomato",
        "disease": "Bacterial Spot",
        "symptoms": "Small dark spots may occur on leaves, stems and fruit.",
        "action": "Remove severely affected plant material and avoid working with wet plants.",
        "prevention": "Use clean planting material, maintain spacing and avoid overhead irrigation."
    },

    "Tomato_Early_blight": {
        "crop": "Tomato",
        "disease": "Early Blight",
        "symptoms": "Dark leaf lesions may develop, sometimes showing concentric ring patterns.",
        "action": "Remove severely affected leaves and improve airflow around plants.",
        "prevention": "Maintain field sanitation, adequate spacing and avoid prolonged leaf wetness."
    },

    "Tomato_Late_blight": {
        "crop": "Tomato",
        "disease": "Late Blight",
        "symptoms": "Dark, water-soaked-looking lesions can appear on leaves and other plant parts.",
        "action": "Remove severely affected plant material and reduce prolonged moisture on foliage.",
        "prevention": "Maintain good airflow and monitor plants carefully during cool, wet conditions."
    },

    "Tomato_Leaf_Mold": {
        "crop": "Tomato",
        "disease": "Leaf Mold",
        "symptoms": "Yellowish areas may appear on the upper leaf surface with mold-like growth on the underside.",
        "action": "Remove badly affected leaves and improve ventilation around the plants.",
        "prevention": "Reduce excessive humidity and provide adequate spacing and airflow."
    },

    "Tomato_Septoria_leaf_spot": {
        "crop": "Tomato",
        "disease": "Septoria Leaf Spot",
        "symptoms": "Small circular leaf spots may develop, often with darker margins.",
        "action": "Remove severely affected lower leaves and maintain good field hygiene.",
        "prevention": "Avoid prolonged leaf wetness and improve airflow between plants."
    },

    "Tomato_Spider_mites_Two_spotted_spider_mite": {
        "crop": "Tomato",
        "disease": "Two-Spotted Spider Mite",
        "symptoms": "Fine speckling or yellowing can occur on leaves, sometimes accompanied by fine webbing.",
        "action": "Inspect the undersides of leaves and use an appropriate locally recommended mite-management method.",
        "prevention": "Regularly monitor plants and avoid conditions that encourage mite outbreaks."
    },

    "Tomato_Target_Spot": {
        "crop": "Tomato",
        "disease": "Target Spot",
        "symptoms": "Circular brown lesions may develop on leaves and can show target-like patterns.",
        "action": "Remove severely affected foliage and reduce prolonged moisture on leaves.",
        "prevention": "Improve airflow, maintain field sanitation and avoid unnecessary leaf wetness."
    },

    "Tomato_Tomato_YellowLeaf_Curl_Virus": {
        "crop": "Tomato",
        "disease": "Tomato Yellow Leaf Curl Virus",
        "symptoms": "Leaves may curl upward and show yellowing, with affected plants often showing stunted growth.",
        "action": "Remove severely affected plants where appropriate and control insect vectors according to local agricultural guidance.",
        "prevention": "Monitor and manage whiteflies and use healthy planting material."
    },

    "Tomato_Tomato_mosaic_virus": {
        "crop": "Tomato",
        "disease": "Tomato Mosaic Virus",
        "symptoms": "Leaves may develop mottled light and dark green patterns and growth may become affected.",
        "action": "Remove severely affected plants and avoid spreading plant sap between plants.",
        "prevention": "Use clean tools and planting material and maintain good field hygiene."
    },

    "Tomato_healthy": {
        "crop": "Tomato",
        "disease": "Healthy",
        "symptoms": "No major disease symptoms were identified by the model.",
        "action": "Continue normal tomato crop care and monitor the plant regularly.",
        "prevention": "Maintain appropriate watering, nutrition, spacing and field hygiene."
    },
}


# -------------------------------------------------------------------
# Model loading
# -------------------------------------------------------------------

def _load_model():
    global _model, _class_names

    if _model is not None:
        return

    if os.path.exists(MODEL_PATH) and os.path.exists(CLASS_NAMES_PATH):
        import tensorflow as tf

        _model = tf.keras.models.load_model(MODEL_PATH)

        with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
            _class_names = json.load(f)

        print("Loaded trained disease detection model.")

    else:
        print(
            "No trained model found - running disease detection in DEMO mode. "
            "See disease/train_model.py to train a real model."
        )


# -------------------------------------------------------------------
# Helper functions
# -------------------------------------------------------------------

def _clean_class_name(class_name: str) -> str:
    """
    Convert PlantVillage class names into a readable format.
    """
    return (
        class_name
        .replace("___", " - ")
        .replace("__", " - ")
        .replace("_", " ")
    )


def _get_disease_info(class_name: str) -> dict:
    """
    Return detailed information for a known PlantVillage class.
    Handles minor differences in underscores/capitalization.
    """

    class_name = class_name.strip()

    # First try exact match
    if class_name in DISEASE_INFO:
        return DISEASE_INFO[class_name]

    # Try normalized match
    normalized = class_name.replace("___", "__").lower()

    for key, info in DISEASE_INFO.items():
        if key.replace("___", "__").lower() == normalized:
            return info

    # Fallback: derive crop and disease directly from the class name
    readable_name = _clean_class_name(class_name)

    if "__" in class_name:
        crop_part, disease_part = class_name.split("__", 1)

        crop = crop_part.replace("_", " ").strip()
        disease = disease_part.replace("_", " ").strip()

        return {
            "crop": crop.title(),
            "disease": disease.title(),
            "symptoms": (
                "The trained model identified this disease class "
                "based on similarity to images in its training data."
            ),
            "action": (
                "Inspect the affected leaves carefully and consult "
                "a local agriculture expert before applying treatment."
            ),
            "prevention": (
                "Maintain good crop hygiene, appropriate spacing, "
                "proper irrigation and regular plant monitoring."
            )
        }

    return {
        "crop": "Unknown",
        "disease": readable_name,
        "symptoms": (
            "The trained model identified this class, but detailed "
            "crop information has not been configured yet."
        ),
        "action": (
            "Please consult a local agriculture expert before "
            "applying treatment."
        ),
        "prevention": (
            "Maintain good crop hygiene and regularly monitor the plant."
        )
    }


# -------------------------------------------------------------------
# Main prediction function
# -------------------------------------------------------------------

def predict_disease(image_path: str) -> dict:
    _load_model()

    # ---------------------------------------------------------------
    # REAL TRAINED MODEL
    # ---------------------------------------------------------------

    if _model is not None:

        img = (
            Image.open(image_path)
            .convert("RGB")
            .resize(IMG_SIZE)
        )

        img_array = np.array(img, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        predictions = _model.predict(img_array, verbose=0)[0]

        best_idx = int(np.argmax(predictions))
        confidence = float(predictions[best_idx])

        class_name = _class_names[best_idx]

        info = _get_disease_info(class_name)

        # Generic explanation based on the classifier result.
        # This deliberately does NOT claim that the model can explain
        # individual pixels or symptoms.
        if info["disease"].lower() == "healthy":
            why_detected = (
                "The trained model classified the visible leaf patterns "
                "as being most similar to healthy examples in its training data."
            )
        else:
            why_detected = (
                f"The trained model classified the visible leaf patterns "
                f"as being most similar to {info['disease']} examples "
                f"in its training data."
            )

        return {
            "success": True,
            "crop": info["crop"],
            "disease": info["disease"],
            "confidence": round(confidence, 3),
            "confidence_percent": round(confidence * 100, 1),

            "symptoms": info["symptoms"],
            "why_detected": why_detected,

            "recommendation": info["action"],
            "prevention": info["prevention"],

            "model": "MobileNetV2 - PlantVillage",
            "class_name": class_name,
        }

    # ---------------------------------------------------------------
    # DEMO MODE
    # ---------------------------------------------------------------

    demo_classes = [
        "Tomato_healthy",
        "Tomato_Early_blight",
        "Tomato_Late_blight",
        "Potato___Early_blight",
        "Potato___Late_blight",
        "Pepper_bell__Bacterial_spot",
    ]

    class_name = random.choice(demo_classes)
    confidence = round(random.uniform(0.75, 0.97), 3)

    info = _get_disease_info(class_name)

    return {
        "success": True,
        "crop": info["crop"],
        "disease": info["disease"],
        "confidence": confidence,
        "confidence_percent": round(confidence * 100, 1),

        "symptoms": info["symptoms"],
        "why_detected": (
            "This result is generated in DEMO mode because a trained "
            "disease model is not currently available."
        ),

        "recommendation": info["action"],
        "prevention": info["prevention"],

        "model": "Demo mode",
        "class_name": class_name,
    }
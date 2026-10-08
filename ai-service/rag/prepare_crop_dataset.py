"""
prepare_crop_dataset.py
=========================
Converts the Kaggle "Crop Recommendation Dataset" (numeric N/P/K, temperature,
humidity, pH, rainfall -> crop label rows) into the same question/answer CSV
format used by the rest of the RAG knowledge base, so it can be indexed by
build_index.py alongside the Farmers' Call Query Dataset.

This directly matches the paper's Dataset section:
  "Crop Recommendation Dataset has details like nitrogen, phosphorus,
   potassium, pH, temperature, humidity and rainfall for crop
   recommendation ... The RAG pipeline indexes these datasets."

HOW TO USE:
1. Download the dataset from Kaggle:
   https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset
2. Save the raw file as ai-service/data/crop_recommendation_raw.csv
   (it should have columns: N, P, K, temperature, humidity, ph, rainfall, label)
3. Run:
       python rag/prepare_crop_dataset.py
   This creates ai-service/data/crop_recommendation_qa.csv
4. In rag/build_index.py, uncomment the crop_recommendation_qa.csv line in
   CSV_FILES, then re-run: python rag/build_index.py
"""

import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

RAW_PATH = os.path.join(DATA_DIR, "crop_recommendation_raw.csv")
OUTPUT_PATH = os.path.join(DATA_DIR, "crop_recommendation_qa.csv")


def build_qa_rows():
    if not os.path.exists(RAW_PATH):
        raise FileNotFoundError(
            f"Raw dataset not found at {RAW_PATH}.\n"
            "Download it from https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset "
            "and save it as ai-service/data/crop_recommendation_raw.csv first."
        )

    df = pd.read_csv(RAW_PATH)

    # Average out the numeric conditions per crop label, so each crop becomes
    # one clean, readable Q&A entry instead of thousands of raw rows.
    grouped = df.groupby("label").mean(numeric_only=True).reset_index()

    rows = []
    for _, row in grouped.iterrows():
        crop = row["label"].title()
        question = f"What are the ideal soil and climate conditions for growing {crop}?"
        answer = (
            f"For {crop}, the ideal conditions are approximately: "
            f"Nitrogen {row['N']:.0f} kg/ha, Phosphorus {row['P']:.0f} kg/ha, "
            f"Potassium {row['K']:.0f} kg/ha, temperature {row['temperature']:.1f}°C, "
            f"humidity {row['humidity']:.1f}%, soil pH {row['ph']:.1f}, "
            f"and rainfall around {row['rainfall']:.0f} mm."
        )
        rows.append({"question": question, "answer": answer, "category": "crop_recommendation"})

    qa_df = pd.DataFrame(rows)
    qa_df.to_csv(OUTPUT_PATH, index=False)
    print(f"Created {len(qa_df)} Q&A entries -> {OUTPUT_PATH}")


if __name__ == "__main__":
    build_qa_rows()

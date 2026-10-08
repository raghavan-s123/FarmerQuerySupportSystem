"""
build_index.py
================
Builds a FAISS vector index from our farming knowledge base CSV files.
This is the "R" (Retrieval) part of RAG (Retrieval Augmented Generation)
described in the paper's Methodology: "The system converts user query to
vector embedding and performs similarity search on FAISS vector database of
agricultural documents and datasets from Kaggle."

DATASETS USED (see docs/DATASETS.md for full details):
  1. knowledge_base.csv          - bootstrap sample (works out of the box)
  2. kcc_dataset.csv              - Farmers' Call Query Dataset (Kaggle)
  3. crop_recommendation_qa.csv   - Crop Recommendation Dataset (Kaggle),
                                     converted to Q&A by prepare_crop_dataset.py

Run this file once before starting main.py, and again any time you add /
update a CSV in data/:
    python rag/build_index.py
"""

import os
import pandas as pd
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
VECTORSTORE_DIR = os.path.join(BASE_DIR, "vectorstore")

CSV_FILES = [
    os.path.join(DATA_DIR, "knowledge_base.csv"),

    # Farmers' Call Query Dataset (Kaggle) - see docs/DATASETS.md to download,
    # then rename its columns to "question"/"answer" and save it here.
    os.path.join(DATA_DIR, "kcc_dataset.csv"),

    # Crop Recommendation Dataset (Kaggle) - run rag/prepare_crop_dataset.py
    # first to generate this file from the raw Kaggle CSV.
    os.path.join(DATA_DIR, "crop_recommendation_qa.csv"),
]

EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"  # small, fast, free sentence-transformer model


def load_documents():
    """Reads every CSV in CSV_FILES (skipping ones that don't exist yet) and
    turns each row into a text 'document' for embedding."""
    documents = []
    metadata = []

    for csv_path in CSV_FILES:
        if not os.path.exists(csv_path):
            print(f"Skipping missing file (optional dataset not added yet): {csv_path}")
            continue

        df = pd.read_csv(csv_path)
        df = df.dropna(subset=["question", "answer"])

        for _, row in df.iterrows():
            text = f"Q: {row['question']}\nA: {row['answer']}"
            documents.append(text)
            metadata.append({
                "question": row["question"],
                "answer": row["answer"],
                "category": row.get("category", "general"),
                "source": os.path.basename(csv_path),
            })

    return documents, metadata


def build_and_save_index():
    print("Loading documents...")
    documents, metadata = load_documents()
    print(f"Loaded {len(documents)} documents.")

    if len(documents) == 0:
        raise RuntimeError("No documents found. Add data to ai-service/data/ first.")

    print("Loading embedding model (downloads once, then cached)...")
    model = SentenceTransformer(EMBEDDING_MODEL_NAME)

    print("Creating embeddings...")
    embeddings = model.encode(documents, show_progress_bar=True, convert_to_numpy=True)
    embeddings = np.array(embeddings).astype("float32")

    faiss.normalize_L2(embeddings)  # normalize for cosine similarity search

    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)

    os.makedirs(VECTORSTORE_DIR, exist_ok=True)
    faiss.write_index(index, os.path.join(VECTORSTORE_DIR, "faiss_index.bin"))

    meta_df = pd.DataFrame(metadata)
    meta_df["document"] = documents
    meta_df.to_csv(os.path.join(VECTORSTORE_DIR, "metadata.csv"), index=False)

    print(f"Index built successfully with {index.ntotal} vectors.")
    print(f"Saved to: {VECTORSTORE_DIR}")


if __name__ == "__main__":
    build_and_save_index()

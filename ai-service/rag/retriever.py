"""
retriever.py
=============
Loads the FAISS index built by build_index.py and searches for the most
relevant farming knowledge chunks for a given (English) query.
Used inside the LangGraph pipeline (graph/agent_graph.py) as the
"retrieve" step of RAG.
"""

import os
import pandas as pd
import faiss
from sentence_transformers import SentenceTransformer

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VECTORSTORE_DIR = os.path.join(BASE_DIR, "vectorstore")
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"


class KnowledgeRetriever:
    """Simple wrapper around a FAISS index + metadata table."""

    def __init__(self):
        index_path = os.path.join(VECTORSTORE_DIR, "faiss_index.bin")
        metadata_path = os.path.join(VECTORSTORE_DIR, "metadata.csv")

        if not os.path.exists(index_path) or not os.path.exists(metadata_path):
            raise FileNotFoundError(
                "Vector index not found. Run 'python rag/build_index.py' first "
                "to build the knowledge base index."
            )

        self.index = faiss.read_index(index_path)
        self.metadata = pd.read_csv(metadata_path)
        self.model = SentenceTransformer(EMBEDDING_MODEL_NAME)

    def retrieve(self, query: str, top_k: int = 3):
        query_embedding = self.model.encode([query], convert_to_numpy=True).astype("float32")
        faiss.normalize_L2(query_embedding)

        scores, indices = self.index.search(query_embedding, top_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            row = self.metadata.iloc[idx]
            results.append({
                "question": row["question"],
                "answer": row["answer"],
                "category": row.get("category", "general"),
                "source": row.get("source", "knowledge_base.csv"),
                "score": float(score),
            })
        return results


_retriever_instance = None


def get_retriever() -> KnowledgeRetriever:
    global _retriever_instance
    if _retriever_instance is None:
        _retriever_instance = KnowledgeRetriever()
    return _retriever_instance

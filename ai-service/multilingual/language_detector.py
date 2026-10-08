"""
language_detector.py
======================
Module: Multilingual Query Interface / Voice Query Assistant
("BERT is used to get the context of what the user is speaking" - paper's
module table).

We use a BERT-family transformer model (XLM-RoBERTa, part of the same
encoder-model family as BERT, fine-tuned specifically for language
identification) to detect which language the farmer typed or spoke in
(English, Tamil, Telugu, or others). This lets the multilingual pipeline
decide whether translation is needed before the query reaches the RAG
chatbot.

Model used: papluca/xlm-roberta-base-language-detection (HuggingFace)
- Downloads automatically the first time you run the app (~1.1 GB, cached
  afterwards in ~/.cache/huggingface).
"""

from functools import lru_cache
from transformers import pipeline

MODEL_NAME = "papluca/xlm-roberta-base-language-detection"

# Maps the model's ISO codes to the friendly language names used elsewhere
# in this project (matches the languages supported by the paper: Tamil,
# Telugu, English).
SUPPORTED_LANGUAGES = {
    "en": "English",
    "ta": "Tamil",
    "te": "Telugu",
    "hi": "Hindi",
}


@lru_cache(maxsize=1)
def _get_pipeline():
    """Loads the BERT-family language detection model once and reuses it
    for every request (loading it fresh each time would be very slow)."""
    return pipeline("text-classification", model=MODEL_NAME)


def detect_language(text: str) -> dict:
    """
    Detects the language of a piece of text.

    Returns:
        {
          "code": "ta",              # ISO language code
          "name": "Tamil",           # friendly name (falls back to the raw code)
          "confidence": 0.98
        }
    """
    if not text or not text.strip():
        return {"code": "en", "name": "English", "confidence": 0.0}

    classifier = _get_pipeline()
    result = classifier(text[:512])[0]  # truncate very long text for speed

    code = result["label"]
    return {
        "code": code,
        "name": SUPPORTED_LANGUAGES.get(code, code),
        "confidence": round(float(result["score"]), 3),
    }

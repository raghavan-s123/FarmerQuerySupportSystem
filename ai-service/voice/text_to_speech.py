"""
text_to_speech.py
====================
Module: Voice Query Assistant (Text-to-Speech part).

Converts the AI's final (already-translated) answer back into a spoken
audio file using gTTS - works for English, Tamil and Telugu.
"""

from gtts import gTTS
import os
import uuid

AUDIO_OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "voice_outputs")

LANGUAGE_CODES = {
    "english": "en",
    "tamil": "ta",
    "telugu": "te",
    "hindi": "hi",
}


def synthesize_speech(text: str, language: str = "English") -> str:
    """Generates an MP3 file from text and returns its file path."""
    os.makedirs(AUDIO_OUTPUT_DIR, exist_ok=True)
    lang_code = LANGUAGE_CODES.get(language.lower(), "en")

    tts = gTTS(text=text, lang=lang_code, slow=False)
    file_name = f"{uuid.uuid4()}.mp3"
    file_path = os.path.join(AUDIO_OUTPUT_DIR, file_name)
    tts.save(file_path)

    return file_path

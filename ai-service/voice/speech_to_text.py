"""
speech_to_text.py
===================
Module: Voice Query Assistant (Speech-to-Text part).

Converts a farmer's spoken audio question into text using Google's free
Speech Recognition API. Supports English, Tamil and Telugu locales so a
farmer can literally speak in their own language.
"""

import speech_recognition as sr
from pydub import AudioSegment
import os
import tempfile

# Locale codes Google's speech API understands for each supported language
LOCALE_CODES = {
    "english": "en-IN",
    "tamil": "ta-IN",
    "telugu": "te-IN",
    "hindi": "hi-IN",
    "auto": "en-IN",  # best-effort default when the farmer hasn't picked a language
}


def transcribe_audio(audio_file_path: str, language: str = "auto") -> str:
    """Converts an audio file (wav/mp3/ogg) into text."""
    print(f"[STT] Processing audio: {audio_file_path}, language: {language}")
    recognizer = sr.Recognizer()
    locale_code = LOCALE_CODES.get(language.lower(), "en-IN")

    wav_path = audio_file_path
    if not audio_file_path.lower().endswith(".wav"):
        sound = AudioSegment.from_file(audio_file_path)
        print(f"[STT] Duration: {sound.duration_seconds:.2f}s")
        print(f"[STT] Audio level: {sound.dBFS:.2f} dBFS")

        # Convert browser audio to a standard format for speech recognition:
        # mono channel, 16 kHz sample rate, 16-bit PCM WAV.
        sound = sound.set_channels(1)
        sound = sound.set_frame_rate(16000)
        sound = sound.set_sample_width(2)

        wav_path = tempfile.mktemp(suffix=".wav")
        sound.export(wav_path, format="wav")

    with sr.AudioFile(wav_path) as source:
        audio_data = recognizer.record(source)

    try:
        text = recognizer.recognize_google(audio_data, language=locale_code)
    except sr.UnknownValueError:
        print("[STT] Google Speech Recognition could not understand the audio.")
        text = ""
    except sr.RequestError as e:
        print(f"[STT] Google Speech Recognition request error: {e}")
        text = ""
    finally:
        if wav_path != audio_file_path and os.path.exists(wav_path):
            os.remove(wav_path)

    return text

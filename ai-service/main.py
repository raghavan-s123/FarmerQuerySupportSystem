"""
main.py
========
Entry point of the Python AI microservice (LangGraph + RAG + Groq + CNN +
Multilingual pipeline).

Run with:
    uvicorn main:app --reload --port 8000

Endpoints:
    POST /ask                -> AI Chat with RAG (multilingual)
    POST /voice-query        -> Voice Query Assistant (STT -> multilingual RAG -> TTS)
    POST /predict-disease    -> Crop Disease Detection (CNN)
    GET  /health              -> health check
"""

import os
import shutil
import tempfile
import uuid

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from graph.agent_graph import ask_agent
from voice.speech_to_text import transcribe_audio
from voice.text_to_speech import synthesize_speech
from disease.predict import predict_disease

app = FastAPI(title="AI-Based Farmer Advisory System - AI Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

VOICE_OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "voice_outputs")
os.makedirs(VOICE_OUTPUT_DIR, exist_ok=True)
app.mount("/voice_outputs", StaticFiles(directory=VOICE_OUTPUT_DIR), name="voice_outputs")


class AskRequest(BaseModel):
    question: str
    language: str = "auto"  # "auto", or an explicit choice like "Tamil"
    # Recent turns of THIS chat, e.g. [{"question": "...", "answer": "..."}].
    # Passed in by the Socket.IO chat handler (ChatSocketService.java) so the
    # LLM has memory/context of the ongoing conversation.
    history: list = []


# ---------------------------------------------------------
# AI Chat with RAG + Multilingual Query Interface
# ---------------------------------------------------------
@app.post("/ask")
def ask(request: AskRequest):
    """
    Full pipeline: detect language -> translate to English -> FAISS RAG
    retrieval -> Groq Llama answer (with conversation memory) -> translate
    back to farmer's language.
    """
    result = ask_agent(question=request.question, language=request.language, history=request.history)
    return result
    # { detected_language, translated_question, answer_english, final_answer, sources }


# ---------------------------------------------------------
# Voice Query Assistant
# ---------------------------------------------------------
@app.post("/voice-query")
async def voice_query(file: UploadFile = File(...), language: str = Form("auto")):
    """
    1. Save uploaded audio temporarily
    2. Speech-to-Text (locale depends on chosen/auto language)
    3. Run the same multilingual RAG agent used by /ask
    4. Text-to-Speech the final (translated) answer
    """
    suffix = os.path.splitext(file.filename)[1] or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        transcribed_text = transcribe_audio(tmp_path, language=language)

        if not transcribed_text:
            return {
                "transcribed_text": "",
                "detected_language": None,
                "translated_question": None,
                "answer_english": None,
                "final_answer": "Sorry, I could not understand the audio. Please try again.",
                "audio_url": None,
            }

        agent_result = ask_agent(question=transcribed_text, language=language)

        # Speak the answer back in the farmer's language (fallback to English)
        speech_language = agent_result["detected_language"] or "English"
        audio_path = synthesize_speech(agent_result["final_answer"], language=speech_language)
        audio_filename = os.path.basename(audio_path)

        return {
            "transcribed_text": transcribed_text,
            "detected_language": agent_result["detected_language"],
            "translated_question": agent_result["translated_question"],
            "answer_english": agent_result["answer_english"],
            "final_answer": agent_result["final_answer"],
            "audio_url": f"/voice_outputs/{audio_filename}",
        }
    finally:
        os.remove(tmp_path)


# ---------------------------------------------------------
# Crop Disease Detection
# ---------------------------------------------------------
@app.post("/predict-disease")
async def predict_disease_endpoint(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename)[1] or ".jpg"
    tmp_path = os.path.join(tempfile.gettempdir(), f"{uuid.uuid4()}{suffix}")

    with open(tmp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        result = predict_disease(tmp_path)
        return result
    finally:
        os.remove(tmp_path)


@app.get("/health")
def health():
    return {"status": "AI service running"}

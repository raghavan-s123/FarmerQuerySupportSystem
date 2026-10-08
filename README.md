# AI-Based Farmer Advisory System with Multilingual Support

A full-stack final-year project matching the reference conference paper's
architecture: a **multilingual RAG chatbot** (English / Tamil / Telugu), a
**pre-trained CNN** for crop disease detection, and **real-time Socket.IO
chat** between farmers and agriculture experts with persisted chat history.

Built with **React**, **Spring Boot**, **MySQL**, **Socket.IO**, and a
**Python AI microservice** using **LangGraph + RAG + Groq + BERT**.

---

##  Architecture

```
┌────────────────┐   REST (JSON/JWT, :8080)     ┌────────────────────┐
│  React Frontend │ ────────────────────────────▶│   Spring Boot API   │
│  (port 3000)    │◀──────────────────────────── │   (port 8080)       │
└────────────────┘                               └──────────┬──────────┘
                                                              │
                                                     REST (WebClient)
                                                              │
                                                   ┌──────────▼──────────┐
                                                   │  Python AI Service   │
                                                   │  FastAPI (:8000)     │
                                                   │                      │
                                                   │  ┌────────────────┐  │
                                                   │  │ LangGraph      │  │
                                                   │  │ pipeline:      │  │
                                                   │  │ 1. BERT lang   │  │
                                                   │  │    detection   │  │
                                                   │  │ 2. Translate   │  │
                                                   │  │    -> English  │  │
                                                   │  │ 3. FAISS RAG   │  │
                                                   │  │    retrieval   │  │
                                                   │  │ 4. Groq Llama  │  │
                                                   │  │    generation  │  │
                                                   │  │    (with chat  │  │
                                                   │  │    memory)     │  │
                                                   │  │ 5. Translate   │  │
                                                   │  │    back        │  │
                                                   │  └────────────────┘  │
                                                   └──────────────────────┘

MySQL stores everything persistently: users, farm profiles, AI chat history
(with full multilingual trail), disease scans, expert chat messages,
weather logs, market prices, schemes and notifications.
```

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Axios |
| Backend | Spring Boot 3 (Web, Data JPA, Security, WebFlux), JWT auth, MySQL |
| AI orchestration | **LangGraph** (state-graph pipeline), **LangChain** ecosystem |
| RAG | **FAISS** vector search + Sentence-Transformer embeddings over Kaggle agricultural datasets |
| LLM | **Groq** (Llama 3.3 70B), with conversation memory (recent chat turns passed as context) |
| Multilingual | **BERT-family model** (XLM-RoBERTa) for language detection + Translation API (English / Tamil / Telugu) |
| Disease detection | **Pre-trained CNN** (MobileNetV2 transfer learning) |
| Voice | SpeechRecognition (STT) + gTTS (TTS), Tamil/Telugu/English locales |
| Database | MySQL |

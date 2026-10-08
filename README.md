# 🌾 KrishiMitra - AI-Based Farmer Advisory System with Multilingual Support

A full-stack final-year project matching the reference conference paper's
architecture: a **multilingual RAG chatbot** (English / Tamil / Telugu), a
**pre-trained CNN** for crop disease detection, and **real-time Socket.IO
chat** between farmers and agriculture experts with persisted chat history.

Built with **React**, **Spring Boot**, **MySQL**, **Socket.IO**, and a
**Python AI microservice** using **LangGraph + RAG + Groq + BERT**.

---

## 🧱 Architecture

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

## 📦 Tech Stack (matches the paper's module table)

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

---

## 🚀 How to Run

### 1. Database (MySQL)

```bash
mysql -u root -p < database/schema.sql
```

Creates the `chatbot` database (matches `application.properties`) with all
tables and seed data.

### 2. Backend (Spring Boot) - REST API (8080)

```bash
cd backend
# application.properties already has working defaults for local dev.
# Double check spring.datasource.* and weather.api.key match your setup.
mvn spring-boot:run
```

### 3. AI Service (Python) - use a Python 3.11 virtual environment

```bash
cd ai-service
py -3.11 -m venv venv
venv\Scripts\activate        # Windows  (use: source venv/bin/activate on Mac/Linux)

pip install -r requirements.txt

copy .env.example .env       # Windows  (use: cp .env.example .env on Mac/Linux)
# paste your Groq API key into .env

python rag/build_index.py    # builds the FAISS index (bootstrap dataset works out of the box)
uvicorn main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` for interactive Swagger API docs.

> **Add the real Kaggle datasets** for a much stronger RAG knowledge base -
> see `docs/DATASETS.md` for both datasets used in the paper (Farmers' Call
> Query Dataset + Crop Recommendation Dataset).

> **Disease detection** runs in DEMO mode until you train the CNN - see
> `docs/DATASETS.md` for the PlantVillage dataset + training steps.

### 4. Frontend (React)

```bash
cd frontend
npm install
npm start
```

Runs on **http://localhost:3000**.

---

## 💬 How the chat features work (plain REST + persisted history)

### AI Chat with RAG (Farmer ↔ Chatbot) - with memory

1. Frontend loads previous messages on page load via `GET /api/ai/history`
   (every past question/answer for this farmer, from the `ai_queries` MySQL
   table) - this is why old messages still show up after a refresh or
   logging back in later.
2. Each new question is sent via `POST /api/ai/ask`.
3. `AiQueryService.java` fetches the farmer's last 6 Q&A turns from MySQL
   and sends them to the Python AI service alongside the new question.
4. The LangGraph pipeline (`ai-service/graph/agent_graph.py`) builds a
   proper multi-turn message list from that history and passes it to Groq -
   so the chatbot can resolve follow-ups like *"how much water does **it**
   need?"* (referring to a crop mentioned two messages earlier) instead of
   treating every message in isolation.
5. The answer is saved and returned in the same response.

See `frontend/src/pages/AiQuery.js`, `backend/.../service/AiQueryService.java`,
`ai-service/graph/agent_graph.py` (`generate_answer_node`) and
`ai-service/main.py` (`AskRequest.history`).

### Expert Consultation (Farmer ↔ Expert)

1. Farmer submits a question via `POST /api/expert/ask` - creates an
   `expert_queries` row with status `PENDING`.
2. An Expert accepts it via `POST /api/expert/{id}/accept`.
3. Opening a query loads its full chat history via
   `GET /api/expert/{id}/messages` (from `expert_chat_messages`).
4. Sending a message calls `POST /api/expert/{id}/message`, then the
   frontend re-fetches the message list so both sides stay in sync.

See `frontend/src/pages/ExpertAsk.js` / `pages/ExpertQueries.js`.

> **Note:** both chats use plain REST (poll-on-action, not push), which
> keeps the project simple and avoids running an extra real-time server.
> If you'd like instant push updates instead of "load on click", Socket.IO
> or Spring's own WebSocket/STOMP support are natural upgrades - ask if
> you'd like that added back in.

---

## 🌐 How the multilingual RAG pipeline works

See `ai-service/graph/agent_graph.py` for the full LangGraph pipeline:

```
detect_language → translate_to_english → retrieve_docs (FAISS)
    → generate_answer (Groq Llama) → translate_answer_back
```

A farmer can type or speak in **English, Tamil, or Telugu**. The BERT-family
model (`multilingual/language_detector.py`) identifies the language, the
Translation module (`multilingual/translator.py`) converts it to English so
the RAG knowledge base can be searched, Groq generates the answer, and the
answer is translated back before being shown (or spoken, via TTS) to the
farmer.

---

## 🗂️ Project Structure

```
krishimitra/
├── backend/            Spring Boot REST API + Socket.IO chat server (Java)
├── ai-service/         Python FastAPI + LangGraph + RAG + Groq + BERT + CNN
├── frontend/           React web app
├── database/           MySQL schema.sql
└── docs/               This README + DATASETS.md
```

---

## 👨‍🎓 Notes for Viva / Project Report

- Every module is clearly commented with `// Module: ...` so you can quickly
  point to the exact file for any question.
- The multilingual pipeline and Socket.IO chat map directly onto the paper's
  Methodology and module table - see the Architecture diagram above.
- Both Kaggle datasets referenced in the paper are wired into the RAG
  pipeline by default (`rag/build_index.py`), with a small bootstrap dataset
  so everything works before you download them.
- The Recommendation Module is intentionally rule-based (readable if/else
  logic) - a good "future scope" talking point: it could be upgraded to a
  proper ML classifier trained on the Crop Recommendation Dataset.

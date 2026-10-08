"""
agent_graph.py
================
This is the heart of the AI Chat with RAG + Multilingual Query Interface
modules. Implements the exact flow described in the paper's Methodology
section using LangGraph:

    detect_language -> translate_to_english -> retrieve_docs
        -> generate_answer -> translate_answer_back -> END

    1. detect_language:        BERT-family model identifies the farmer's
                                language (English / Tamil / Telugu / ...)
    2. translate_to_english:   if not English, translate the question
                                (Translation API) so the RAG pipeline -
                                whose knowledge base is in English - can use it
    3. retrieve_docs:          FAISS similarity search over vector embeddings
                                of the Kaggle agricultural datasets (RAG)
    4. generate_answer:        Groq's Llama model writes the answer using the
                                retrieved context (grounded, not hallucinated)
    5. translate_answer_back:  translate the English answer back into the
                                farmer's own language before it's returned

LangGraph lets us keep each step as its own clearly-named node operating on
a shared `AgentState`, which makes the whole multilingual RAG pipeline easy
to read, test and extend - exactly what the paper describes as combining
"Retrieval Augmented Generation, Convolutional Neural Network, LangChain"
into one system.
"""

import os
from typing import TypedDict
from dotenv import load_dotenv
from groq import Groq
from langgraph.graph import StateGraph, END

from rag.retriever import get_retriever
from multilingual.language_detector import detect_language
from multilingual.translator import translate_to_english, translate_from_english

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

groq_client = Groq(api_key=GROQ_API_KEY)


# ---------------------------------------------------------
# 1. Shared state that flows through every node in the graph
# ---------------------------------------------------------
class AgentState(TypedDict):
    original_question: str      # exactly what the farmer typed/spoke
    requested_language: str     # "auto", or a language the farmer explicitly picked
    detected_language_code: str # en / ta / te ...
    detected_language_name: str # English / Tamil / Telugu ...
    translated_question: str    # English version used for retrieval + LLM
    conversation_history: list  # [{"question": "...", "answer": "..."}, ...] - earlier
                                 # turns in THIS chat, used to give the LLM memory/context
    retrieved_docs: list
    answer_english: str
    final_answer: str           # answer translated back into farmer's language


# ---------------------------------------------------------
# 2. Nodes
# ---------------------------------------------------------
def detect_language_node(state: AgentState) -> AgentState:
    """Step 1: Figure out what language the farmer is using (BERT-family model)."""
    detection = detect_language(state["original_question"])
    state["detected_language_code"] = detection["code"]
    state["detected_language_name"] = detection["name"]
    return state


def translate_query_node(state: AgentState) -> AgentState:
    """Step 2: Translate a regional-language question into English for RAG."""
    state["translated_question"] = translate_to_english(
        state["original_question"], state["detected_language_code"]
    )
    return state


def retrieve_docs_node(state: AgentState) -> AgentState:
    """Step 3: RAG - retrieve relevant farming knowledge via FAISS similarity search."""
    retriever = get_retriever()
    state["retrieved_docs"] = retriever.retrieve(state["translated_question"], top_k=3)
    return state


def generate_answer_node(state: AgentState) -> AgentState:
    """Step 4: Ask the Groq LLM to answer using the retrieved context (in English),
    AND the recent conversation history so it can remember what was already
    discussed (e.g. "how much water does IT need?" referring to a crop the
    farmer mentioned two messages ago)."""

    context_text = "\n\n".join(
        [f"- Q: {d['question']}\n  A: {d['answer']}" for d in state["retrieved_docs"]]
    ) or "No matching knowledge base entries were found."

    system_prompt = (
        "You are an AI farming advisory assistant that helps Indian farmers with "
        "practical advice on crops, irrigation, fertilizers, pests, diseases and "
        "government schemes. Use the CONTEXT below when it is relevant. If the "
        "context does not fully answer the question, use your own general "
        "agricultural knowledge, but keep the answer simple, practical and short "
        "(4-6 sentences). Always answer in English - translation is handled separately. "
        "If PREVIOUS CONVERSATION is provided, use it to understand references like "
        "'it', 'that crop' or follow-up questions, and stay consistent with what you "
        "already told the farmer."
    )

    # Build a proper multi-turn message list so Groq sees the actual chat
    # history (not just a text blob) - this is what gives the chatbot memory.
    messages = [{"role": "system", "content": system_prompt}]

    for turn in state.get("conversation_history", [])[-6:]:
        if turn.get("question"):
            messages.append({"role": "user", "content": turn["question"]})
        if turn.get("answer"):
            messages.append({"role": "assistant", "content": turn["answer"]})

    current_prompt = f"CONTEXT (retrieved knowledge):\n{context_text}\n\nFARMER'S QUESTION:\n{state['translated_question']}"
    messages.append({"role": "user", "content": current_prompt})

    response = groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=messages,
        temperature=0.4,
        max_tokens=500,
    )

    state["answer_english"] = response.choices[0].message.content
    return state


def translate_answer_node(state: AgentState) -> AgentState:
    """Step 5: Translate the answer back into the farmer's own language."""
    # Prefer a language the farmer explicitly picked ("Tamil"); otherwise use
    # whatever we auto-detected from their question.
    target_language = state["requested_language"]
    if not target_language or target_language.lower() == "auto":
        target_language = state["detected_language_name"]

    state["final_answer"] = translate_from_english(state["answer_english"], target_language)
    return state


# ---------------------------------------------------------
# 3. Wire the nodes together into a graph
# ---------------------------------------------------------
def build_agent_graph():
    workflow = StateGraph(AgentState)

    workflow.add_node("detect_language", detect_language_node)
    workflow.add_node("translate_query", translate_query_node)
    workflow.add_node("retrieve_docs", retrieve_docs_node)
    workflow.add_node("generate_answer", generate_answer_node)
    workflow.add_node("translate_answer", translate_answer_node)

    workflow.set_entry_point("detect_language")
    workflow.add_edge("detect_language", "translate_query")
    workflow.add_edge("translate_query", "retrieve_docs")
    workflow.add_edge("retrieve_docs", "generate_answer")
    workflow.add_edge("generate_answer", "translate_answer")
    workflow.add_edge("translate_answer", END)

    return workflow.compile()


_compiled_graph = None


def get_agent_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_agent_graph()
    return _compiled_graph


def ask_agent(question: str, language: str = "auto", history: list = None) -> dict:
    """
    Convenience function used by main.py to run the whole multilingual RAG
    pipeline.

    `history` (optional): recent conversation turns for THIS farmer's chat,
    e.g. [{"question": "How do I grow rice?", "answer": "Rice needs..."}]
    Passing this gives the chatbot memory of the ongoing conversation instead
    of treating every message as a brand new, unrelated question.
    """
    graph = get_agent_graph()
    result = graph.invoke({
        "original_question": question,
        "requested_language": language,
        "detected_language_code": "",
        "detected_language_name": "",
        "translated_question": "",
        "conversation_history": history or [],
        "retrieved_docs": [],
        "answer_english": "",
        "final_answer": "",
    })
    return {
        "detected_language": result["detected_language_name"],
        "translated_question": result["translated_question"],
        "answer_english": result["answer_english"],
        "final_answer": result["final_answer"],
        "sources": [d["question"] for d in result["retrieved_docs"]],
    }

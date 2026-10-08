"""
translator.py
====================
Multilingual translation module.

Uses the Groq LLM to translate:
    - Tamil/Telugu farmer questions -> English
    - English AI answers -> Tamil/Telugu

This avoids depending on Google Translate's unofficial web endpoint.
"""

import os
from groq import Groq


LANGUAGE_CODES = {
    "english": "English",
    "tamil": "Tamil",
    "telugu": "Telugu",
    "hindi": "Hindi",
}


def _resolve_language(language: str) -> str:
    if not language:
        return "English"

    language_lower = language.lower().strip()
    return LANGUAGE_CODES.get(language_lower, language)


def _get_client():
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not configured.")

    return Groq(api_key=api_key)


def _get_model():
    return os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")


def _translate(text: str, source_language: str, target_language: str) -> str:
    if not text or not text.strip():
        return text

    source = _resolve_language(source_language)
    target = _resolve_language(target_language)

    if source.lower() == target.lower():
        return text

    client = _get_client()

    prompt = f"""
Translate the following text from {source} to {target}.

Rules:
- Preserve the exact meaning.
- Do not add explanations.
- Do not summarize.
- Do not answer the question.
- Return ONLY the translation.
- Preserve numbers, units, names, crop names, fertilizer names,
  chemical names and technical terms accurately.

Text:
{text}
""".strip()

    response = client.chat.completions.create(
        model=_get_model(),
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a precise multilingual translator "
                    "for an agricultural advisory application."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.1,
        max_tokens=1000,
    )

    return response.choices[0].message.content.strip()


def translate_to_english(text: str, source_language: str) -> str:
    """
    Translate a farmer's question into English.
    """
    source = _resolve_language(source_language)

    if source.lower() == "english" or not text.strip():
        return text

    try:
        return _translate(
            text,
            source_language=source,
            target_language="English",
        )
    except Exception as e:
        print(
            f"[translator] English translation failed, "
            f"using original text: {e}"
        )
        return text


def translate_from_english(text: str, target_language: str) -> str:
    """
    Translate the AI's English answer into the requested language.
    """
    target = _resolve_language(target_language)

    if target.lower() == "english" or not text.strip():
        return text

    try:
        return _translate(
            text,
            source_language="English",
            target_language=target,
        )
    except Exception as e:
        print(
            f"[translator] Back-translation failed, "
            f"returning English answer: {e}"
        )
        return text
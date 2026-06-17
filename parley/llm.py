"""llm.py — one client, any free provider.

Every provider below speaks the OpenAI chat-completions format, so a single
client works for all of them. Pick one in .env by setting LLM_BASE_URL,
LLM_API_KEY, and LLM_MODEL. Presets are listed in .env.example.

Defaults to Groq: free, no credit card, and the fastest free inference around.
"""

import os
from openai import OpenAI

# Read configuration from the environment (loaded from .env by app.py).
BASE_URL = os.getenv("LLM_BASE_URL", "https://api.groq.com/openai/v1")
API_KEY = os.getenv("LLM_API_KEY", "")
MODEL = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
SYSTEM_PROMPT = os.getenv(
    "LLM_SYSTEM_PROMPT",
    "You are Parley, a concise and friendly assistant.",
)

# Ollama runs locally and ignores the key, but the OpenAI client requires a
# non-empty string, so substitute a placeholder when none is set.
_client = OpenAI(base_url=BASE_URL, api_key=API_KEY or "not-needed")


def is_configured():
    """True if a key is set, or if we're pointed at a local Ollama server."""
    return bool(API_KEY) or "localhost" in BASE_URL or "127.0.0.1" in BASE_URL


def provider_label():
    """A short human-readable name for the active provider, for the UI."""
    if "groq.com" in BASE_URL:
        return "Groq"
    if "googleapis.com" in BASE_URL:
        return "Google Gemini"
    if "openrouter.ai" in BASE_URL:
        return "OpenRouter"
    if "localhost" in BASE_URL or "127.0.0.1" in BASE_URL:
        return "Ollama (local)"
    return "Custom"


def chat(history):
    """Send the conversation and return the assistant's reply.

    `history` is a list of {role, content} dicts (roles: 'user'/'assistant').
    The system prompt is prepended automatically.
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + history
    completion = _client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0.7,
    )
    return completion.choices[0].message.content.strip()

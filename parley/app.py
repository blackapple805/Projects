#!/usr/bin/env python3
"""Parley — a tiny self-hosted AI chat app that runs on any free LLM provider.

Routes:
  GET  /            -> the chat interface
  POST /api/chat    -> {messages: [...]} -> {reply: "..."}
  GET  /api/config  -> which provider/model is active (for the UI header)
"""

import os
from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv

load_dotenv()

import llm  # imported after load_dotenv so it sees the .env values

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/config")
def config():
    return jsonify(
        {
            "provider": llm.provider_label(),
            "model": llm.MODEL,
            "configured": llm.is_configured(),
        }
    )


@app.route("/api/chat", methods=["POST"])
def chat():
    if not llm.is_configured():
        return (
            jsonify(
                {
                    "error": "No API key set. Copy .env.example to .env and add a "
                    "free key (see the README). Default provider: Groq."
                }
            ),
            400,
        )

    data = request.get_json(silent=True) or {}
    messages = data.get("messages")
    if not isinstance(messages, list) or not messages:
        return jsonify({"error": "Send a 'messages' list."}), 400

    # Keep only the fields the model needs, and cap history so requests stay
    # small and fast (last 20 turns is plenty of context for a chat).
    clean = [
        {"role": m.get("role"), "content": m.get("content", "")}
        for m in messages
        if m.get("role") in ("user", "assistant") and m.get("content")
    ][-20:]

    try:
        reply = llm.chat(clean)
        return jsonify({"reply": reply})
    except Exception as e:
        # Surface a readable message instead of a 500 stack trace.
        return jsonify({"error": f"{type(e).__name__}: {e}"}), 502


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="127.0.0.1", port=port, debug=True)

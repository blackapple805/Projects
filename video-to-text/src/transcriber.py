"""Transcribe audio to text using OpenAI Whisper."""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

VALID_MODELS = {"tiny", "base", "small", "medium", "large", "turbo"}


@lru_cache(maxsize=2)
def _load_model(model_name: str):
    """Load (and cache) a Whisper model. Imported lazily so the rest of the
    package can be imported and tested without the heavy whisper/torch stack."""
    import whisper  # noqa: PLC0415  (intentional lazy import)

    return whisper.load_model(model_name)


def transcribe_audio(audio_path: str | Path, model_name: str = "base") -> str:
    """Transcribe ``audio_path`` and return the full text.

    Raises:
        FileNotFoundError: if the audio file does not exist.
        ValueError: if ``model_name`` is not a recognized Whisper model.
    """
    audio_path = Path(audio_path)
    if not audio_path.exists():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")
    if model_name not in VALID_MODELS:
        raise ValueError(
            f"Unknown model '{model_name}'. Choose one of: {sorted(VALID_MODELS)}"
        )

    model = _load_model(model_name)
    result = model.transcribe(str(audio_path))
    return result["text"].strip()

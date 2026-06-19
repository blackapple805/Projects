"""Tests for transcriber. The Whisper model is mocked so no model download or
torch install is needed to run these."""
from unittest.mock import MagicMock, patch

import pytest

from src.transcriber import transcribe_audio


def test_missing_audio_raises(tmp_path):
    with pytest.raises(FileNotFoundError):
        transcribe_audio(tmp_path / "nope.wav")


def test_invalid_model_raises(tmp_path):
    audio = tmp_path / "a.wav"
    audio.write_bytes(b"wav")
    with pytest.raises(ValueError, match="Unknown model"):
        transcribe_audio(audio, model_name="ultra")


@patch("src.transcriber._load_model")
def test_transcribe_returns_text(mock_load, tmp_path):
    audio = tmp_path / "a.wav"
    audio.write_bytes(b"wav")

    mock_model = MagicMock()
    mock_model.transcribe.return_value = {"text": "  hello world  "}
    mock_load.return_value = mock_model

    result = transcribe_audio(audio, model_name="base")
    assert result == "hello world"  # stripped
    mock_model.transcribe.assert_called_once()

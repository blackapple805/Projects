"""Tests for audio_extractor. VideoFileClip is mocked so these run without
ffmpeg or real video files."""
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from src.audio_extractor import extract_audio


def test_missing_video_raises(tmp_path):
    with pytest.raises(FileNotFoundError):
        extract_audio(tmp_path / "nope.mp4", tmp_path / "out.wav")


@patch("src.audio_extractor.VideoFileClip")
def test_extract_audio_writes_file(mock_clip_cls, tmp_path):
    video = tmp_path / "video.mp4"
    video.write_bytes(b"fake")
    out = tmp_path / "audio.wav"

    # Wire up a fake clip whose .audio.write_audiofile creates the output file.
    mock_clip = MagicMock()
    mock_audio = MagicMock()
    mock_audio.write_audiofile.side_effect = lambda path, **kw: Path(path).write_bytes(b"wav")
    mock_clip.audio = mock_audio
    mock_clip_cls.return_value = mock_clip

    result = extract_audio(video, out)

    assert result == out
    assert out.exists()
    mock_clip.close.assert_called_once()


@patch("src.audio_extractor.VideoFileClip")
def test_no_audio_track_raises(mock_clip_cls, tmp_path):
    video = tmp_path / "silent.mp4"
    video.write_bytes(b"fake")

    mock_clip = MagicMock()
    mock_clip.audio = None  # no audio track
    mock_clip_cls.return_value = mock_clip

    with pytest.raises(ValueError, match="no audio track"):
        extract_audio(video, tmp_path / "out.wav")
    mock_clip.close.assert_called_once()  # cleanup still happens

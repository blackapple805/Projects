"""Extract an audio track from a video file."""
from __future__ import annotations

from pathlib import Path

# MoviePy 2.x exposes VideoFileClip at the top level; the old
# `moviepy.editor` module was removed.
from moviepy import VideoFileClip


def extract_audio(video_path: str | Path, audio_path: str | Path, sample_rate: int = 16000) -> Path:
    """Extract audio from ``video_path`` and write a WAV to ``audio_path``.

    Whisper expects 16 kHz mono audio, which is the default sample rate here.

    Raises:
        FileNotFoundError: if the video file does not exist.
        ValueError: if the video has no audio track.
    """
    video_path = Path(video_path)
    audio_path = Path(audio_path)

    if not video_path.exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")

    audio_path.parent.mkdir(parents=True, exist_ok=True)

    clip = VideoFileClip(str(video_path))
    try:
        if clip.audio is None:
            raise ValueError(f"Video has no audio track: {video_path}")
        clip.audio.write_audiofile(str(audio_path), fps=sample_rate, logger=None)
    finally:
        clip.close()

    return audio_path

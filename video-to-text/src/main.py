"""Command-line entry point: transcribe a video file to text.

Usage:
    python -m src.main path/to/video.mp4
    python -m src.main video.mp4 --model small --output out.txt --keep-audio
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Support both `python -m src.main` (package context) and direct execution.
if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from src.audio_extractor import extract_audio
    from src.transcriber import transcribe_audio
else:
    from .audio_extractor import extract_audio
    from .transcriber import transcribe_audio

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_INPUT_DIR = ROOT / "data" / "input_videos"
DEFAULT_OUTPUT_DIR = ROOT / "data" / "output_texts"


def transcribe_video(
    video_path: str | Path,
    output_path: str | Path | None = None,
    model_name: str = "base",
    keep_audio: bool = False,
) -> Path:
    """Extract audio from a video and transcribe it to a text file.

    Returns the path to the written transcript.
    """
    video_path = Path(video_path)
    # Allow a bare filename to resolve against the default input dir.
    if not video_path.exists() and not video_path.is_absolute():
        candidate = DEFAULT_INPUT_DIR / video_path
        if candidate.exists():
            video_path = candidate

    if output_path is None:
        DEFAULT_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        output_path = DEFAULT_OUTPUT_DIR / f"{video_path.stem}.txt"
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    temp_audio = output_path.parent / f"{video_path.stem}_temp.wav"

    print(f"[1/3] Extracting audio from {video_path} ...")
    extract_audio(video_path, temp_audio)

    print(f"[2/3] Transcribing with Whisper model '{model_name}' ...")
    transcription = transcribe_audio(temp_audio, model_name)

    print(f"[3/3] Writing transcript to {output_path} ...")
    output_path.write_text(transcription, encoding="utf-8")

    if not keep_audio:
        temp_audio.unlink(missing_ok=True)

    print("Done.")
    return output_path


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Extract audio from a video and transcribe it to text using Whisper."
    )
    parser.add_argument("video", help="Path to the input video (or a filename in data/input_videos/).")
    parser.add_argument("-o", "--output", help="Path for the output .txt file.")
    parser.add_argument(
        "-m", "--model", default="base",
        help="Whisper model size: tiny, base, small, medium, large, turbo (default: base).",
    )
    parser.add_argument(
        "--keep-audio", action="store_true",
        help="Keep the intermediate extracted .wav file instead of deleting it.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        transcribe_video(args.video, args.output, args.model, args.keep_audio)
    except (FileNotFoundError, ValueError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

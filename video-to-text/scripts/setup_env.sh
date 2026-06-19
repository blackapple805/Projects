#!/usr/bin/env bash
# Set up a virtual environment and install dependencies (macOS / Linux).
# Run from the project root: bash scripts/setup_env.sh
set -e

python3 -m venv .venv
# shellcheck disable=SC1091
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements-dev.txt
echo ""
echo "Done. Activate with: source .venv/bin/activate"
echo "NOTE: Whisper also requires ffmpeg on your system PATH."
echo "  macOS:  brew install ffmpeg"
echo "  Ubuntu: sudo apt install ffmpeg"

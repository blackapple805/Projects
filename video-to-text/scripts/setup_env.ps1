# Set up a virtual environment and install dependencies (Windows / PowerShell).
# Run from the project root: .\scripts\setup_env.ps1
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
Write-Host ""
Write-Host "Done. Activate with: .\.venv\Scripts\Activate.ps1"
Write-Host "NOTE: Whisper also requires ffmpeg on your PATH."
Write-Host "  Install via: winget install Gyan.FFmpeg  (or: choco install ffmpeg)"

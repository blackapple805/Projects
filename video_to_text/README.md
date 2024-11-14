# Video to Text Transcription Project

## Overview
This project extracts audio from video files and transcribes the audio to text using OpenAI’s Whisper model.

## Directory Structure
- `src/`: Source code modules.
- `data/input_videos/`: Place your input video files here.
- `data/output_texts/`: Transcribed text files will be saved here.
- `tests/`: Unit tests for the project.
- `scripts/`: Utility scripts for setup.

## Setup Instructions

1. **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/video_to_text_project.git
    cd video_to_text_project
    ```

2. **Set Up Virtual Environment**
    ```bash
    bash scripts/setup_env.sh
    ```
    *For Windows, create a `setup_env.bat` with similar commands.*

3. **Run the Application**
    ```bash
    python src/main.py
    ```

## Testing

Run unit tests using:
```bash
python -m unittest discover tests

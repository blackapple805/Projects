# src/main.py
import os
from audio_extractor import extract_audio
from transcriber import transcribe_audio

def transcribe_video(video_filename, output_filename, model_name="base"):
    input_video = os.path.join("data", "input_videos", video_filename)
    temp_audio = os.path.join("data", "output_texts", "temp_audio.wav")
    output_text = os.path.join("data", "output_texts", output_filename)
    
    print(f"Extracting audio from {input_video}...")
    extract_audio(input_video, temp_audio)
    
    print(f"Transcribing audio using model '{model_name}'...")
    transcription = transcribe_audio(temp_audio, model_name)
    
    with open(output_text, "w", encoding="utf-8") as f:
        f.write(transcription)
    
    os.remove(temp_audio)
    print(f"Transcription saved to {output_text}")

if __name__ == "__main__":
    transcribe_video("example_video.mp4", "transcription.txt")

# tests/test_transcriber.py
import unittest
from src.transcriber import transcribe_audio

class TestTranscriber(unittest.TestCase):
    def test_transcribe_audio(self):
        audio = 'data/input_videos/example_audio.wav'  # Provide a valid test audio
        transcription = transcribe_audio(audio, model_name="base")
        self.assertIsInstance(transcription, str)
        # Add more specific assertions as needed

if __name__ == '__main__':
    unittest.main()

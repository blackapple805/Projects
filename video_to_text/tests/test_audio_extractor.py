# tests/test_audio_extractor.py
import unittest
from src.audio_extractor import extract_audio
import os

class TestAudioExtractor(unittest.TestCase):
    def test_extract_audio(self):
        video = 'data/input_videos/example_video.mp4'
        audio = 'data/output_texts/test_audio.wav'
        extract_audio(video, audio)
        self.assertTrue(os.path.exists(audio))
        os.remove(audio)

if __name__ == '__main__':
    unittest.main()

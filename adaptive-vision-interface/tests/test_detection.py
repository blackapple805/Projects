import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# tests/test_detection.py
from app import detection

def test_detection_import():
    """Ensure detection module imports correctly."""
    assert hasattr(detection, "process_frame"), "process_frame() missing"

import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# tests/test_camera.py
import cv2

def test_camera_open():
    """Check if the default camera opens successfully."""
    cap = cv2.VideoCapture(0)
    assert cap.isOpened(), "Camera failed to open"
    cap.release()

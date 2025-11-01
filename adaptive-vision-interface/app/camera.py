import cv2, os

def get_camera(index=None, width=1280, height=720):
    index = int(os.getenv("CAMERA_INDEX", 0))
    cap = cv2.VideoCapture(index)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
    cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*'MJPG'))
    if not cap.isOpened():
        raise RuntimeError(f"Camera index {index} not accessible or already in use")
    return cap
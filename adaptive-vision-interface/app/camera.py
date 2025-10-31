import cv2

def get_camera(index=0, width=1280, height=720):
    """
    Initializes and returns a camera object using OpenCV.

    Args:
        index (int): The camera index (0 = default webcam)
        width (int): Desired frame width
        height (int): Desired frame height

    Returns:
        cv2.VideoCapture: Active camera stream object
    """

    # Create camera object
    cap = cv2.VideoCapture(index)

    # Configure resolution and encoding format
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
    cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*'MJPG'))

    # Validate that the camera opened correctly
    if not cap.isOpened():
        raise RuntimeError("Camera not accessible or already in use")

    return cap

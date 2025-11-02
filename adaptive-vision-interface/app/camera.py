import cv2, os, threading, time

class ThreadedCamera:
    def __init__(self, index=None, width=1280, height=720, fps=30, retries=5):
        index = int(os.getenv("CAMERA_INDEX", 0) if index is None else index)
        self.cap = None
        for _ in range(retries):
            self.cap = cv2.VideoCapture(index, cv2.CAP_V4L2)
            if self.cap.isOpened():
                break
            time.sleep(0.5)
        if not self.cap or not self.cap.isOpened():
            raise RuntimeError(f"Camera index {index} not accessible after {retries} retries")

        # Hardware-accelerated settings
        self.cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
        self.cap.set(cv2.CAP_PROP_FPS, fps)
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

        self.frame = None
        self.lock = threading.Lock()
        self.running = True

        # Start grab thread
        self.thread = threading.Thread(target=self._update, daemon=True)
        self.thread.start()

    def _update(self):
        """Continuously read frames in the background without queue buildup."""
        while self.running:
            ret, frame = self.cap.read()
            if ret:
                with self.lock:
                    self.frame = frame
            else:
                # Small delay to reduce busy wait when no frame available
                time.sleep(0.005)

    def read(self):
        """Return latest frame without blocking."""
        with self.lock:
            return self.frame.copy() if self.frame is not None else None

    def release(self):
        """Cleanly stop thread and release camera."""
        self.running = False
        self.thread.join(timeout=1)
        if self.cap:
            self.cap.release()

def get_camera(index=None, width=1280, height=720):
    """Compatibility helper."""
    return ThreadedCamera(index=index, width=width, height=height)


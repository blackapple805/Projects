from flask import Flask, Response, jsonify
from app.camera import get_camera
from app.detection import process_frame
from app.metrics import Metrics
import cv2, threading, time

app = Flask(__name__)

cap = get_camera()
metrics = Metrics()

latest_frame = None
processed_frame = None
_frame_lock = threading.Lock()

# Optimize intervals
DETECTION_INTERVAL = 2  # every 2 frames
FRAME_DELAY = 0.01      # smoother capture
STREAM_DELAY = 0.02     # more stable playback

def capture_loop():
    """Continuously grab frames from camera."""
    global latest_frame
    while True:
        ret, frame = cap.read()
        if ret:
            with _frame_lock:
                latest_frame = frame
        time.sleep(FRAME_DELAY)

def detection_loop():
    """Run detection in a parallel thread."""
    global latest_frame, processed_frame
    frame_counter = 0
    while True:
        with _frame_lock:
            if latest_frame is None:
                continue
            frame = latest_frame.copy()

        frame_counter += 1
        if frame_counter % DETECTION_INTERVAL == 0:
            processed, viewers, ts = process_frame(frame)
            metrics.update(viewers, ts)
            with _frame_lock:
                processed_frame = processed
        time.sleep(0.02)

def gen():
    """Streams processed frames."""
    global processed_frame
    while True:
        with _frame_lock:
            if processed_frame is None:
                continue
            frame = processed_frame.copy()

        _, buf = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buf.tobytes() + b'\r\n')
        time.sleep(STREAM_DELAY)

@app.route('/')
def video_feed():
    return Response(gen(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/metrics')
def get_metrics():
    return jsonify(metrics.export())

# Start both threads
threading.Thread(target=capture_loop, daemon=True).start()
threading.Thread(target=detection_loop, daemon=True).start()




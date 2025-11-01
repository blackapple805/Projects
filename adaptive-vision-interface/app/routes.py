from flask import Flask, Response, jsonify
from app.camera import get_camera
from app.detection import process_frame
from app.metrics import Metrics
import cv2, threading, time

app = Flask(__name__)

cap = get_camera(index=1)
metrics = Metrics()

latest_frame = None
processed_frame = None
_frame_lock = threading.Lock()

# Tuned parameters
FRAME_DELAY = 0.005      # smoother capture
DETECTION_DELAY = 0.01   # faster hand/body updates
STREAM_DELAY = 0.02      # stable HTTP stream

def capture_loop():
    """Continuously capture frames from camera."""
    global latest_frame
    while True:
        ret, frame = cap.read()
        if ret:
            with _frame_lock:
                latest_frame = frame
        time.sleep(FRAME_DELAY)

def detection_loop():
    """Continuously process frames for detection."""
    global latest_frame, processed_frame
    while True:
        with _frame_lock:
            if latest_frame is None:
                continue
            frame = latest_frame.copy()

        processed, viewers, ts = process_frame(frame)
        metrics.update(viewers, ts)
        with _frame_lock:
            processed_frame = processed
        time.sleep(DETECTION_DELAY)

def gen():
    """Generate and stream processed frames."""
    global processed_frame
    while True:
        with _frame_lock:
            if processed_frame is None:
                continue
            ret, buf = cv2.imencode('.jpg', processed_frame)
        if not ret:
            continue
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buf.tobytes() + b'\r\n')
        time.sleep(STREAM_DELAY)

@app.route('/')
def video_feed():
    """Main live feed route."""
    return Response(gen(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/metrics')
def get_metrics():
    """JSON metrics endpoint."""
    return jsonify(metrics.export())

# Launch background threads
threading.Thread(target=capture_loop, daemon=True).start()
threading.Thread(target=detection_loop, daemon=True).start()




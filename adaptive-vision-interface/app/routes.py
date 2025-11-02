from flask import Flask, Response, jsonify
from app.camera import get_camera
from app.detection import process_frame
from app.metrics import Metrics
import cv2, threading, time
from concurrent.futures import ThreadPoolExecutor
from collections import deque

app = Flask(__name__)
cap = get_camera(index=0)
metrics = Metrics()

latest_frame = None
processed_frame = None
_frame_lock = threading.Lock()
executor = ThreadPoolExecutor(max_workers=2)

# === Target FPS and timing parameters ===
TARGET_FPS = 20                # desired FPS
FRAME_INTERVAL = 1.0 / TARGET_FPS
CAPTURE_DELAY = FRAME_INTERVAL * 0.5   # slightly shorter to keep buffer fresh
STREAM_DELAY = FRAME_INTERVAL * 0.8    # small margin for smooth stream

def capture_loop():
    """Continuously capture frames from the camera at a stable rate."""
    global latest_frame
    while True:
        start = time.time()
        frame = cap.read()
        if frame is None:
            time.sleep(0.02)
            continue
        with _frame_lock:
            latest_frame = frame
        elapsed = time.time() - start
        sleep_time = max(0, CAPTURE_DELAY - elapsed)
        time.sleep(sleep_time)


def detection_loop():
    """Asynchronous detection pipeline with FPS stabilization."""
    global latest_frame, processed_frame
    future = None

    while True:
        start = time.time()
        frame = None
        with _frame_lock:
            if latest_frame is not None:
                frame = latest_frame.copy()

        if frame is None:
            time.sleep(0.005)
            continue

        if future is None or future.done():
            # Run MediaPipe detection
            future = executor.submit(process_frame, frame)
            processed, viewers, ts = future.result()
            metrics.update(viewers, ts)
            with _frame_lock:
                processed_frame = processed

        # precise pacing
        elapsed = time.time() - start
        sleep_time = max(0, FRAME_INTERVAL - elapsed)
        time.sleep(sleep_time)


def gen():
    """Stream processed frames via MJPEG."""
    global processed_frame
    while True:
        with _frame_lock:
            frame = processed_frame.copy() if processed_frame is not None else None
        if frame is None:
            time.sleep(0.005)
            continue

        ret, buf = cv2.imencode('.jpg', frame)
        if not ret:
            continue

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buf.tobytes() + b'\r\n')
        time.sleep(STREAM_DELAY)


@app.route('/')
def video_feed():
    return Response(gen(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/metrics')
def get_metrics():
    return jsonify(metrics.export())


# === Threads ===
threading.Thread(target=capture_loop, daemon=True).start()
threading.Thread(target=detection_loop, daemon=True).start()

if __name__ == '__main__':
    print("🚀 Launching Adaptive Vision Interface on port 5000 (20 FPS stable)...")
    app.run(host='0.0.0.0', port=5000, threaded=True)










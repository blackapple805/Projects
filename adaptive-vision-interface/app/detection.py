import cv2
import mediapipe as mp
import numpy as np
from collections import deque
import time

# === MediaPipe Setup ===
mp_hands = mp.solutions.hands
mp_pose = mp.solutions.pose
mp_face = mp.solutions.face_mesh
mp_draw = mp.solutions.drawing_utils

# === Optimized models for multi-person, FPS-stable detection ===
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=1,
    enable_segmentation=False,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=4,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

face = mp_face.FaceMesh(
    static_image_mode=False,
    max_num_faces=2,
    refine_landmarks=False,  # disable fine iris/lip detail for speed
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

# === Store previous results ===
last_pose, last_face, last_hands = None, None, None

# === Warm-up Models ===
_dummy = np.zeros((480, 640, 3), dtype=np.uint8)
rgb_dummy = cv2.cvtColor(_dummy, cv2.COLOR_BGR2RGB)
for model in [hands, pose, face]:
    model.process(rgb_dummy)

# === State Tracking ===
hand_history = deque(maxlen=10)
clap_history = deque(maxlen=10)
last_gesture_event = {"wave": 0, "clap": 0}
_last_time = time.time()
_fps = 0.0


def classify_gesture(hand_landmarks, w, h):
    coords = np.array([[lm.x * w, lm.y * h] for lm in hand_landmarks.landmark])
    tip_ids, mcp_ids = [4, 8, 12, 16, 20], [2, 5, 9, 13, 17]
    fingers_open = [(coords[mcp][1] - coords[tip][1]) > 25 for tip, mcp in zip(tip_ids, mcp_ids)]
    open_count = sum(fingers_open)
    thumb_extended = abs(coords[4][0] - coords[2][0]) > 30
    if open_count <= 1 and not thumb_extended:
        return "Fist"
    elif open_count >= 4 and thumb_extended:
        return "Open Palm"
    elif open_count == 1 and fingers_open[1]:
        return "Pointing"
    elif open_count >= 3 and not thumb_extended:
        return "Relaxed"
    return "Unknown"


emotion_history = deque(maxlen=8)

def detect_emotion(landmarks, w, h):
    """Detects Happy, Sad, Neutral, or Surprised emotions from mouth curvature."""
    coords = np.array([[lm.x * w, lm.y * h] for lm in landmarks])

    left_mouth = coords[61]
    right_mouth = coords[291]
    top_lip = coords[13]
    bottom_lip = coords[14]
    nose_tip = coords[1]

    mouth_width = np.linalg.norm(right_mouth - left_mouth)
    mouth_open = np.linalg.norm(bottom_lip - top_lip)
    slope = (right_mouth[1] - left_mouth[1]) / (right_mouth[0] - left_mouth[0] + 1e-6)

    # Relative measures
    mouth_ratio = mouth_open / (mouth_width + 1e-6)
    frown_intensity = (left_mouth[1] + right_mouth[1]) / 2 - bottom_lip[1]

    # --- Adjusted emotion thresholds ---
    if slope < -0.015 and mouth_ratio < 0.05:
        emotion = "Happy"
    elif slope > 0.015 and mouth_ratio < 0.05:
        emotion = "Sad"
    elif mouth_ratio > 0.07:
        emotion = "Surprised"
    else:
        emotion = "Neutral"

    # Smoothing: pick the most frequent emotion in last few frames
    emotion_history.append(emotion)
    most_common = max(set(emotion_history), key=emotion_history.count)
    return most_common


def process_frame(frame):
    global _last_time, _fps
    global last_pose, last_face, last_hands

    try:
        h, w, _ = frame.shape
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        frame_id = getattr(process_frame, "_frame_id", 0)
        process_frame._frame_id = frame_id + 1

        now = time.time()
        dt = now - _last_time
        _last_time = now
        if dt > 0:
            _fps = 0.9 * _fps + 0.1 * (1.0 / dt)

        total_detections = 0
        colors = {
            "pose": (0, 255, 0),
            "face_close": (0, 255, 255),
            "face_mid": (0, 230, 230),
            "face_far": (0, 200, 200),
            "left_hand": (255, 140, 0),
            "right_hand": (0, 150, 255)
        }

        run_pose = frame_id % 2 == 0
        run_hands = frame_id % 2 == 1
        run_face = frame_id % 3 == 0

        if run_pose:
            last_pose = pose.process(rgb)
        if run_hands:
            last_hands = hands.process(rgb)
        if run_face:
            last_face = face.process(rgb)

        pose_results, hand_results, face_results = last_pose, last_hands, last_face

        # === POSE ===
        if pose_results and pose_results.pose_landmarks:
            total_detections += 1
            pose_spec = mp_draw.DrawingSpec(color=colors["pose"], thickness=2, circle_radius=2)
            mp_draw.draw_landmarks(
                frame,
                pose_results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                pose_spec,
                pose_spec
            )

        # === FACE ===
        if face_results and face_results.multi_face_landmarks:
            for fl in face_results.multi_face_landmarks:
                total_detections += 1
                coords = np.array([[lm.x * w, lm.y * h] for lm in fl.landmark])
                x_min, y_min = coords.min(axis=0)
                x_max, y_max = coords.max(axis=0)
                face_size = max(x_max - x_min, y_max - y_min)
                overlay = frame.copy()

                # Draw mesh
                if face_size > 220:
                    mesh_spec = mp_draw.DrawingSpec(color=colors["face_close"], thickness=1, circle_radius=0)
                    mp_draw.draw_landmarks(
                        overlay,
                        fl,
                        mp_face.FACEMESH_TESSELATION,
                        landmark_drawing_spec=None,
                        connection_drawing_spec=mesh_spec
                    )
                elif 120 < face_size <= 220:
                    mesh_spec = mp_draw.DrawingSpec(color=colors["face_mid"], thickness=1, circle_radius=0)
                    reduced = [c for i, c in enumerate(list(mp_face.FACEMESH_TESSELATION)) if i % 3 == 0]
                    mp_draw.draw_landmarks(
                        overlay,
                        fl,
                        reduced,
                        landmark_drawing_spec=None,
                        connection_drawing_spec=mesh_spec
                    )
                else:
                    mesh_spec = mp_draw.DrawingSpec(color=colors["face_far"], thickness=1, circle_radius=0)
                    mp_draw.draw_landmarks(
                        overlay,
                        fl,
                        mp_face.FACEMESH_CONTOURS,
                        landmark_drawing_spec=None,
                        connection_drawing_spec=mesh_spec
                    )

                cv2.addWeighted(overlay, 0.55, frame, 0.45, 0, frame)

                # === Emotion estimation ===
                emotion = detect_emotion(fl.landmark, w, h)
                cv2.putText(frame, f"Emotion: {emotion}", (int(x_min), int(y_min) - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

        # === HANDS ===
        if hand_results and hand_results.multi_hand_landmarks:
            for hand_info, hlm in zip(hand_results.multi_handedness, hand_results.multi_hand_landmarks):
                total_detections += 1
                label = hand_info.classification[0].label.lower()
                color = colors["left_hand"] if label == "left" else colors["right_hand"]
                hand_spec = mp_draw.DrawingSpec(color=color, thickness=2, circle_radius=2)
                mp_draw.draw_landmarks(frame, hlm, mp_hands.HAND_CONNECTIONS, hand_spec, hand_spec)

                coords = np.array([[lm.x * w, lm.y * h] for lm in hlm.landmark])
                x_mean, y_min = int(coords[:, 0].mean()), int(coords[:, 1].min())
                gesture = classify_gesture(hlm, w, h)
                cv2.putText(frame, gesture, (x_mean - 40, y_min - 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        # === Overlay metrics ===
        cv2.putText(frame, f"Detections: {total_detections}", (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        cv2.putText(frame, f"FPS: {_fps:.1f}", (20, 80),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        return frame, total_detections, time.time()

    except Exception as e:
        print(f"[process_frame] Error: {e}")
        return frame, 0, time.time()













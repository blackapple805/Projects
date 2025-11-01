import cv2
import mediapipe as mp
import numpy as np
from collections import deque
import time

# === MediaPipe setup ===
mp_hands = mp.solutions.hands
mp_pose = mp.solutions.pose
mp_face = mp.solutions.face_mesh
mp_draw = mp.solutions.drawing_utils
mp_styles = mp.solutions.drawing_styles

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

pose = mp_pose.Pose(
    static_image_mode=False,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

face = mp_face.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

# === Gesture tracking state ===
hand_history = deque(maxlen=10)
clap_history = deque(maxlen=10)
last_gesture_event = {"wave": 0, "clap": 0}


def classify_gesture(hand_landmarks, w, h):
    coords = np.array([[lm.x * w, lm.y * h] for lm in hand_landmarks.landmark])
    tip_ids, mcp_ids = [4, 8, 12, 16, 20], [2, 5, 9, 13, 17]
    fingers_open = [(coords[mcp][1] - coords[tip][1]) > 25 for tip, mcp in zip(tip_ids, mcp_ids)]
    open_count = sum(fingers_open)
    thumb_extended = abs(coords[4][0] - coords[2][0]) > 30
    if open_count <= 1 and not thumb_extended:
        return "Fist"
    if open_count >= 4 and thumb_extended:
        return "Open Palm"
    if open_count == 1 and fingers_open[1]:
        return "Pointing"
    if open_count >= 3 and not thumb_extended:
        return "Relaxed"
    return "Unknown"


def process_frame(frame):
    """Run pose + hand + face detection with skeletal accuracy."""
    try:
        h, w, _ = frame.shape
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        total = 0

        # === Accurate Pose Skeleton with shoulder emphasis ===
        pose_results = pose.process(rgb)
        if pose_results.pose_landmarks:
            total += 1
            landmarks = pose_results.pose_landmarks.landmark

            # Convert landmark positions to pixel coords
            points = {}
            for idx, lm in enumerate(landmarks):
                points[idx] = (int(lm.x * w), int(lm.y * h))

            # Define key joints
            LEFT_SHOULDER, RIGHT_SHOULDER = 11, 12
            LEFT_ELBOW, RIGHT_ELBOW = 13, 14
            LEFT_WRIST, RIGHT_WRIST = 15, 16

            # Draw shoulders explicitly
            cv2.circle(frame, points[LEFT_SHOULDER], 6, (0, 255, 255), -1)
            cv2.circle(frame, points[RIGHT_SHOULDER], 6, (0, 255, 255), -1)

            # Connect upper body lines
            cv2.line(frame, points[LEFT_SHOULDER], points[RIGHT_SHOULDER], (0, 255, 255), 3)
            cv2.line(frame, points[LEFT_SHOULDER], points[LEFT_ELBOW], (0, 200, 200), 2)
            cv2.line(frame, points[RIGHT_SHOULDER], points[RIGHT_ELBOW], (0, 200, 200), 2)
            cv2.line(frame, points[LEFT_ELBOW], points[LEFT_WRIST], (0, 180, 255), 2)
            cv2.line(frame, points[RIGHT_ELBOW], points[RIGHT_WRIST], (0, 180, 255), 2)

            # Optional: keep the rest of MediaPipe's pose drawing for legs etc.
            mp_draw.draw_landmarks(
                frame,
                pose_results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                mp_draw.DrawingSpec(color=(0, 255, 255), thickness=1, circle_radius=1),
                mp_draw.DrawingSpec(color=(0, 255, 255), thickness=1)
            )


        # === Face Mesh ===
        face_results = face.process(rgb)
        if face_results.multi_face_landmarks:
            total += 1
            for face_landmarks in face_results.multi_face_landmarks:
                mp_draw.draw_landmarks(
                    frame,
                    face_landmarks,
                    mp_face.FACEMESH_TESSELATION,
                    landmark_drawing_spec=None,
                    connection_drawing_spec=mp_draw.DrawingSpec(color=(0, 255, 255), thickness=1, circle_radius=1)
                )
                for idx in [33, 133, 362, 263, 13, 14]:
                    pt = face_landmarks.landmark[idx]
                    cx, cy = int(pt.x * w), int(pt.y * h)
                    cv2.circle(frame, (cx, cy), 2, (0, 255, 255), -1)

        # === Hand detection ===
        hand_results = hands.process(rgb)
        hand_centers = []
        if hand_results.multi_hand_landmarks:
            for hlm in hand_results.multi_hand_landmarks:
                total += 1
                mp_draw.draw_landmarks(
                    frame, hlm, mp_hands.HAND_CONNECTIONS,
                    mp_draw.DrawingSpec(color=(255, 0, 255), thickness=2, circle_radius=2),
                    mp_draw.DrawingSpec(color=(255, 255, 255), thickness=1)
                )
                coords = np.array([[lm.x * w, lm.y * h] for lm in hlm.landmark])
                x_mean, y_mean = int(coords[:, 0].mean()), int(coords[:, 1].mean())
                hand_centers.append((x_mean, y_mean))
                gesture = classify_gesture(hlm, w, h)
                cv2.putText(frame, gesture, (x_mean - 40, y_mean - 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 255), 2)

        # === Gesture logic ===
        if hand_centers:
            hand_history.append(hand_centers[0])
            if len(hand_history) >= 5:
                x_var = np.ptp([p[0] for p in hand_history])
                if x_var > 100 and (time.time() - last_gesture_event["wave"]) > 0.3:
                    cv2.putText(frame, "WAVE", (30, h - 40),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 3)
                    last_gesture_event["wave"] = time.time()

        if len(hand_centers) == 2:
            dist = np.linalg.norm(np.array(hand_centers[0]) - np.array(hand_centers[1]))
            clap_history.append(dist)
            if len(clap_history) >= 3:
                r = list(clap_history)[-3:]
                if max(r) - min(r) > 60 and r[-1] < 70 and (time.time() - last_gesture_event["clap"]) > 0.5:
                    cv2.putText(frame, "CLAP", (30, h - 80),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 165, 255), 3)
                    last_gesture_event["clap"] = time.time()

        cv2.putText(frame, f"Detections: {total}", (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

        return frame, total, time.time()

    except Exception as e:
        print(f"[process_frame] Error: {e}")
        return frame, 0, time.time()



import cv2
import time
import os
import mediapipe as mp
import numpy as np

# --- Load Haar cascades for face and body ---
cascade_dir = cv2.data.haarcascades
face_cascade = cv2.CascadeClassifier(os.path.join(cascade_dir, "haarcascade_frontalface_default.xml"))
upperbody_cascade = cv2.CascadeClassifier(os.path.join(cascade_dir, "haarcascade_upperbody.xml"))
fullbody_cascade = cv2.CascadeClassifier(os.path.join(cascade_dir, "haarcascade_fullbody.xml"))

# --- Setup MediaPipe Hands ---
mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2,
                       min_detection_confidence=0.5, min_tracking_confidence=0.6)

def classify_gesture(hand_landmarks, image_width, image_height):
    """
    Improved gesture classifier:
    Detects 'Open Palm', 'Fist', 'Pointing' with better rotational tolerance.
    Uses relative distances and average finger openness.
    """

    coords = np.array([[lm.x * image_width, lm.y * image_height] for lm in hand_landmarks.landmark])

    # Landmark indices for tips and MCPs
    tip_ids = [4, 8, 12, 16, 20]
    mcp_ids = [2, 5, 9, 13, 17]

    # Determine if fingers are open (based on Y distance + relative slope)
    fingers_open = []
    for tip, mcp in zip(tip_ids, mcp_ids):
        tip_y = coords[tip][1]
        mcp_y = coords[mcp][1]
        # Finger is open if tip is significantly higher than MCP
        fingers_open.append((mcp_y - tip_y) > 25)

    open_count = sum(fingers_open)

    # --- Additional logic: thumb orientation ---
    thumb_tip_x, thumb_mcp_x = coords[4][0], coords[2][0]
    thumb_extended = abs(thumb_tip_x - thumb_mcp_x) > 30

    # --- Classify gestures ---
    if open_count <= 1 and not thumb_extended:
        return "Fist"
    elif open_count >= 4 and thumb_extended:
        return "Open Palm"
    elif open_count == 1 and fingers_open[1]:
        return "Pointing"
    elif open_count >= 3 and not thumb_extended:
        return "Relaxed Hand"
    else:
        return "Unknown"

def process_frame(frame):
    """
    Detects faces, bodies, and dynamic gestures (wave, clap).
    """

    global hand_history, clap_history, last_gesture_event

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    h, w, _ = frame.shape

    # --- Haar detections ---
    small_gray = cv2.resize(gray, (w // 2, h // 2))
    scale_factor = 2

    faces = face_cascade.detectMultiScale(small_gray, 1.15, 7, minSize=(40, 40))
    uppers = upperbody_cascade.detectMultiScale(small_gray, 1.05, 8, minSize=(60, 60))
    bodies = fullbody_cascade.detectMultiScale(small_gray, 1.05, 8, minSize=(75, 75))

    total = len(faces) + len(uppers) + len(bodies)

    # --- Draw detections ---
    for (x, y, fw, fh) in faces:
        x, y, fw, fh = [v * scale_factor for v in (x, y, fw, fh)]
        cv2.rectangle(frame, (x, y), (x + fw, y + fh), (0, 255, 0), 2)
        cv2.putText(frame, "Face", (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    for (x, y, fw, fh) in uppers:
        x, y, fw, fh = [v * scale_factor for v in (x, y, fw, fh)]
        cv2.rectangle(frame, (x, y), (x + fw, y + fh), (255, 0, 0), 2)
        cv2.putText(frame, "Upper Body", (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

    for (x, y, fw, fh) in bodies:
        x, y, fw, fh = [v * scale_factor for v in (x, y, fw, fh)]
        cv2.rectangle(frame, (x, y), (x + fw, y + fh), (0, 255, 255), 2)
        cv2.putText(frame, "Full Body", (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

    # --- Hand detection & motion tracking ---
    results = hands.process(rgb)
    hand_centers = []

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            total += 1
            gesture = classify_gesture(hand_landmarks, w, h)
            mp_draw.draw_landmarks(
                frame, hand_landmarks, mp_hands.HAND_CONNECTIONS,
                mp_draw.DrawingSpec(color=(255, 0, 255), thickness=2, circle_radius=2),
                mp_draw.DrawingSpec(color=(255, 255, 255), thickness=1)
            )

            coords = np.array([[lm.x * w, lm.y * h] for lm in hand_landmarks.landmark])
            x_min, y_min = int(coords[:, 0].min()), int(coords[:, 1].min())
            x_mean, y_mean = int(coords[:, 0].mean()), int(coords[:, 1].mean())
            hand_centers.append((x_mean, y_mean))

            cv2.putText(frame, f"Hand: {gesture}", (x_min, y_min - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 255), 2)

    # --- Wave detection (based on side-to-side motion) ---
    if len(hand_centers) > 0:
        hand_history.append(hand_centers[0])
        if len(hand_history) >= 5:
            x_positions = [p[0] for p in hand_history]
            x_variation = np.ptp(x_positions)  # range of motion
            if x_variation > 100 and (time.time() - last_gesture_event["wave"]) > 1.5:
                cv2.putText(frame, "WAVE DETECTED", (30, h - 40),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 3)
                last_gesture_event["wave"] = time.time()

    # --- Clap detection (based on distance between two hands) ---
    if len(hand_centers) == 2:
        dist = np.linalg.norm(np.array(hand_centers[0]) - np.array(hand_centers[1]))
        clap_history.append(dist)
        if len(clap_history) >= 5:
            recent = list(clap_history)[-5:]
            if max(recent) - min(recent) > 100 and recent[-1] < 70 and (time.time() - last_gesture_event["clap"]) > 2:
                cv2.putText(frame, "CLAP DETECTED", (30, h - 80),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 165, 255), 3)
                last_gesture_event["clap"] = time.time()

    # --- Summary ---
    cv2.putText(frame, f"Detections: {total}", (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

    return frame, total, time.time()




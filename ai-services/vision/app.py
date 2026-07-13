import time
from collections import deque

import cv2
import mediapipe as mp
import numpy as np

from constants import (
    ATTENTION_WINDOW_FRAMES,
    BLINK_FREEZE_FRAMES,
    CALIBRATION_STEP_SECONDS,
    CALIBRATION_STEPS,
    EAR_BLINK_MIN_FRAMES,
    EAR_THRESHOLD_SCALE,
    EYE_CONTACT_PERCENTAGE_WINDOW,
    EYE_CONTACT_STABILITY_FRAMES,
    GAZE_CONFIDENCE_THRESHOLD,
    GAZE_STABILITY_WINDOW,
    HEAD_FORWARD_CONFIDENCE_THRESHOLD,
    HEAD_POSE_IDS,
    LEFT_EYE,
    RIGHT_EYE,
    ROLLING_WINDOW_SIZE,
    SMOOTHED_DIRECTION_CONFIRMATION,
    VOTING_WINDOW_SIZE,
)
from utils import (
    calculate_attention_score,
    calculate_ear,
    classify_gaze,
    extract_landmarks,
    eye_ratio_features,
    gaze_model_from_calibration,
    get_eye_geometry,
    get_iris_points,
    rolling_mean,
    rolling_std,
    solve_head_pose,
    summarize_samples,
    robust_summary,
    clamp,
    point_int,
)


def new_phase_buffer():
    return {"h": [], "v": [], "top": [], "bottom": [], "opening": [], "yaw": [], "pitch": [], "ear": []}


def build_calibration_state():
    return {
        "phase_index": 0,
        "phase_start": time.perf_counter(),
        "samples": {phase: new_phase_buffer() for phase in CALIBRATION_STEPS},
        "stats": {},
        "values": {
            "center_h": 0.5,
            "center_v": 0.5,
            "left_h": 0.25,
            "right_h": 0.75,
            "up_v": 0.25,
            "down_v": 0.75,
            "yaw_scale": 1.0,
            "pitch_scale": 1.0,
            "horizontal_gain": 0.0,
            "vertical_gain": 0.0,
            "template_spread": 0.18,
            "templates": {},
            "blink_threshold": 0.2,
            "confidence_floor": 0.55,
        },
        "ready": False,
    }


def active_phase(calibration):
    return CALIBRATION_STEPS[min(calibration["phase_index"], len(CALIBRATION_STEPS) - 1)]


def finalize_current_phase(calibration):
    phase = active_phase(calibration)
    phase_samples = calibration["samples"][phase]
    calibration["stats"][phase] = {
        "h": robust_summary(phase_samples["h"]),
        "v": robust_summary(phase_samples["v"]),
        "top": robust_summary(phase_samples["top"]),
        "bottom": robust_summary(phase_samples["bottom"]),
        "opening": robust_summary(phase_samples["opening"]),
        "yaw": robust_summary(phase_samples["yaw"]),
        "pitch": robust_summary(phase_samples["pitch"]),
        "ear": robust_summary(phase_samples["ear"]),
    }

    if phase == "center":
        calibration["values"]["center_h"] = calibration["stats"][phase]["h"]["mean"] or 0.5
        calibration["values"]["center_v"] = calibration["stats"][phase]["v"]["mean"] or 0.5
        calibration["values"]["blink_threshold"] = max(0.15, (calibration["stats"][phase]["ear"]["mean"] or 0.2) * EAR_THRESHOLD_SCALE)
    elif phase == "left":
        calibration["values"]["left_h"] = calibration["stats"][phase]["h"]["mean"] or 0.25
    elif phase == "right":
        calibration["values"]["right_h"] = calibration["stats"][phase]["h"]["mean"] or 0.75
    elif phase == "up":
        calibration["values"]["up_v"] = calibration["stats"][phase]["v"]["mean"] or 0.25
    elif phase == "down":
        calibration["values"]["down_v"] = calibration["stats"][phase]["v"]["mean"] or 0.75

    calibration["phase_index"] += 1
    calibration["phase_start"] = time.perf_counter()

    if calibration["phase_index"] >= len(CALIBRATION_STEPS):
        center_h = calibration["values"]["center_h"]
        center_v = calibration["values"]["center_v"]
        left_h = calibration["values"]["left_h"]
        right_h = calibration["values"]["right_h"]
        up_v = calibration["values"]["up_v"]
        down_v = calibration["values"]["down_v"]
        calibration["values"]["yaw_scale"] = max(1.0, abs(calibration["stats"]["left"]["yaw"]["mean"] - calibration["stats"]["center"]["yaw"]["mean"]) + abs(calibration["stats"]["right"]["yaw"]["mean"] - calibration["stats"]["center"]["yaw"]["mean"]))
        calibration["values"]["pitch_scale"] = max(1.0, abs(calibration["stats"]["up"]["pitch"]["mean"] - calibration["stats"]["center"]["pitch"]["mean"]) + abs(calibration["stats"]["down"]["pitch"]["mean"] - calibration["stats"]["center"]["pitch"]["mean"]))
        calibration["values"]["horizontal_gain"] = estimate_gain(calibration["samples"]["center"]["yaw"], calibration["samples"]["center"]["h"])
        calibration["values"]["vertical_gain"] = estimate_gain(calibration["samples"]["center"]["pitch"], calibration["samples"]["center"]["v"])
        calibration["values"]["templates"] = build_templates(calibration)
        calibration["values"]["template_spread"] = estimate_template_spread(calibration["values"]["templates"])
        calibration["values"]["confidence_floor"] = 0.55
        calibration["ready"] = True


def estimate_gain(driver_values, response_values):
    if len(driver_values) < 5 or len(response_values) < 5:
        return 0.0
    driver = np.asarray(driver_values, dtype=np.float32)
    response = np.asarray(response_values, dtype=np.float32)
    driver = driver - float(np.mean(driver))
    response = response - float(np.mean(response))
    variance = float(np.dot(driver, driver))
    if variance < 1e-4:
        return 0.0
    return float(np.dot(driver, response) / variance)


def build_templates(calibration):
    templates = {}
    horizontal_gain = calibration["values"].get("horizontal_gain", 0.0)
    vertical_gain = calibration["values"].get("vertical_gain", 0.0)
    for phase in CALIBRATION_STEPS:
        stats = calibration["stats"].get(phase)
        if not stats:
            continue
        templates[phase] = {
            "vector": [
                clamp(stats["h"]["mean"] - stats["yaw"]["mean"] * horizontal_gain),
                clamp(stats["v"]["mean"] - stats["pitch"]["mean"] * vertical_gain),
                stats["top"]["mean"],
                stats["bottom"]["mean"],
                stats["opening"]["mean"],
            ],
            "std": [
                max(stats["h"]["std"], 0.025),
                max(stats["v"]["std"], 0.025),
                max(stats["top"]["std"], 0.025),
                max(stats["bottom"]["std"], 0.025),
                max(stats["opening"]["std"], 0.015),
            ],
        }
    return templates


def estimate_template_spread(templates):
    if len(templates) < 2:
        return 0.18
    vectors = [np.asarray(item["vector"], dtype=np.float32) for item in templates.values()]
    distances = []
    for index, vector in enumerate(vectors):
        for other in vectors[index + 1:]:
            distances.append(float(np.linalg.norm(vector - other)))
    return max(0.08, float(np.median(distances)) if distances else 0.18)


def accumulate_calibration(calibration, phase, gaze_features, head_pose, ear):
    buffer = calibration["samples"][phase]
    buffer["h"].append(gaze_features["raw_horizontal"])
    buffer["v"].append(gaze_features["raw_vertical"])
    buffer["top"].append(gaze_features["top_ratio"])
    buffer["bottom"].append(gaze_features["bottom_ratio"])
    buffer["opening"].append(gaze_features["opening_ratio"])
    buffer["yaw"].append(head_pose["yaw"])
    buffer["pitch"].append(head_pose["pitch"])
    buffer["ear"].append(ear)


def stabilize_prediction(history, current_value):
    history.append(current_value)
    counts = {}
    for value in history:
        counts[value] = counts.get(value, 0) + 1
    dominant = max(counts, key=counts.get)
    return dominant if counts[dominant] >= max(3, len(history) // 2 + 1) else history[-1]


def weighted_rolling_score(window, latest, alpha=0.35):
    if not window:
        return latest
    return alpha * latest + (1.0 - alpha) * float(np.mean(window))


def confidence_from_window(values):
    if not values:
        return 0.0
    return max(0.0, 100.0 - rolling_std(values, 0.0) * 200.0)


mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
)

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Could not open webcam")
    raise SystemExit(1)

print("Webcam Started! Press Q to quit.")

calibration = build_calibration_state()
gaze_history = deque(maxlen=VOTING_WINDOW_SIZE)
gaze_direction_history = deque(maxlen=VOTING_WINDOW_SIZE)
head_history = deque(maxlen=VOTING_WINDOW_SIZE)
eye_contact_history = deque(maxlen=EYE_CONTACT_STABILITY_FRAMES)
attention_history = deque(maxlen=ATTENTION_WINDOW_FRAMES)
gaze_stability_window = deque(maxlen=GAZE_STABILITY_WINDOW)
face_presence_window = deque(maxlen=ATTENTION_WINDOW_FRAMES)
blink_score_window = deque(maxlen=ATTENTION_WINDOW_FRAMES)
head_score_window = deque(maxlen=ATTENTION_WINDOW_FRAMES)
eye_contact_score_window = deque(maxlen=EYE_CONTACT_PERCENTAGE_WINDOW)
raw_horizontal_window = deque(maxlen=ROLLING_WINDOW_SIZE)
raw_vertical_window = deque(maxlen=ROLLING_WINDOW_SIZE)
last_left_center = None
last_right_center = None
blink_counter = 0
blink_total = 0
blink_freeze_frames = 0
last_frame_time = time.perf_counter()
fps_history = deque(maxlen=30)
head_state = {"last": None, "history": deque(maxlen=5)}
direction_state = {"last": "Looking On Screen", "confidence": 100}
head_direction_state = {"last": "Head Forward", "confidence": 100}
distraction_counter = 0


while True:
    success, frame = cap.read()
    if not success:
        break

    frame = cv2.flip(frame, 1)
    height, width, _ = frame.shape
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_frame)

    if not calibration["ready"] and (time.perf_counter() - calibration["phase_start"]) >= CALIBRATION_STEP_SECONDS:
        finalize_current_phase(calibration)

    calibration_status = f"Calibration: {active_phase(calibration).title()}" if not calibration["ready"] else "Calibration: Ready"
    gaze_model = gaze_model_from_calibration(calibration)

    if results.multi_face_landmarks:
        face_landmarks = results.multi_face_landmarks[0]
        landmarks = extract_landmarks(face_landmarks, width, height)
        cv2.putText(frame, "Face Detected", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        iris = get_iris_points(landmarks)
        left_center = iris["left_center"]
        right_center = iris["right_center"]
        if last_left_center is not None:
            left_center = np.array([0.2 * left_center[0] + 0.8 * last_left_center[0], 0.2 * left_center[1] + 0.8 * last_left_center[1]], dtype=np.float32)
        if last_right_center is not None:
            right_center = np.array([0.2 * right_center[0] + 0.8 * last_right_center[0], 0.2 * right_center[1] + 0.8 * last_right_center[1]], dtype=np.float32)
        last_left_center = left_center
        last_right_center = right_center

        eye_geometry = get_eye_geometry(landmarks)
        left_eye = eye_geometry["left"]
        right_eye = eye_geometry["right"]

        left_features = eye_ratio_features(left_center, left_eye)
        right_features = eye_ratio_features(right_center, right_eye)
        raw_horizontal = clamp((left_features["horizontal"] + right_features["horizontal"]) / 2.0)
        raw_vertical = clamp((left_features["vertical"] + right_features["vertical"]) / 2.0)
        top_ratio = clamp((left_features["top_ratio"] + right_features["top_ratio"]) / 2.0)
        bottom_ratio = clamp((left_features["bottom_ratio"] + right_features["bottom_ratio"]) / 2.0)
        opening_ratio = clamp((left_features["opening_ratio"] + right_features["opening_ratio"]) / 2.0)
        raw_horizontal_window.append(raw_horizontal)
        raw_vertical_window.append(raw_vertical)

        head_pose = solve_head_pose(landmarks, width, height, head_state)
        if head_pose is None and head_state["last"] is not None:
            head_pose = head_state["last"]
        elif head_pose is None:
            head_pose = {"pitch": 0.0, "yaw": 0.0, "roll": 0.0, "direction": "Head Forward", "confidence": 0.0, "nose": point_int(landmarks[1]), "vector_end": point_int(landmarks[1])}

        ear = calculate_ear(landmarks)
        blink_threshold = calibration["values"]["blink_threshold"]
        blink_active = ear < blink_threshold
        if blink_active:
            blink_counter += 1
            blink_freeze_frames = BLINK_FREEZE_FRAMES
        else:
            if blink_counter >= EAR_BLINK_MIN_FRAMES:
                blink_total += 1
            blink_counter = 0

        if blink_freeze_frames > 0:
            blink_freeze_frames -= 1

        gaze_features = {
            "raw_horizontal": raw_horizontal,
            "raw_vertical": raw_vertical,
            "top_ratio": top_ratio,
            "bottom_ratio": bottom_ratio,
            "opening_ratio": opening_ratio,
        }

        if not calibration["ready"]:
            accumulate_calibration(calibration, active_phase(calibration), gaze_features, head_pose, ear)

        gaze_result = classify_gaze(
            {
                "raw_horizontal": raw_horizontal,
                "raw_vertical": raw_vertical,
                "top_ratio": top_ratio,
                "bottom_ratio": bottom_ratio,
                "opening_ratio": opening_ratio,
                "yaw": head_pose["yaw"],
                "pitch": head_pose["pitch"],
                "head_yaw": head_pose["yaw"],
                "head_pitch": head_pose["pitch"],
                "blink": blink_freeze_frames > 0 or blink_active,
            },
            gaze_model,
            gaze_history,
        )

        if gaze_result["confidence"] >= 60:
            direction_state["last"] = gaze_result["direction"]
            direction_state["confidence"] = gaze_result["confidence"]
        else:
            gaze_result["direction"] = direction_state["last"]
            gaze_result["confidence"] = direction_state["confidence"]

        head_confidence = int(round(clamp(head_pose["confidence"]) * 100))
        if head_confidence >= 60:
            head_direction_state["last"] = head_pose["direction"]
            head_direction_state["confidence"] = head_confidence
        head_direction = head_direction_state["last"]
        head_score = 100.0 * clamp(head_pose["confidence"])

        gaze_stability_window.append(gaze_result["corrected_horizontal"])
        gaze_stability_window.append(gaze_result["corrected_vertical"])
        gaze_stability = max(0.0, 100.0 - rolling_std(gaze_stability_window, 0.0) * 240.0)

        eye_contact_now = (
            head_direction == "Head Forward"
            and gaze_result["direction"] == "Looking On Screen"
            and gaze_result["confidence"] >= 60
            and head_confidence >= 60
            and not blink_active
            and blink_freeze_frames == 0
        )
        distraction_counter = 0 if eye_contact_now else distraction_counter + 1
        eye_contact_history.append(1 if eye_contact_now else 0)
        eye_contact_score_window.append(1 if eye_contact_now else 0)
        face_presence_window.append(1)

        eye_contact_score = 100.0 * (sum(eye_contact_history) / max(1, len(eye_contact_history)))
        eye_contact_confidence = int(round(100.0 * (sum(eye_contact_score_window) / max(1, len(eye_contact_score_window)))))

        blink_score = 100.0 if not blink_active else max(0.0, 100.0 - ((blink_threshold - ear) / max(blink_threshold, 1e-6)) * 100.0)
        blink_score_window.append(blink_score)
        blink_confidence = int(round(rolling_mean(blink_score_window, blink_score)))

        head_score_window.append(head_score)
        head_score_smooth = rolling_mean(head_score_window, head_score)
        tracking_quality = min(100.0, 0.5 * head_confidence + 0.5 * gaze_stability)

        attention_score = calculate_attention_score(
            eye_contact_score,
            head_score_smooth,
            blink_confidence,
            gaze_stability,
            tracking_quality,
        )
        attention_history.append(attention_score)
        stable_attention = int(round(rolling_mean(attention_history, attention_score)))

        for index in HEAD_POSE_IDS:
            cv2.circle(frame, point_int(landmarks[index]), 3, (255, 0, 255), -1)

        for point in iris["left_points"]:
            cv2.circle(frame, point_int(point), 1, (255, 140, 0), -1)
        for point in iris["right_points"]:
            cv2.circle(frame, point_int(point), 1, (255, 140, 0), -1)

        cv2.circle(frame, point_int(left_center), 3, (0, 0, 255), -1)
        cv2.circle(frame, point_int(right_center), 3, (0, 0, 255), -1)
        cv2.line(frame, head_pose["nose"], head_pose["vector_end"], (0, 255, 255), 2)
        cv2.line(
            frame,
            point_int(left_center),
            (
                int(point_int(left_center)[0] + (gaze_result["corrected_horizontal"] - gaze_model["center_h"]) * 160),
                int(point_int(left_center)[1] + (gaze_result["corrected_vertical"] - gaze_model["center_v"]) * 160),
            ),
            (0, 200, 255),
            2,
        )

        cv2.putText(frame, f"Raw H: {raw_horizontal:.2f}", (20, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)
        cv2.putText(frame, f"Corr H: {gaze_result['corrected_horizontal']:.2f}", (20, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 255), 1)
        cv2.putText(frame, f"Raw V: {raw_vertical:.2f}", (20, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)
        cv2.putText(frame, f"Corr V: {gaze_result['corrected_vertical']:.2f}", (20, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 255), 1)
        cv2.putText(frame, f"{gaze_result['direction']} ({gaze_result['confidence']}%)", (20, 155), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0) if gaze_result["direction"] == "Looking On Screen" else (0, 0, 255), 2)

        cv2.putText(frame, f"{head_direction} ({head_confidence}%)", (20, 190), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 255, 0) if head_direction == "Head Forward" else (0, 0, 255), 2)
        cv2.putText(frame, f"Y/P/R: {head_pose['yaw']:.2f} {head_pose['pitch']:.2f} {head_pose['roll']:.2f}", (20, 215), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        cv2.putText(frame, f"EAR: {ear:.2f}", (20, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        cv2.putText(frame, f"Blinks: {blink_total}", (20, 265), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        cv2.putText(frame, f"Eye Contact: {eye_contact_score:.1f}%", (20, 290), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
        cv2.putText(frame, f"Attention: {stable_attention}%", (20, 315), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        cv2.putText(frame, f"Gaze Stability: {gaze_stability:.1f}", (20, 340), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        cv2.putText(frame, calibration_status, (20, 365), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
        cv2.putText(frame, f"Gaze Conf: {gaze_result['confidence']}%  Head Conf: {head_confidence}%", (20, 415), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)
        cv2.putText(frame, f"Eye Conf: {eye_contact_confidence}%  Blink Conf: {blink_confidence}%", (20, 438), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)
        cv2.putText(frame, f"Tracking Stability: {int(round(gaze_stability))}%", (20, 461), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)
        distances = gaze_result.get("template_distances", {})
        distance_text = "Dist Screen/Away/Down: " + " ".join(f"{distances.get(key, 0.0):.2f}" for key in ("screen", "away", "down"))
        cv2.putText(frame, distance_text, (20, 515), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        gain_text = f"PnP: {head_pose.get('pnp_success', False)}  Reproj: {head_pose.get('reprojection_error', 0.0):.2f}  Tracking: {tracking_quality:.1f}"
        cv2.putText(frame, gain_text, (20, 538), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

    else:
        cv2.putText(frame, "No Face Detected", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        cv2.putText(frame, "Calibration Paused", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

    now = time.perf_counter()
    fps = 1.0 / max(now - last_frame_time, 1e-6)
    last_frame_time = now
    fps_history.append(fps)
    cv2.putText(frame, f"FPS: {np.mean(fps_history):.1f}", (20, 490), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    cv2.imshow("Eye Landmark Detection", frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()

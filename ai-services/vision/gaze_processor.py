import time
from collections import deque

import cv2
import mediapipe as mp
import numpy as np

from constants import (
    BLINK_FREEZE_FRAMES,
    CALIBRATION_STEP_SECONDS,
    CALIBRATION_STEPS,
    EAR_BLINK_MIN_FRAMES,
    EAR_THRESHOLD_SCALE,
    EYE_CONTACT_PERCENTAGE_WINDOW,
    EYE_CONTACT_STABILITY_FRAMES,
    GAZE_STABILITY_WINDOW,
    HEAD_FORWARD_CONFIDENCE_THRESHOLD,
    ROLLING_WINDOW_SIZE,
    VOTING_WINDOW_SIZE,
)
from utils import (
    calculate_ear,
    classify_gaze,
    extract_landmarks,
    eye_ratio_features,
    gaze_model_from_calibration,
    get_eye_geometry,
    get_iris_points,
    clamp,
    rolling_mean,
    rolling_std,
    robust_summary,
    solve_head_pose,
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
            "center_h": 0.5, "center_v": 0.5, "left_h": 0.25, "right_h": 0.75,
            "up_v": 0.25, "down_v": 0.75, "yaw_scale": 1.0, "pitch_scale": 1.0,
            "horizontal_gain": 0.0, "vertical_gain": 0.0, "template_spread": 0.18,
            "templates": {}, "blink_threshold": 0.2, "confidence_floor": 0.55,
        },
        "ready": False,
    }


def calculate_tracking_quality(gaze_confidence, head_pose_confidence, gaze_stability):
    """Return measurement reliability, not candidate performance."""
    values = [max(0.0, min(100.0, float(value))) for value in (
        gaze_confidence, head_pose_confidence, gaze_stability,
    )]
    return round(0.40 * values[0] + 0.30 * values[1] + 0.30 * values[2])


def active_phase(calibration):
    return CALIBRATION_STEPS[min(calibration["phase_index"], len(CALIBRATION_STEPS) - 1)]


def estimate_gain(driver_values, response_values):
    if len(driver_values) < 5 or len(response_values) < 5:
        return 0.0
    driver = np.asarray(driver_values, dtype=np.float32)
    response = np.asarray(response_values, dtype=np.float32)
    driver -= float(np.mean(driver))
    response -= float(np.mean(response))
    variance = float(np.dot(driver, driver))
    return float(np.dot(driver, response) / variance) if variance >= 1e-4 else 0.0


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
                stats["top"]["mean"], stats["bottom"]["mean"], stats["opening"]["mean"],
            ],
            "std": [
                max(stats["h"]["std"], 0.025), max(stats["v"]["std"], 0.025),
                max(stats["top"]["std"], 0.025), max(stats["bottom"]["std"], 0.025),
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


def finalize_current_phase(calibration):
    phase = active_phase(calibration)
    samples = calibration["samples"][phase]
    calibration["stats"][phase] = {
        key: robust_summary(samples[key])
        for key in ("h", "v", "top", "bottom", "opening", "yaw", "pitch", "ear")
    }
    stats = calibration["stats"][phase]
    if phase == "center":
        calibration["values"]["center_h"] = stats["h"]["mean"] or 0.5
        calibration["values"]["center_v"] = stats["v"]["mean"] or 0.5
        calibration["values"]["blink_threshold"] = max(0.15, (stats["ear"]["mean"] or 0.2) * EAR_THRESHOLD_SCALE)
    elif phase in {"left", "right"}:
        calibration["values"][f"{phase}_h"] = stats["h"]["mean"] or calibration["values"][f"{phase}_h"]
    elif phase in {"up", "down"}:
        calibration["values"][f"{phase}_v"] = stats["v"]["mean"] or calibration["values"][f"{phase}_v"]
    calibration["phase_index"] += 1
    calibration["phase_start"] = time.perf_counter()
    if calibration["phase_index"] >= len(CALIBRATION_STEPS):
        calibration["values"]["yaw_scale"] = max(
            1.0,
            abs(calibration["stats"]["left"]["yaw"]["mean"] - calibration["stats"]["center"]["yaw"]["mean"])
            + abs(calibration["stats"]["right"]["yaw"]["mean"] - calibration["stats"]["center"]["yaw"]["mean"]),
        )
        calibration["values"]["pitch_scale"] = max(
            1.0,
            abs(calibration["stats"]["up"]["pitch"]["mean"] - calibration["stats"]["center"]["pitch"]["mean"])
            + abs(calibration["stats"]["down"]["pitch"]["mean"] - calibration["stats"]["center"]["pitch"]["mean"]),
        )
        calibration["values"]["horizontal_gain"] = estimate_gain(calibration["samples"]["center"]["yaw"], calibration["samples"]["center"]["h"])
        calibration["values"]["vertical_gain"] = estimate_gain(calibration["samples"]["center"]["pitch"], calibration["samples"]["center"]["v"])
        calibration["values"]["templates"] = build_templates(calibration)
        calibration["values"]["template_spread"] = estimate_template_spread(calibration["values"]["templates"])
        calibration["ready"] = True


class GazeProcessor:
    def __init__(self):
        self.face_mesh = mp.solutions.face_mesh.FaceMesh(
            static_image_mode=False, max_num_faces=2, refine_landmarks=True,
            min_detection_confidence=0.5, min_tracking_confidence=0.5,
        )
        self.calibration = build_calibration_state()
        self.gaze_history = deque(maxlen=VOTING_WINDOW_SIZE)
        self.state_history = deque(maxlen=3)
        self.gaze_stability_window = deque(maxlen=GAZE_STABILITY_WINDOW)
        self.eye_contact_history = deque(maxlen=EYE_CONTACT_STABILITY_FRAMES)
        self.eye_contact_score_window = deque(maxlen=EYE_CONTACT_PERCENTAGE_WINDOW)
        self.blink_score_window = deque(maxlen=300)
        self.head_score_window = deque(maxlen=300)
        self.attention_history = deque(maxlen=300)
        self.raw_horizontal_window = deque(maxlen=ROLLING_WINDOW_SIZE)
        self.raw_vertical_window = deque(maxlen=ROLLING_WINDOW_SIZE)
        self.head_state = {"last": None, "history": deque(maxlen=5)}
        self.direction_state = {"last": "Looking On Screen", "confidence": 100}
        self.head_direction_state = {"last": "Head Forward", "confidence": 100}
        self.last_left_center = None
        self.last_right_center = None
        self.blink_counter = 0
        self.blink_freeze_frames = 0
        self.blink_total = 0
        self.last_state = "looking_at_screen"
        self.last_quality = 0

    def process_frame(self, frame):
        if frame is None or not hasattr(frame, "shape") or getattr(frame, "size", 0) == 0:
            self.state_history.clear()
            self.last_quality = 0
            return "attention_unavailable"
        frame = cv2.flip(frame, 1)
        height, width, _ = frame.shape
        results = self.face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        if not self.calibration["ready"] and time.perf_counter() - self.calibration["phase_start"] >= CALIBRATION_STEP_SECONDS:
            finalize_current_phase(self.calibration)
        face_landmarks = results.multi_face_landmarks or []
        if len(face_landmarks) > 1:
            self.state_history.clear()
            self.last_quality = 0
            return "multiple_faces"
        if not face_landmarks:
            self.state_history.clear()
            self.last_quality = 0
            return "attention_unavailable"

        landmarks = extract_landmarks(face_landmarks[0], width, height)
        iris = get_iris_points(landmarks)
        left_center, right_center = iris["left_center"], iris["right_center"]
        if self.last_left_center is not None:
            left_center = np.array([0.2 * left_center[0] + 0.8 * self.last_left_center[0], 0.2 * left_center[1] + 0.8 * self.last_left_center[1]], dtype=np.float32)
        if self.last_right_center is not None:
            right_center = np.array([0.2 * right_center[0] + 0.8 * self.last_right_center[0], 0.2 * right_center[1] + 0.8 * self.last_right_center[1]], dtype=np.float32)
        self.last_left_center, self.last_right_center = left_center, right_center
        geometry = get_eye_geometry(landmarks)
        left_features = eye_ratio_features(left_center, geometry["left"])
        right_features = eye_ratio_features(right_center, geometry["right"])
        raw_horizontal = clamp((left_features["horizontal"] + right_features["horizontal"]) / 2.0)
        raw_vertical = clamp((left_features["vertical"] + right_features["vertical"]) / 2.0)
        top_ratio = clamp((left_features["top_ratio"] + right_features["top_ratio"]) / 2.0)
        bottom_ratio = clamp((left_features["bottom_ratio"] + right_features["bottom_ratio"]) / 2.0)
        opening_ratio = clamp((left_features["opening_ratio"] + right_features["opening_ratio"]) / 2.0)
        self.raw_horizontal_window.append(raw_horizontal)
        self.raw_vertical_window.append(raw_vertical)
        head_pose = solve_head_pose(landmarks, width, height, self.head_state) or self.head_state["last"]
        if head_pose is None:
            head_pose = {"pitch": 0.0, "yaw": 0.0, "roll": 0.0, "direction": "Head Forward", "confidence": 0.0}
        ear = calculate_ear(landmarks)
        blink_active = ear < self.calibration["values"]["blink_threshold"]
        if blink_active:
            self.blink_counter += 1
            self.blink_freeze_frames = BLINK_FREEZE_FRAMES
        else:
            self.blink_counter = 0
        self.blink_freeze_frames = max(0, self.blink_freeze_frames - 1)
        features = {
            "raw_horizontal": raw_horizontal, "raw_vertical": raw_vertical,
            "top_ratio": top_ratio, "bottom_ratio": bottom_ratio, "opening_ratio": opening_ratio,
            "yaw": head_pose["yaw"], "pitch": head_pose["pitch"],
            "head_yaw": head_pose["yaw"], "head_pitch": head_pose["pitch"],
            "blink": self.blink_freeze_frames > 0 or blink_active,
        }
        if not self.calibration["ready"]:
            samples = self.calibration["samples"][active_phase(self.calibration)]
            for key, value in {"h": raw_horizontal, "v": raw_vertical, "top": top_ratio, "bottom": bottom_ratio, "opening": opening_ratio, "yaw": head_pose["yaw"], "pitch": head_pose["pitch"], "ear": ear}.items():
                samples[key].append(value)
        result = classify_gaze(features, gaze_model_from_calibration(self.calibration), self.gaze_history)
        gaze_confidence = result.get("confidence", 0)
        head_pose_confidence = clamp(head_pose.get("confidence", 0.0)) * 100
        self.gaze_stability_window.append(result.get("corrected_horizontal", raw_horizontal))
        self.gaze_stability_window.append(result.get("corrected_vertical", raw_vertical))
        rolling_gaze_stability = max(
            0.0,
            100.0 - rolling_std(self.gaze_stability_window, 0.0) * 240.0,
        )
        # Keep the classifier's confidence gate as a conservative startup guard.
        gaze_stability = min(rolling_gaze_stability, result.get("stability", 100))

        head_direction_state = getattr(
            self,
            "head_direction_state",
            {"last": "Head Forward", "confidence": 100},
        )
        head_direction = head_direction_state["last"]
        head_confidence = int(round(head_pose_confidence))
        if head_confidence >= 60:
            self.head_direction_state = {
                "last": head_pose.get("direction", "Head Forward"),
                "confidence": head_confidence,
            }
            head_direction = self.head_direction_state["last"]

        blink_score = 100.0 if not blink_active else max(
            0.0,
            100.0 - ((self.calibration["values"]["blink_threshold"] - ear)
                      / max(self.calibration["values"]["blink_threshold"], 1e-6)) * 100.0,
        )
        blink_score_window = getattr(self, "blink_score_window", None)
        if blink_score_window is None:
            self.blink_score_window = deque(maxlen=300)
            blink_score_window = self.blink_score_window
        blink_score_window.append(blink_score)
        blink_confidence = int(round(rolling_mean(blink_score_window, blink_score)))
        head_score = head_confidence
        head_score_window = getattr(self, "head_score_window", None)
        if head_score_window is None:
            self.head_score_window = deque(maxlen=300)
            head_score_window = self.head_score_window
        head_score_window.append(head_score)
        head_score_smooth = rolling_mean(head_score_window, head_score)

        eye_contact_now = (
            head_direction == "Head Forward"
            and result.get("direction") == "Looking On Screen"
            and gaze_confidence >= 60
            and head_confidence >= 60
            and not blink_active
            and self.blink_freeze_frames == 0
        )
        self.eye_contact_history.append(1 if eye_contact_now else 0)
        self.eye_contact_score_window.append(1 if eye_contact_now else 0)
        eye_contact_score = 100.0 * sum(self.eye_contact_history) / max(1, len(self.eye_contact_history))

        # Match app.py's tracking measurement: pose reliability plus gaze stability.
        self.last_quality = round(min(100.0, 0.5 * head_confidence + 0.5 * gaze_stability))
        if self.last_quality < 50:
            self.state_history.clear()
            return "attention_unavailable"
        if blink_active or self.blink_freeze_frames > 0:
            self.state_history.clear()
            return "attention_unavailable"
        if result["confidence"] >= 60:
            self.direction_state = {"last": result["direction"], "confidence": result["confidence"]}
        result["direction"] = self.direction_state["last"]

        # Head pose supplies reliable directional labels not emitted by classify_gaze.
        directional_state = {
            "Head Left": "looking_left",
            "Head Right": "looking_right",
            "Head Up": "looking_up",
            "Head Down": "looking_down",
        }.get(head_direction)
        next_state = {
            "Looking On Screen": "looking_at_screen",
            "Looking Away": "looking_away",
            "Looking Down": "looking_down",
        }.get(result["direction"])
        if directional_state and head_confidence >= 60 and gaze_confidence >= 60 and gaze_stability >= 60:
            next_state = directional_state
        if next_state is None:
            self.state_history.clear()
            return "attention_unavailable"
        self.state_history.append(next_state)
        self.last_state = max(
            set(self.state_history),
            key=lambda state: (self.state_history.count(state), -list(self.state_history)[::-1].index(state)),
        )
        return self.last_state

    def close(self):
        self.face_mesh.close()

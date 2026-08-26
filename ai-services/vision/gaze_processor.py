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
        self.raw_horizontal_window = deque(maxlen=ROLLING_WINDOW_SIZE)
        self.raw_vertical_window = deque(maxlen=ROLLING_WINDOW_SIZE)
        self.head_state = {"last": None, "history": deque(maxlen=5)}
        self.direction_state = {"last": "Looking On Screen", "confidence": 100}
        self.head_direction_state = {"last": "Head Forward", "confidence": 100}
        self.last_left_center = None
        self.last_right_center = None
        self.blink_counter = 0
        self.blink_freeze_frames = 0
        self.last_state = "looking_at_screen"

    def process_frame(self, frame):
        if frame is None or not hasattr(frame, "shape") or getattr(frame, "size", 0) == 0:
            self.state_history.clear()
            return "attention_unavailable"
        frame = cv2.flip(frame, 1)
        height, width, _ = frame.shape
        results = self.face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        if not self.calibration["ready"] and time.perf_counter() - self.calibration["phase_start"] >= CALIBRATION_STEP_SECONDS:
            finalize_current_phase(self.calibration)
        face_landmarks = results.multi_face_landmarks or []
        if len(face_landmarks) > 1:
            self.state_history.clear()
            return "multiple_faces"
        if not face_landmarks:
            self.state_history.clear()
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
        if result["confidence"] >= 60:
            self.direction_state = {"last": result["direction"], "confidence": result["confidence"]}
        result["direction"] = self.direction_state["last"]
        next_state = {
            "Looking On Screen": "looking_at_screen",
            "Looking Away": "looking_away",
            "Looking Down": "looking_down",
        }.get(result["direction"])
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

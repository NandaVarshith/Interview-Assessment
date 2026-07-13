import cv2
import numpy as np
from collections import deque

from constants import (
    ATTENTION_WINDOW_FRAMES,
    BLINK_FREEZE_FRAMES,
    CHIN,
    EAR_BLINK_MIN_FRAMES,
    EAR_THRESHOLD_SCALE,
    FOREHEAD,
    GAZE_CONFIDENCE_THRESHOLD,
    GAZE_DOWN_MARGIN,
    GAZE_MONITOR_MARGIN,
    GAZE_STABILITY_TOLERANCE,
    GAZE_STABILITY_WINDOW,
    GAZE_TOLERANCE,
    HEAD_PNPSMOOTH_WINDOW,
    HEAD_FORWARD_CONFIDENCE_THRESHOLD,
    HEAD_JUMP_LIMIT_DEGREES,
    HEAD_PITCH_TOLERANCE,
    HEAD_FORWARD_TOLERANCE,
    HEAD_YAW_TOLERANCE,
    LEFT_EYE_BOTTOM,
    LEFT_EYE_INNER,
    LEFT_EYE_LEFT_CORNER,
    LEFT_EYE_OUTER,
    LEFT_EYE_RIGHT_CORNER,
    LEFT_EYE_TOP,
    LEFT_IRIS,
    LEFT_MOUTH,
    LINE_LENGTH,
    MOUTH_UP,
    NOSE_TIP,
    RIGHT_EYE_BOTTOM,
    RIGHT_EYE_INNER,
    RIGHT_EYE_LEFT_CORNER,
    RIGHT_EYE_OUTER,
    RIGHT_EYE_RIGHT_CORNER,
    RIGHT_EYE_TOP,
    RIGHT_IRIS,
    RIGHT_MOUTH,
    SMOOTHING_ALPHA,
    MAX_HEAD_JUMP_DEGREES,
    CONFIDENCE_REJECT_THRESHOLD,
    VECTOR_LENGTH,
)


def extract_landmarks(face_landmarks, width, height):
    return np.array([(lm.x * width, lm.y * height) for lm in face_landmarks.landmark], dtype=np.float32)


def point_int(point):
    return int(point[0]), int(point[1])


def clamp(value, minimum=0.0, maximum=1.0):
    return float(max(minimum, min(maximum, value)))


def ema(current, previous, alpha=SMOOTHING_ALPHA):
    return current if previous is None else alpha * current + (1.0 - alpha) * previous


def rolling_mean(values, fallback=0.5):
    return float(np.mean(values)) if values else fallback


def rolling_std(values, fallback=0.0):
    return float(np.std(values)) if values else fallback


class ScalarKalman:
    def __init__(self, process_noise, measurement_noise, initial_value=0.0):
        self.process_noise = process_noise
        self.measurement_noise = measurement_noise
        self.estimate = float(initial_value)
        self.error = 1.0
        self.initialized = False

    def update(self, measurement):
        measurement = float(measurement)
        if not self.initialized:
            self.estimate = measurement
            self.initialized = True
            return self.estimate

        self.error += self.process_noise
        gain = self.error / (self.error + self.measurement_noise)
        self.estimate = self.estimate + gain * (measurement - self.estimate)
        self.error = (1.0 - gain) * self.error
        return self.estimate


def confidence_interval(values):
    if not values:
        return (0.0, 0.0)
    mean_value = float(np.mean(values))
    std_value = float(np.std(values))
    margin = 1.96 * std_value / max(np.sqrt(len(values)), 1.0)
    return mean_value - margin, mean_value + margin


def summarize_samples(values):
    if not values:
        return {"mean": 0.0, "min": 0.0, "max": 0.0, "std": 0.0, "ci_low": 0.0, "ci_high": 0.0}
    ci_low, ci_high = confidence_interval(values)
    return {
        "mean": float(np.mean(values)),
        "min": float(np.min(values)),
        "max": float(np.max(values)),
        "std": float(np.std(values)),
        "ci_low": float(ci_low),
        "ci_high": float(ci_high),
    }


def robust_summary(values):
    if not values:
        return summarize_samples(values)
    values_np = np.asarray(values, dtype=np.float32)
    median = float(np.median(values_np))
    mad = float(np.median(np.abs(values_np - median)))
    if mad > 1e-6:
        filtered = values_np[np.abs(values_np - median) <= 2.5 * 1.4826 * mad]
    else:
        filtered = values_np
    if len(filtered) < max(3, len(values_np) // 2):
        filtered = values_np
    return summarize_samples(filtered.tolist())


def calculate_iris_center(iris_points):
    iris_np = np.array(iris_points, dtype=np.float32)
    center, radius = cv2.minEnclosingCircle(iris_np)
    return np.array([center[0], center[1]], dtype=np.float32), float(radius)


def iris_descriptor(iris_points):
    points = np.asarray(iris_points, dtype=np.float32)
    circle_center, radius = calculate_iris_center(points)
    mean_center = np.mean(points, axis=0)
    covariance = np.cov((points - mean_center).T) if len(points) >= 3 else np.eye(2)
    eigenvalues, eigenvectors = np.linalg.eigh(covariance)
    major_axis = eigenvectors[:, int(np.argmax(eigenvalues))]
    orientation = float(np.degrees(np.arctan2(major_axis[1], major_axis[0])))
    center = 0.35 * circle_center + 0.65 * mean_center
    return {
        "points": points,
        "center": center.astype(np.float32),
        "circle_center": circle_center,
        "mean_center": mean_center.astype(np.float32),
        "radius": radius,
        "orientation": orientation,
    }


def get_eye_points(landmarks):
    left_indices = np.array([LEFT_EYE_LEFT_CORNER, 163, 144, LEFT_EYE_TOP, LEFT_EYE_BOTTOM, 153, 154, 155, LEFT_EYE_RIGHT_CORNER, 173, 157, 158, 159, 160, 161, 246], dtype=np.int32)
    right_indices = np.array([RIGHT_EYE_LEFT_CORNER, 382, 381, 380, RIGHT_EYE_BOTTOM, 373, 390, 249, RIGHT_EYE_RIGHT_CORNER, 466, 388, 387, RIGHT_EYE_TOP, 385, 384, 398], dtype=np.int32)
    return landmarks[left_indices], landmarks[right_indices]


def get_head_landmarks(landmarks):
    return {
        "nose": landmarks[NOSE_TIP],
        "chin": landmarks[CHIN],
        "forehead": landmarks[FOREHEAD],
        "left_eye_outer": landmarks[LEFT_EYE_OUTER],
        "right_eye_outer": landmarks[RIGHT_EYE_OUTER],
        "left_eye_inner": landmarks[LEFT_EYE_INNER],
        "right_eye_inner": landmarks[RIGHT_EYE_INNER],
        "left_mouth": landmarks[LEFT_MOUTH],
        "right_mouth": landmarks[RIGHT_MOUTH],
        "mouth_up": landmarks[MOUTH_UP],
    }


def get_iris_points(landmarks):
    left_points = landmarks[np.array(LEFT_IRIS, dtype=np.int32)]
    right_points = landmarks[np.array(RIGHT_IRIS, dtype=np.int32)]
    left_iris = iris_descriptor(left_points)
    right_iris = iris_descriptor(right_points)
    return {
        "left_points": left_points,
        "right_points": right_points,
        "left_center": left_iris["center"],
        "right_center": right_iris["center"],
        "left_radius": left_iris["radius"],
        "right_radius": right_iris["radius"],
        "left_orientation": left_iris["orientation"],
        "right_orientation": right_iris["orientation"],
        "left_mean_center": left_iris["mean_center"],
        "right_mean_center": right_iris["mean_center"],
    }


def get_eye_geometry(landmarks):
    left_corner = landmarks[LEFT_EYE_LEFT_CORNER]
    left_inner = landmarks[LEFT_EYE_RIGHT_CORNER]
    left_top = landmarks[LEFT_EYE_TOP]
    left_bottom = landmarks[LEFT_EYE_BOTTOM]

    right_corner = landmarks[RIGHT_EYE_LEFT_CORNER]
    right_inner = landmarks[RIGHT_EYE_RIGHT_CORNER]
    right_top = landmarks[RIGHT_EYE_TOP]
    right_bottom = landmarks[RIGHT_EYE_BOTTOM]

    return {
        "left": {
            "left_corner": left_corner,
            "right_corner": left_inner,
            "top": left_top,
            "bottom": left_bottom,
            "width": max(1.0, float(np.linalg.norm(left_inner - left_corner))),
            "height": max(1.0, float(np.linalg.norm(left_bottom - left_top))),
        },
        "right": {
            "left_corner": right_corner,
            "right_corner": right_inner,
            "top": right_top,
            "bottom": right_bottom,
            "width": max(1.0, float(np.linalg.norm(right_inner - right_corner))),
            "height": max(1.0, float(np.linalg.norm(right_bottom - right_top))),
        },
    }


def normalized_iris_position(iris_center, eye):
    eye_x, eye_y, width, height = eye_axes(eye)
    iris = np.asarray(iris_center, dtype=np.float32)
    horizontal = clamp(float(np.dot(iris - eye["left_corner"], eye_x)) / width)
    vertical = clamp(float(np.dot(iris - eye["top"], eye_y)) / height)
    return horizontal, vertical


def eye_axes(eye):
    corner_vector = np.asarray(eye["right_corner"] - eye["left_corner"], dtype=np.float32)
    lid_vector = np.asarray(eye["bottom"] - eye["top"], dtype=np.float32)
    width = max(1.0, float(np.linalg.norm(corner_vector)))
    height = max(1.0, float(np.linalg.norm(lid_vector)))
    return corner_vector / width, lid_vector / height, width, height


def eye_ratio_features(iris_center, eye):
    horizontal, vertical = normalized_iris_position(iris_center, eye)
    _, eye_y, width, height = eye_axes(eye)
    top_distance = abs(float(np.dot(iris_center - eye["top"], eye_y)))
    bottom_distance = abs(float(np.dot(eye["bottom"] - iris_center, eye_y)))
    diagonal = max(1.0, float(np.sqrt(width * width + height * height)))
    return {
        "horizontal": horizontal,
        "vertical": vertical,
        "top_ratio": clamp(top_distance / height),
        "bottom_ratio": clamp(bottom_distance / height),
        "opening_ratio": clamp(height / diagonal),
        "diagonal": diagonal,
    }


def calculate_head_model_points():
    return np.array(
        [
            (0.0, 0.0, 0.0),          # Nose tip
            (0.0, -330.0, -65.0),     # Chin
            (-225.0, 170.0, -135.0),  # Left eye outer corner
            (225.0, 170.0, -135.0),   # Right eye outer corner
            (-150.0, -150.0, -125.0), # Left mouth corner
            (150.0, -150.0, -125.0),  # Right mouth corner
        ],
        dtype=np.float64,
    )


def rotation_matrix_to_euler(rotation_matrix):
    sy = np.sqrt(rotation_matrix[0, 0] * rotation_matrix[0, 0] + rotation_matrix[1, 0] * rotation_matrix[1, 0])
    singular = sy < 1e-6
    if singular:
        pitch = np.arctan2(-rotation_matrix[1, 2], rotation_matrix[1, 1])
        yaw = np.arctan2(-rotation_matrix[2, 0], sy)
        roll = 0.0
    else:
        pitch = np.arctan2(rotation_matrix[2, 1], rotation_matrix[2, 2])
        yaw = np.arctan2(-rotation_matrix[2, 0], sy)
        roll = np.arctan2(rotation_matrix[1, 0], rotation_matrix[0, 0])
    return tuple(np.degrees([pitch, yaw, roll]))


def solve_head_pose(landmarks, width, height, state):
    image_points = np.array(
        [
            landmarks[NOSE_TIP],
            landmarks[CHIN],
            landmarks[LEFT_EYE_OUTER],
            landmarks[RIGHT_EYE_OUTER],
            landmarks[LEFT_MOUTH],
            landmarks[RIGHT_MOUTH],
        ],
        dtype=np.float64,
    )

    model_points = calculate_head_model_points()
    focal_length = float(width)
    camera_matrix = np.array([[focal_length, 0.0, width / 2.0], [0.0, focal_length, height / 2.0], [0.0, 0.0, 1.0]], dtype=np.float64)
    dist_coeffs = np.zeros((4, 1), dtype=np.float64)

    success, rvec, tvec = cv2.solvePnP(
        model_points,
        image_points,
        camera_matrix,
        dist_coeffs,
        flags=cv2.SOLVEPNP_ITERATIVE,
    )
    if not success:
        success, rvec, tvec = cv2.solvePnP(
            model_points,
            image_points,
            camera_matrix,
            dist_coeffs,
            flags=cv2.SOLVEPNP_EPNP,
        )
    if not success:
        return None

    projected, _ = cv2.projectPoints(model_points, rvec, tvec, camera_matrix, dist_coeffs)
    reprojection_error = float(np.mean(np.linalg.norm(projected.reshape(-1, 2) - image_points, axis=1)))

    rotation_matrix, _ = cv2.Rodrigues(rvec)
    pitch, yaw, roll = map(float, rotation_matrix_to_euler(rotation_matrix))

    prev = state.get("last")
    if prev is not None:
        pitch = ema(pitch, prev["pitch"], SMOOTHING_ALPHA)
        yaw = ema(yaw, prev["yaw"], SMOOTHING_ALPHA)
        roll = ema(roll, prev["roll"], SMOOTHING_ALPHA)

    direction = "Head Forward"
    if yaw > HEAD_YAW_TOLERANCE:
        direction = "Head Left"
    elif yaw < -HEAD_YAW_TOLERANCE:
        direction = "Head Right"
    elif pitch < -HEAD_PITCH_TOLERANCE:
        direction = "Head Up"
    elif pitch > HEAD_PITCH_TOLERANCE:
        direction = "Head Down"

    confidence = clamp(1.0 - reprojection_error / 20.0)

    nose = point_int(landmarks[NOSE_TIP])
    nose_direction = np.array([[0.0, 0.0, VECTOR_LENGTH]], dtype=np.float64)
    projected_point, _ = cv2.projectPoints(nose_direction, rvec, tvec, camera_matrix, dist_coeffs)
    vector_end = tuple(np.ravel(projected_point).astype(int))

    result = {
        "pitch": pitch,
        "yaw": yaw,
        "roll": roll,
        "direction": direction,
        "confidence": confidence,
        "nose": nose,
        "vector_end": vector_end,
        "rotation_vector": rvec,
        "translation_vector": tvec,
        "reprojection_error": reprojection_error,
        "pnp_success": True,
    }
    state["last"] = result
    state.setdefault("history", deque(maxlen=HEAD_PNPSMOOTH_WINDOW)).append(result)
    return result


def gaze_model_from_calibration(calibration):
    values = calibration["values"]
    center_horizontal = values.get("center_horizontal", values.get("center_h", 0.5))
    center_vertical = values.get("center_vertical", values.get("center_v", 0.5))
    left_h = values.get("left_h", center_horizontal - GAZE_TOLERANCE)
    right_h = values.get("right_h", center_horizontal + GAZE_TOLERANCE)
    up_v = values.get("up_v", center_vertical - GAZE_TOLERANCE)
    down_v = values.get("down_v", center_vertical + GAZE_TOLERANCE)
    horizontal_min = clamp(min(left_h, right_h, center_horizontal) - GAZE_MONITOR_MARGIN)
    horizontal_max = clamp(max(left_h, right_h, center_horizontal) + GAZE_MONITOR_MARGIN)
    vertical_min = clamp(min(up_v, down_v, center_vertical) - GAZE_MONITOR_MARGIN)
    vertical_max = clamp(max(up_v, down_v, center_vertical) + GAZE_MONITOR_MARGIN)
    return {
        "center_horizontal": center_horizontal,
        "center_vertical": center_vertical,
        "center_h": center_horizontal,
        "center_v": center_vertical,
        "horizontal_min": horizontal_min,
        "horizontal_max": horizontal_max,
        "vertical_min": vertical_min,
        "vertical_max": vertical_max,
        "down_threshold": min(0.95, vertical_max + GAZE_DOWN_MARGIN),
    }


def classify_gaze(features, model, history):
    corrected_h = clamp(features["raw_horizontal"])
    corrected_v = clamp(features["raw_vertical"])
    delta_h = corrected_h - model.get("center_horizontal", model.get("center_h", 0.5))
    delta_v = corrected_v - model.get("center_vertical", model.get("center_v", 0.5))
    horizontal_min = model.get("horizontal_min", 0.5 - GAZE_TOLERANCE)
    horizontal_max = model.get("horizontal_max", 0.5 + GAZE_TOLERANCE)
    vertical_min = model.get("vertical_min", 0.5 - GAZE_TOLERANCE)
    vertical_max = model.get("vertical_max", 0.5 + GAZE_TOLERANCE)
    down_threshold = model.get("down_threshold", clamp(vertical_max + GAZE_DOWN_MARGIN))

    inside_horizontal = horizontal_min <= corrected_h <= horizontal_max
    inside_vertical = vertical_min <= corrected_v <= vertical_max
    if corrected_v > down_threshold:
        direction = "Looking Down"
        confidence = clamp((corrected_v - down_threshold) / max(1.0 - down_threshold, 1e-6))
    elif inside_horizontal and inside_vertical:
        direction = "Looking On Screen"
        confidence = 1.0
    else:
        direction = "Looking Away"
        horizontal_distance = max(horizontal_min - corrected_h, corrected_h - horizontal_max, 0.0)
        vertical_distance = max(vertical_min - corrected_v, corrected_v - vertical_max, 0.0)
        confidence = clamp(max(horizontal_distance, vertical_distance) / max(GAZE_MONITOR_MARGIN, 1e-6))

    frozen = False

    if features.get("blink"):
        direction = history[-1]["direction"] if history else "Looking On Screen"
        confidence = history[-1]["confidence"] / 100.0 if history and history[-1]["confidence"] > 1 else (history[-1]["confidence"] if history else 1.0)
        frozen = True
    elif confidence < CONFIDENCE_REJECT_THRESHOLD:
        direction = history[-1]["direction"] if history else "Looking On Screen"

    distances = {
        "screen": 0.0 if inside_horizontal and inside_vertical else float(np.linalg.norm([max(horizontal_min - corrected_h, corrected_h - horizontal_max, 0.0), max(vertical_min - corrected_v, corrected_v - vertical_max, 0.0)])),
        "away": max(horizontal_min - corrected_h, corrected_h - horizontal_max, vertical_min - corrected_v, corrected_v - vertical_max, 0.0),
        "down": max(corrected_v - down_threshold, 0.0),
    }
    history.append({"direction": direction, "confidence": confidence, "h": corrected_h, "v": corrected_v, "distances": distances})
    recent = list(history)
    stability = 1.0 - min(1.0, (rolling_std([item["h"] for item in recent], 0.0) + rolling_std([item["v"] for item in recent], 0.0)) / 0.25)

    return {
        "raw_horizontal": features["raw_horizontal"],
        "raw_vertical": features["raw_vertical"],
        "corrected_horizontal": corrected_h,
        "corrected_vertical": corrected_v,
        "offset_horizontal": delta_h,
        "offset_vertical": delta_v,
        "direction": direction,
        "confidence": int(round(confidence * 100)),
        "stability": int(round(stability * 100)),
        "template_distances": distances,
        "monitor_bounds": (horizontal_min, horizontal_max, vertical_min, vertical_max),
        "frozen": frozen,
    }


def calculate_ear(landmarks):
    left_vertical = float(np.linalg.norm(landmarks[LEFT_EYE_TOP] - landmarks[LEFT_EYE_BOTTOM]))
    left_horizontal = max(1.0, float(np.linalg.norm(landmarks[LEFT_EYE_LEFT_CORNER] - landmarks[LEFT_EYE_RIGHT_CORNER])))
    right_vertical = float(np.linalg.norm(landmarks[RIGHT_EYE_TOP] - landmarks[RIGHT_EYE_BOTTOM]))
    right_horizontal = max(1.0, float(np.linalg.norm(landmarks[RIGHT_EYE_LEFT_CORNER] - landmarks[RIGHT_EYE_RIGHT_CORNER])))
    return float(((left_vertical / left_horizontal) + (right_vertical / right_horizontal)) / 2.0)


def eye_feature_pack(landmarks):
    return {
        "left_vertical": float(np.linalg.norm(landmarks[LEFT_EYE_TOP] - landmarks[LEFT_EYE_BOTTOM])),
        "left_horizontal": max(1.0, float(np.linalg.norm(landmarks[LEFT_EYE_LEFT_CORNER] - landmarks[LEFT_EYE_RIGHT_CORNER]))),
        "right_vertical": float(np.linalg.norm(landmarks[RIGHT_EYE_TOP] - landmarks[RIGHT_EYE_BOTTOM])),
        "right_horizontal": max(1.0, float(np.linalg.norm(landmarks[RIGHT_EYE_LEFT_CORNER] - landmarks[RIGHT_EYE_RIGHT_CORNER]))),
    }


def gaze_confidence(distance_to_boundary, scale):
    if scale <= 1e-6:
        return 0.0
    return clamp(distance_to_boundary / scale)


def calculate_attention_score(eye_contact, head_pose, blink_score, gaze_stability, face_visibility):
    score = (
        0.50 * eye_contact
        + 0.30 * head_pose
        + 0.10 * blink_score
        + 0.10 * face_visibility
    )
    return int(max(0, min(100, round(score))))


def classify_with_confidence(value, lower, upper):
    midpoint = (lower + upper) / 2.0
    if value < lower:
        return "low", clamp((lower - value) / max(abs(lower - midpoint), 1e-6))
    if value > upper:
        return "high", clamp((value - upper) / max(abs(upper - midpoint), 1e-6))
    confidence = clamp(1.0 - abs(value - midpoint) / max(abs(upper - lower) / 2.0, 1e-6))
    return "center", confidence


def confidence_from_distance(distance, spread):
    return clamp(1.0 - distance / max(spread, 1e-6))

import unittest
from collections import deque
from types import SimpleNamespace
from unittest.mock import Mock, patch

import numpy as np

import gaze_processor


class GazeProcessorStateTests(unittest.TestCase):
    def make_processor(self, faces):
        processor = gaze_processor.GazeProcessor.__new__(gaze_processor.GazeProcessor)
        processor.face_mesh = Mock()
        processor.face_mesh.process.return_value = SimpleNamespace(multi_face_landmarks=faces)
        processor.calibration = {"ready": True, "values": {"blink_threshold": 0.1}}
        processor.gaze_history = deque(maxlen=15)
        processor.state_history = deque(maxlen=3)
        processor.gaze_stability_window = deque(maxlen=30)
        processor.eye_contact_history = deque(maxlen=30)
        processor.eye_contact_score_window = deque(maxlen=300)
        processor.raw_horizontal_window = deque(maxlen=5)
        processor.raw_vertical_window = deque(maxlen=5)
        processor.head_state = {"last": None, "history": deque(maxlen=5)}
        processor.direction_state = {"last": "Looking On Screen", "confidence": 100}
        processor.last_left_center = None
        processor.last_right_center = None
        processor.blink_counter = 0
        processor.blink_freeze_frames = 0
        processor.last_state = "looking_at_screen"
        return processor

    def test_invalid_and_empty_frames_are_unavailable(self):
        processor = self.make_processor([])
        self.assertEqual(processor.process_frame(None), "attention_unavailable")
        self.assertEqual(processor.process_frame(np.empty((0, 0, 3), dtype=np.uint8)), "attention_unavailable")

    def test_no_face_clears_history(self):
        processor = self.make_processor([])
        processor.state_history.append("looking_away")
        self.assertEqual(processor.process_frame(np.zeros((10, 10, 3), dtype=np.uint8)), "attention_unavailable")
        self.assertEqual(list(processor.state_history), [])

    def test_multiple_faces_are_unavailable_for_single_face_classification(self):
        processor = self.make_processor([object(), object()])
        processor.state_history.append("looking_away")
        self.assertEqual(processor.process_frame(np.zeros((10, 10, 3), dtype=np.uint8)), "multiple_faces")
        self.assertEqual(list(processor.state_history), [])

    def test_valid_face_is_classified_and_smoothed(self):
        processor = self.make_processor([object()])
        directions = iter(("Looking On Screen", "Looking Away", "Looking Away"))
        eye = {"horizontal": 0.5, "vertical": 0.5, "top_ratio": 0.5, "bottom_ratio": 0.5, "opening_ratio": 0.5}
        iris = {"left_center": np.array([1, 1]), "right_center": np.array([1, 1])}
        geometry = {"left": {}, "right": {}}
        head_pose = {"yaw": 0.0, "pitch": 0.0, "confidence": 1.0}
        gaze_result = lambda: {"direction": next(directions), "confidence": 100, "stability": 100}
        with patch.object(gaze_processor, "extract_landmarks", return_value=np.zeros((478, 2))), \
            patch.object(gaze_processor, "get_iris_points", return_value=iris), \
            patch.object(gaze_processor, "get_eye_geometry", return_value=geometry), \
            patch.object(gaze_processor, "eye_ratio_features", return_value=eye), \
            patch.object(gaze_processor, "solve_head_pose", return_value=head_pose), \
            patch.object(gaze_processor, "calculate_ear", return_value=1.0), \
            patch.object(gaze_processor, "gaze_model_from_calibration", return_value={}), \
            patch.object(gaze_processor, "classify_gaze", side_effect=lambda *args: gaze_result()):
            states = [processor.process_frame(np.zeros((10, 10, 3), dtype=np.uint8)) for _ in range(3)]
        self.assertEqual(states, ["looking_at_screen", "looking_away", "looking_away"])

    def test_low_tracking_quality_is_unavailable(self):
        processor = self.make_processor([object()])
        eye = {"horizontal": 0.5, "vertical": 0.5, "top_ratio": 0.5, "bottom_ratio": 0.5, "opening_ratio": 0.5}
        iris = {"left_center": np.array([1, 1]), "right_center": np.array([1, 1])}
        geometry = {"left": {}, "right": {}}
        with patch.object(gaze_processor, "extract_landmarks", return_value=np.zeros((478, 2))), \
            patch.object(gaze_processor, "get_iris_points", return_value=iris), \
            patch.object(gaze_processor, "get_eye_geometry", return_value=geometry), \
            patch.object(gaze_processor, "eye_ratio_features", return_value=eye), \
            patch.object(gaze_processor, "solve_head_pose", return_value={"yaw": 0.0, "pitch": 0.0, "confidence": 0.1}), \
            patch.object(gaze_processor, "calculate_ear", return_value=1.0), \
            patch.object(gaze_processor, "gaze_model_from_calibration", return_value={}), \
            patch.object(gaze_processor, "classify_gaze", return_value={"direction": "Looking On Screen", "confidence": 0, "stability": 0}):
            state = processor.process_frame(np.zeros((10, 10, 3), dtype=np.uint8))
        self.assertEqual(state, "attention_unavailable")

    def test_moderate_head_confidence_can_remain_usable(self):
        processor = self.make_processor([object()])
        eye = {"horizontal": 0.5, "vertical": 0.5, "top_ratio": 0.5, "bottom_ratio": 0.5, "opening_ratio": 0.5}
        iris = {"left_center": np.array([1, 1]), "right_center": np.array([1, 1])}
        geometry = {"left": {}, "right": {}}
        with patch.object(gaze_processor, "extract_landmarks", return_value=np.zeros((478, 2))), \
            patch.object(gaze_processor, "get_iris_points", return_value=iris), \
            patch.object(gaze_processor, "get_eye_geometry", return_value=geometry), \
            patch.object(gaze_processor, "eye_ratio_features", return_value=eye), \
            patch.object(gaze_processor, "solve_head_pose", return_value={"yaw": 0.0, "pitch": 0.0, "confidence": 0.5}), \
            patch.object(gaze_processor, "calculate_ear", return_value=1.0), \
            patch.object(gaze_processor, "gaze_model_from_calibration", return_value={}), \
            patch.object(gaze_processor, "classify_gaze", return_value={"direction": "Looking On Screen", "confidence": 100, "stability": 100}):
            state = processor.process_frame(np.zeros((10, 10, 3), dtype=np.uint8))
        self.assertEqual(state, "looking_at_screen")

    def test_tracking_quality_uses_weighted_measurements(self):
        self.assertEqual(gaze_processor.calculate_tracking_quality(100, 80, 0), 64)
        self.assertGreaterEqual(gaze_processor.calculate_tracking_quality(100, 50, 100), 50)
        self.assertLess(gaze_processor.calculate_tracking_quality(0, 10, 0), 50)


if __name__ == "__main__":
    unittest.main()

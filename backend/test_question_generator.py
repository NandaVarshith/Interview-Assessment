import unittest

from services.question_generator import _aggregate_final_signals


EVALUATION = {
    "technicalKnowledge": "high",
    "answerQuality": "high",
    "resumeConsistency": "high",
    "topicCoverage": "high",
}


class FinalSignalTests(unittest.TestCase):
    def test_full_valid_coverage_keeps_attention(self):
        result = _aggregate_final_signals({"gazeMetrics": {
            "lookingAtScreenPercentage": 100,
            "lookingAwayPercentage": 0,
            "lookingDownPercentage": 0,
            "validObservationCount": 10,
            "totalObservationCount": 10,
            "observationCoverage": 1,
        }}, EVALUATION)
        self.assertEqual(result["attention"], 100)
        self.assertEqual(result["overallScore"], 100)

    def test_mixed_valid_states_preserve_existing_formula(self):
        result = _aggregate_final_signals({"gazeMetrics": {
            "lookingAtScreenPercentage": 50,
            "lookingAwayPercentage": 25,
            "lookingDownPercentage": 25,
            "validObservationCount": 8,
            "totalObservationCount": 10,
            "observationCoverage": 0.8,
        }}, EVALUATION)
        self.assertEqual(result["attention"], 75)

    def test_low_coverage_leaves_attention_unavailable(self):
        result = _aggregate_final_signals({"gazeMetrics": {
            "lookingAtScreenPercentage": 100,
            "lookingAwayPercentage": 0,
            "lookingDownPercentage": 0,
            "validObservationCount": 2,
            "totalObservationCount": 10,
            "observationCoverage": 0.2,
        }}, EVALUATION)
        self.assertIsNone(result["attention"])
        self.assertEqual(result["overallScore"], 100)

    def test_unavailable_and_multiple_faces_are_not_valid_observations(self):
        result = _aggregate_final_signals({"gazeMetrics": {
            "lookingAtScreenPercentage": 100,
            "lookingAwayPercentage": 0,
            "lookingDownPercentage": 0,
            "validObservationCount": 1,
            "totalObservationCount": 10,
            "unavailableObservationCount": 7,
            "multipleFaceObservationCount": 2,
            "observationCoverage": 0.1,
        }}, EVALUATION)
        self.assertIsNone(result["attention"])

    def test_missing_gaze_preserves_technical_fallback(self):
        result = _aggregate_final_signals({}, EVALUATION)
        self.assertIsNone(result["attention"])
        self.assertEqual(result["overallScore"], 100)


if __name__ == "__main__":
    unittest.main()

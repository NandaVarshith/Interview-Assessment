"""Persist completed, real interview records for offline research analysis."""

import csv
import json
import re
from datetime import datetime, timezone
from pathlib import Path


EXPORT_DIR = Path(__file__).resolve().parent.parent / "experiment_exports"


def _safe_id(value):
    value = str(value or "").strip()
    if not re.fullmatch(r"[A-Za-z0-9_-]{1,80}", value):
        raise ValueError("A valid interviewId is required.")
    return value


def _append_csv(path, fieldnames, rows):
    if not rows:
        return
    new_file = not path.exists()
    with path.open("a", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore")
        if new_file:
            writer.writeheader()
        writer.writerows(rows)


def export_completed_interview(summary, evaluation):
    """Export only values generated during a completed browser interview."""
    interview_id = _safe_id(summary.get("interviewId"))
    completed_at = summary.get("completedAt")
    if not isinstance(completed_at, str) or not completed_at.strip():
        raise ValueError("A completed interview timestamp is required.")
    if not isinstance(summary.get("responses"), list) or not isinstance(summary.get("decisions"), list):
        raise ValueError("Completed responses and decisions are required.")

    EXPORT_DIR.mkdir(exist_ok=True)
    exported_at = datetime.now(timezone.utc).isoformat()
    record = {"interviewId": interview_id, "exportedAt": exported_at, "summary": summary, "evaluation": evaluation}
    raw_path = EXPORT_DIR / f"{interview_id}.json"
    raw_path.write_text(json.dumps(record, indent=2, ensure_ascii=False), encoding="utf-8")

    action_rows = []
    for decision in summary["decisions"]:
        if not isinstance(decision, dict):
            continue
        assessed = decision.get("evaluation") if isinstance(decision.get("evaluation"), dict) else {}
        action_rows.append({
            "interview_id": interview_id,
            "completed_at": completed_at,
            "decided_at": decision.get("decidedAt"),
            "question_number": decision.get("questionIndex", 0) + 1 if isinstance(decision.get("questionIndex"), int) else "",
            "action": decision.get("action"),
            "answer_class": decision.get("answerClass"),
            "correctness": assessed.get("correctness"),
            "relevance": assessed.get("relevance"),
            "depth": assessed.get("depth"),
        })
    _append_csv(EXPORT_DIR / "adaptive_actions.csv",
                ["interview_id", "completed_at", "decided_at", "question_number", "action", "answer_class", "correctness", "relevance", "depth"],
                action_rows)

    speech_rows = []
    for response in summary["responses"]:
        if not isinstance(response, dict) or not isinstance(response.get("speech"), dict):
            continue
        speech = response["speech"]
        speech_rows.append({
            "interview_id": interview_id, "completed_at": completed_at, "captured_at": speech.get("capturedAt"),
            "question_number": response.get("questionIndex", 0) + 1 if isinstance(response.get("questionIndex"), int) else "",
            "response_type": response.get("type", "main"),
            "duration_seconds": speech.get("durationSeconds"), "word_count": speech.get("wordCount"),
            "wpm": speech.get("wordsPerMinute"), "filler_count": speech.get("fillerCount"),
            "filler_frequency": speech.get("fillerFrequency"), "repetition_level": speech.get("repetition"),
            "pace": speech.get("speakingPace"), "clarity": speech.get("clarity"), "fluency": speech.get("fluency"),
        })
    _append_csv(EXPORT_DIR / "speech_results.csv",
                ["interview_id", "completed_at", "captured_at", "question_number", "response_type", "duration_seconds", "word_count", "wpm", "filler_count", "filler_frequency", "repetition_level", "pace", "clarity", "fluency"],
                speech_rows)

    gaze = summary.get("gazeMetrics") if isinstance(summary.get("gazeMetrics"), dict) else None
    if gaze is not None:
        total = gaze.get("totalObservationCount")
        valid = gaze.get("validObservationCount")
        states = (
            ("looking_at_screen", gaze.get("lookingAtScreenPercentage"), None),
            ("looking_away", gaze.get("lookingAwayPercentage"), None),
            ("looking_down", gaze.get("lookingDownPercentage"), None),
            ("attention_unavailable", None, gaze.get("unavailableObservationCount")),
            ("multiple_faces", None, gaze.get("multipleFaceObservationCount")),
        )
        rows = []
        for state, percentage, count in states:
            if count is None and isinstance(percentage, (int, float)) and isinstance(valid, (int, float)):
                count = round(valid * percentage / 100)
            rows.append({"interview_id": interview_id, "completed_at": completed_at, "state": state,
                         "observation_count": count, "percentage": percentage,
                         "total_observation_count": total, "observation_coverage": gaze.get("observationCoverage")})
        _append_csv(EXPORT_DIR / "attention_results.csv",
                    ["interview_id", "completed_at", "state", "observation_count", "percentage", "total_observation_count", "observation_coverage"], rows)

    if isinstance(evaluation, dict):
        _append_csv(EXPORT_DIR / "evaluation_results.csv",
                    ["interview_id", "completed_at", "technicalKnowledge", "answerQuality", "resumeConsistency", "topicCoverage", "communication", "attention", "overallScore", "recommendation"],
                    [{"interview_id": interview_id, "completed_at": completed_at,
                      **{field: evaluation.get(field) for field in ("technicalKnowledge", "answerQuality", "resumeConsistency", "topicCoverage", "communication", "attention", "overallScore", "recommendation")}}])
    return {"interviewId": interview_id, "raw": raw_path.name, "exportedAt": exported_at}

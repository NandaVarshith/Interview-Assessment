import os
import uuid
import logging
import re
import tempfile

from flask import Flask, jsonify, request
from dotenv import load_dotenv
from flask_cors import CORS
from werkzeug.utils import secure_filename

from services.question_generator import (
    QuestionGenerationError,
    classify_answer,
    evaluate_answer,
    evaluate_interview_summary,
    generate_cross_question,
    generate_follow_up_question,
    generate_initial_questions,
)
from services.resume_parser import PDFExtractionError, extract_resume_profile, extract_text_from_pdf
from services.speech_analyzer import analyze_speech


load_dotenv()

app = Flask(__name__)
app.logger.setLevel(logging.INFO)
CORS(app, origins=["http://localhost:5173"])
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def error_response(message, status_code):
    return jsonify({"status": "error", "message": message}), status_code


def select_resume_claim(claims, context, used_indexes):
    stop_words = {
        "and", "the", "this", "that", "with", "from", "have", "used", "using", "into", "for", "was",
        "were", "their", "they", "your", "about", "how", "what", "when", "where", "which", "that",
    }
    context_tokens = {
        token for token in re.findall(r"[a-z0-9+#.]+", context.lower()) if len(token) > 2 and token not in stop_words
    }
    scored = []
    for index, claim in enumerate(claims):
        claim_tokens = {
            token for token in re.findall(r"[a-z0-9+#.]+", claim.lower()) if len(token) > 2 and token not in stop_words
        }
        score = len(context_tokens & claim_tokens)
        if score:
            scored.append((index, score, index in used_indexes))
    unused = [item for item in scored if not item[2]]
    candidates = unused or scored
    if not candidates:
        return None
    return max(candidates, key=lambda item: item[1])[0]


def _decision_answer_class(question, answer):
    answer_class = classify_answer(question, answer)
    if answer_class != "clear":
        return answer_class
    word_count = len(re.findall(r"[a-z0-9+#.]+", answer.lower()))
    return "shallow" if word_count < 18 else "strong"


def _topic_tokens(value):
    stop_words = {"and", "the", "this", "that", "with", "from", "have", "used", "using", "into", "for", "was", "were", "how", "what"}
    return {
        token for token in re.findall(r"[a-z0-9+#.]+", value.lower())
        if len(token) > 2 and token not in stop_words
    }


def _topic_was_covered(question, responses, current_index):
    current_tokens = _topic_tokens(question)
    if not current_tokens:
        return False
    for response in responses:
        if not isinstance(response, dict) or response.get("questionIndex") == current_index:
            continue
        if response.get("type", "main") != "main":
            continue
        previous_tokens = _topic_tokens(
            f"{response.get('question', '')} {response.get('answer', '')}"
        )
        if len(current_tokens & previous_tokens) >= 2:
            return True
    return False


def _question_was_asked(question, responses):
    question_tokens = _topic_tokens(question)
    if not question_tokens:
        return False
    for response in responses:
        previous_tokens = _topic_tokens(str(response.get("question", ""))) if isinstance(response, dict) else set()
        overlap = len(question_tokens & previous_tokens)
        if overlap >= 2 and overlap / max(len(question_tokens), 1) >= 0.5:
            return True
    return False


def filter_resume_claims(claims):
    technical_terms = {
        "api", "backend", "frontend", "react", "node", "flask", "django", "spring", "java", "python",
        "sql", "mysql", "postgresql", "mongodb", "database", "jwt", "oauth", "authentication", "security",
        "machine", "learning", "model", "tensorflow", "pytorch", "performance", "scalable", "optimization",
        "deployment", "docker", "kubernetes", "cloud", "feature", "algorithm", "pipeline", "service",
    }
    low_value_patterns = (
        r"\bteamwork\b",
        r"\bcollaborat(?:e|ed|ion|ing)\b",
        r"\b(version control|git|github)\b",
        r"\bresponsible for\b",
        r"\bcrud\b",
    )
    filtered = []
    token_sets = []
    for claim in claims:
        normalized = re.sub(r"\s+", " ", str(claim)).strip(" .;,-")
        lowered = normalized.lower()
        tokens = set(re.findall(r"[a-z0-9+#.]+", lowered))
        if len(normalized) < 35 or len(tokens) < 5:
            continue
        technical = tokens & technical_terms
        if not technical or any(re.search(pattern, lowered) for pattern in low_value_patterns):
            strong_terms = technical & {"api", "backend", "frontend", "authentication", "security", "database", "model", "performance", "scalable", "optimization", "pipeline"}
            if not strong_terms:
                continue
        if any(len(tokens & previous) / min(len(tokens), len(previous)) >= 0.8 for previous in token_sets):
            continue
        filtered.append(normalized)
        token_sets.append(tokens)
        if len(filtered) == 10:
            break
    return filtered


@app.get("/health")
def health_check():
    return jsonify({"status": "ok"}), 200


@app.post("/api/interview/transcribe")
def transcribe_interview_answer():
    audio = request.files.get("audio")
    duration_seconds = request.form.get("durationSeconds", "0")
    app.logger.info(
        "transcribe stage=request received method=%s audio_exists=%s filename=%r mimetype=%s",
        request.method,
        audio is not None,
        audio.filename if audio is not None else None,
        audio.mimetype if audio is not None else None,
    )
    if audio is None or not audio.filename:
        return error_response("Audio recording is required.", 400)
    try:
        duration = float(duration_seconds)
        if duration < 0 or duration > 900:
            raise ValueError
    except (TypeError, ValueError):
        return error_response("A valid recording duration is required.", 400)

    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            audio.save(temp_file)
            temp_path = temp_file.name
        app.logger.info(
            "transcribe audio filename=%r mimetype=%s audio_size=%d",
            audio.filename,
            audio.mimetype,
            os.path.getsize(temp_path),
        )
        app.logger.info("transcribe stage=transcription started")
        with open(temp_path, "rb") as audio_file:
            result = analyze_speech(audio_file, duration)
        app.logger.info("transcribe stage=transcription completed")
        app.logger.info("transcribe stage=response returned status=200")
        return jsonify(result), 200
    except QuestionGenerationError as exc:
        app.logger.exception("transcribe stage=failed error_type=%s error=%s", exc.__class__.__name__, exc)
        return error_response(str(exc), 502)
    except Exception:
        app.logger.exception("transcribe stage=failed unexpected error")
        return error_response("Unexpected server error while transcribing audio.", 500)
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass


@app.post("/api/interview/follow-up")
def generate_follow_up():
    payload = request.get_json(silent=True) or {}
    question = payload.get("question")
    answer = payload.get("answer")
    if not isinstance(question, str) or not question.strip() or not isinstance(answer, str):
        return error_response("Question and answer are required.", 400)

    try:
        follow_up_response = generate_follow_up_question(question.strip(), answer.strip())
    except QuestionGenerationError as exc:
        app.logger.exception("Follow-up question generation failed: %s", exc)
        return error_response(str(exc), 502)
    except Exception:
        app.logger.exception("Unexpected follow-up question generation failure")
        return error_response("Unexpected server error while generating a follow-up question.", 500)

    return jsonify(follow_up_response), 200


@app.post("/api/interview/cross-question")
def generate_cross_question_route():
    payload = request.get_json(silent=True) or {}
    resume_claims = payload.get("resumeClaims")
    question = payload.get("question")
    answer = payload.get("answer")
    follow_up_question = payload.get("followUpQuestion", "")
    follow_up_answer = payload.get("followUpAnswer", "")
    used_claim_indexes = payload.get("usedClaimIndexes", [])
    if (
        not isinstance(resume_claims, list)
        or not all(isinstance(claim, str) and claim.strip() for claim in resume_claims)
        or not all(isinstance(value, str) for value in (question, answer, follow_up_question, follow_up_answer))
        or not isinstance(used_claim_indexes, list)
    ):
        return error_response("Resume claims and interview context are required.", 400)

    claim_index = select_resume_claim(
        resume_claims,
        " ".join((question, answer, follow_up_question, follow_up_answer)),
        {index for index in used_claim_indexes if isinstance(index, int)},
    )
    if claim_index is None:
        return jsonify({"crossQuestion": None, "resumeClaim": None, "claimIndex": None, "skip": True}), 200

    resume_claim = resume_claims[claim_index]
    combined_answer = answer
    if follow_up_question or follow_up_answer:
        combined_answer += f"\nFollow-up question: {follow_up_question}\nFollow-up answer: {follow_up_answer}"

    try:
        cross_question = generate_cross_question(resume_claim.strip(), question.strip(), combined_answer.strip())
    except QuestionGenerationError as exc:
        app.logger.exception("Cross-question generation failed: %s", exc)
        return error_response(str(exc), 502)
    except Exception:
        app.logger.exception("Unexpected cross-question generation failure")
        return error_response("Unexpected server error while generating a cross-question.", 500)

    return jsonify({"crossQuestion": cross_question, "resumeClaim": resume_claim, "claimIndex": claim_index}), 200


@app.post("/api/interview/decision")
def interview_decision():
    payload = request.get_json(silent=True) or {}
    question_index = payload.get("questionIndex")
    main_question = payload.get("mainQuestion")
    main_answer = payload.get("mainAnswer")
    follow_up_question = payload.get("followUpQuestion")
    follow_up_answer = payload.get("followUpAnswer")
    resume_claims = payload.get("resumeClaims", [])
    used_claim_indexes = payload.get("usedClaimIndexes", [])
    planned_questions = payload.get("plannedQuestions", [])
    responses = payload.get("responses", [])
    if (
        not isinstance(question_index, int)
        or not isinstance(main_question, str) or not main_question.strip()
        or not isinstance(main_answer, str)
        or (follow_up_question is not None and not isinstance(follow_up_question, str))
        or (follow_up_answer is not None and not isinstance(follow_up_answer, str))
        or not isinstance(resume_claims, list)
        or not all(isinstance(claim, str) and claim.strip() for claim in resume_claims)
        or not isinstance(used_claim_indexes, list)
        or not isinstance(planned_questions, list)
        or not isinstance(responses, list)
    ):
        return error_response("Interview decision context is invalid.", 400)

    follow_up_question = follow_up_question or ""
    follow_up_answer = follow_up_answer or ""
    latest_answer = follow_up_answer if follow_up_question else main_answer
    answer_class = _decision_answer_class(follow_up_question or main_question, latest_answer)
    context = " ".join((main_question, main_answer, follow_up_question, follow_up_answer))
    used_indexes = {index for index in used_claim_indexes if isinstance(index, int)}
    topic_covered = _topic_was_covered(main_question, responses, question_index)
    previous_context = " ".join(
        f"Question: {item.get('question', '')} Answer: {item.get('answer', '')}"
        for item in responses[-8:] if isinstance(item, dict)
    )[:4000]

    try:
        evaluation = evaluate_answer(
            follow_up_question or main_question,
            latest_answer,
            previous_context,
        )
    except QuestionGenerationError as exc:
        app.logger.exception("Answer evaluation failed; using existing decision signals: %s", exc)
        evaluation = None

    try:
        low_evaluation = evaluation and (
            evaluation["correctness"] == "low" or evaluation["relevance"] == "low"
        )
        missing_depth = evaluation and evaluation["depth"] == "medium" and evaluation["missingConcepts"]
        if follow_up_question:
            action = "cross_question"
            reason = "The follow-up answer provides context for verifying a relevant resume claim."
        elif low_evaluation:
            action = "clarify"
            reason = "The answer needs clarification because its correctness or relevance is limited."
        elif evaluation and all(
            evaluation[field] == "high" for field in ("correctness", "relevance", "depth")
        ):
            action = "cross_question"
            reason = "The answer is strong; verify a relevant resume claim if one is available, otherwise move on."
        elif answer_class == "insufficient":
            action = "clarify"
            reason = "The answer is too short or indicates missing knowledge, so a basic clarification is useful."
        elif answer_class == "vague":
            action = "clarify"
            reason = "The answer is relevant but lacks enough detail, so one clarification is useful."
        elif answer_class == "shallow" or missing_depth:
            action = "probe"
            reason = "The answer is correct but shallow, so one practical implementation detail is useful."
        else:
            action = "cross_question"
            reason = "A relevant resume claim should be verified before moving on."

        claim_index = select_resume_claim(resume_claims, context, used_indexes)
        if topic_covered and (claim_index is None or claim_index in used_indexes) and answer_class in {"shallow", "strong"}:
            claim_index = None
            action = "change_topic"
            reason = "This topic was already covered in the interview, so move to a different planned topic."
        if action == "cross_question" and claim_index is not None:
            resume_claim = resume_claims[claim_index]
            cross_question = generate_cross_question(resume_claim, main_question, context)
            return jsonify({
                "action": action,
                "reason": reason,
                "question": cross_question,
                "topic": "resume claim",
                "difficulty": "medium",
                "source": "resume_claim",
                "resumeClaim": resume_claim,
                "claimIndex": claim_index,
                "evaluation": evaluation,
            }), 200

        if not follow_up_question and (answer_class in {"vague", "insufficient", "shallow"} or low_evaluation or missing_depth):
            follow_up = generate_follow_up_question(
                main_question,
                main_answer,
                allow_clear=answer_class == "shallow" or bool(low_evaluation or missing_depth),
            )
            if follow_up.get("followUpQuestion") and not _question_was_asked(follow_up["followUpQuestion"], responses):
                return jsonify({
                    "action": action,
                    "reason": reason,
                    "question": follow_up["followUpQuestion"],
                    "topic": "current question",
                    "difficulty": "basic" if answer_class == "insufficient" else "medium",
                    "source": "follow-up",
                    "evaluation": evaluation,
                }), 200
    except QuestionGenerationError as exc:
        app.logger.exception("Interview decision generation failed: %s", exc)
        return error_response(str(exc), 502)
    except Exception:
        app.logger.exception("Unexpected interview decision failure")
        return error_response("Unexpected server error while deciding the next interview action.", 500)

    return jsonify({
        "action": "change_topic" if planned_questions and question_index < len(planned_questions) - 1 else "next",
        "reason": "The current answer is sufficiently covered; continue to the next planned question.",
        "question": None,
        "topic": None,
        "difficulty": "medium",
        "source": "planned" if planned_questions else None,
        "evaluation": evaluation,
    }), 200


@app.post("/api/interview/evaluate")
def evaluate_interview():
    summary = request.get_json(silent=True) or {}
    if (
        not isinstance(summary, dict)
        or not isinstance(summary.get("questions"), list)
        or not isinstance(summary.get("responses"), list)
        or not isinstance(summary.get("resumeClaims", []), list)
        or not isinstance(summary.get("decisions", []), list)
    ):
        return error_response("A normalized interview summary is required.", 400)

    try:
        evaluation = evaluate_interview_summary(summary)
    except QuestionGenerationError as exc:
        app.logger.exception("Final interview evaluation failed: %s", exc)
        return error_response(str(exc), 502)
    except Exception:
        app.logger.exception("Unexpected final interview evaluation failure")
        return error_response("Unexpected server error while evaluating the interview.", 500)
    return jsonify(evaluation), 200


@app.post("/api/interview/prepare")
def prepare_interview():
    resume_file = request.files.get("resume")
    app.logger.info(
        "prepare stage=request received method=%s resume_exists=%s filename=%r mimetype=%s",
        request.method,
        resume_file is not None,
        resume_file.filename if resume_file is not None else None,
        resume_file.mimetype if resume_file is not None else None,
    )
    if resume_file is None or not resume_file.filename:
        return error_response("Resume PDF is required.", 400)

    filename = secure_filename(resume_file.filename)
    if not filename.lower().endswith(".pdf"):
        return error_response("Only PDF resumes are allowed.", 400)

    temp_name = f"{uuid.uuid4().hex}_{filename}"
    temp_path = os.path.join(UPLOAD_DIR, temp_name)

    try:
        resume_file.save(temp_path)
        app.logger.info(
            "prepare upload filename=%r mimetype=%s file_size=%d",
            filename,
            resume_file.mimetype,
            os.path.getsize(temp_path),
        )
        resume_text = extract_text_from_pdf(temp_path)
        resume_profile = extract_resume_profile(resume_text)
        app.logger.info("prepare stage=resume parsed")
        app.logger.info("prepare stage=question generation started")
        questions = generate_initial_questions(resume_text, resume_profile)
        app.logger.info("prepare stage=question generation completed question_count=%d", len(questions))
    except PDFExtractionError as exc:
        app.logger.exception("prepare stage=resume parsing failed: %s", exc)
        app.logger.info("prepare stage=response returned status=422")
        return error_response(str(exc), 422)
    except QuestionGenerationError as exc:
        app.logger.exception("Question generation failed: %s", exc)
        app.logger.info("prepare stage=response returned status=502")
        return error_response(str(exc), 502)
    except Exception:
        app.logger.exception("prepare stage=unexpected failure")
        app.logger.info("prepare stage=response returned status=500")
        return error_response("Unexpected server error while preparing interview questions.", 500)
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass

    app.logger.info("prepare stage=response returned status=200")
    resume_claims = [
        claim
        for section in (resume_profile.get("projects", []), resume_profile.get("experience", []))
        for claim in section
        if claim
    ]
    resume_claims = filter_resume_claims(resume_claims)
    return jsonify({"status": "success", "questions": questions, "resumeClaims": resume_claims}), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG", "false").lower() == "true")

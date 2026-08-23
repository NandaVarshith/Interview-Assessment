import os
import uuid
import logging
import re

from flask import Flask, jsonify, request
from dotenv import load_dotenv
from flask_cors import CORS
from werkzeug.utils import secure_filename

from services.question_generator import (
    QuestionGenerationError,
    generate_cross_question,
    generate_follow_up_question,
    generate_initial_questions,
)
from services.resume_parser import PDFExtractionError, extract_resume_profile, extract_text_from_pdf


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

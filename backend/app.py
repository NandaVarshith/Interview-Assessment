import os
import uuid
import logging

from flask import Flask, jsonify, request
from dotenv import load_dotenv
from flask_cors import CORS
from werkzeug.utils import secure_filename

from services.question_generator import QuestionGenerationError, generate_initial_questions
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


@app.get("/health")
def health_check():
    return jsonify({"status": "ok"}), 200


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
    return jsonify({"status": "success", "questions": questions}), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG", "false").lower() == "true")

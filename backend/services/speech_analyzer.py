import os
import re

from openai import OpenAI

from services.question_generator import QuestionGenerationError


FILLER_PATTERN = re.compile(r"\b(?:um|uh|erm|like|actually|basically|you know)\b", re.IGNORECASE)
REPEATED_WORD_PATTERN = re.compile(r"\b([a-z0-9']+)(?:\s+\1){1,}\b", re.IGNORECASE)


def _speech_quality(transcript, word_count, filler_frequency):
    repeated_phrases = len(REPEATED_WORD_PATTERN.findall(transcript.lower()))
    if word_count < 5 or repeated_phrases >= 3 or filler_frequency >= 0.12:
        clarity = "low"
    elif word_count < 12 or repeated_phrases or filler_frequency >= 0.05:
        clarity = "medium"
    else:
        clarity = "high"

    if word_count < 5 or filler_frequency >= 0.12 or repeated_phrases >= 3:
        fluency = "low"
    elif filler_frequency >= 0.05 or repeated_phrases:
        fluency = "medium"
    else:
        fluency = "high"
    return clarity, fluency


def analyze_speech(audio_file, duration_seconds):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise QuestionGenerationError("OPENAI_API_KEY is not configured.")

    model = os.getenv("OPENAI_TRANSCRIPTION_MODEL", "whisper-1")
    base_url = os.getenv("OPENAI_BASE_URL", "").strip() or "https://api.openai.com/v1"
    client = OpenAI(api_key=api_key, base_url=base_url)
    try:
        transcription = client.audio.transcriptions.create(model=model, file=audio_file)
        transcript = str(transcription.text).strip()
    except Exception as exc:
        error_name = exc.__class__.__name__
        if error_name == "AuthenticationError":
            raise QuestionGenerationError("LLM authentication failed. Check OPENAI_API_KEY.") from exc
        if error_name == "APIConnectionError":
            raise QuestionGenerationError("LLM connection failed.") from exc
        raise QuestionGenerationError("Speech transcription failed.") from exc

    words = re.findall(r"[a-z0-9']+", transcript.lower())
    word_count = len(words)
    filler_count = len(FILLER_PATTERN.findall(transcript))
    duration = max(float(duration_seconds or 0), 0)
    words_per_minute = round(word_count / (duration / 60), 2) if duration else 0
    filler_frequency = round(filler_count / word_count, 4) if word_count else 0
    clarity, fluency = _speech_quality(transcript, word_count, filler_frequency)
    return {
        "transcript": transcript,
        "wordCount": word_count,
        "durationSeconds": round(duration, 2),
        "wordsPerMinute": words_per_minute,
        "fillerCount": filler_count,
        "fillerFrequency": filler_frequency,
        "clarity": clarity,
        "fluency": fluency,
    }

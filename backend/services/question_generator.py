import json
import os
import re

from openai import OpenAI


class QuestionGenerationError(Exception):
    pass


def _build_prompt(resume_text, resume_profile):
    summary = {
        "skills": resume_profile.get("skills", []),
        "technologies": resume_profile.get("technologies", []),
        "projects": resume_profile.get("projects", []),
        "education": resume_profile.get("education", []),
        "experience": resume_profile.get("experience", []),
        "key_terms": resume_profile.get("key_terms", []),
    }
    limited_text = resume_text[:6000]
    return f"""
You are an interview assistant for a student project.
Create 5 to 10 personalized INITIAL technical interview questions only.
Use the candidate's actual resume content. Do not ask behavioral questions, scoring questions, or adaptive follow-up questions.

Return strict JSON in this shape:
{{"questions":["question 1","question 2"]}}

Resume summary:
{json.dumps(summary, indent=2)}

Resume text:
{limited_text}
""".strip()


def _parse_questions(content):
    text = content.strip()
    text = re.sub(r"^```json\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"^```\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    payload = json.loads(text)
    questions = payload.get("questions") if isinstance(payload, dict) else payload
    if not isinstance(questions, list):
        raise QuestionGenerationError("LLM did not return a valid question list.")

    cleaned = []
    for item in questions:
        question = str(item).strip()
        if question:
            cleaned.append(question)

    if len(cleaned) < 5 or len(cleaned) > 10:
        raise QuestionGenerationError("LLM returned an invalid number of questions.")

    return cleaned


def generate_initial_questions(resume_text, resume_profile):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise QuestionGenerationError("OPENAI_API_KEY is not configured.")

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    base_url = os.getenv("OPENAI_BASE_URL", "").strip() or "https://api.openai.com/v1"
    client = OpenAI(api_key=api_key, base_url=base_url)

    prompt = _build_prompt(resume_text, resume_profile)
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You generate concise, resume-specific technical interview questions."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
        )
    except Exception as exc:
        error_name = exc.__class__.__name__
        if error_name == "AuthenticationError":
            raise QuestionGenerationError("LLM authentication failed. Check OPENAI_API_KEY.") from exc
        if error_name == "APIConnectionError":
            raise QuestionGenerationError("LLM connection failed.") from exc
        raise QuestionGenerationError("LLM request failed.") from exc

    try:
        content = response.choices[0].message.content
    except Exception as exc:
        raise QuestionGenerationError("LLM returned an unexpected response.") from exc

    try:
        return _parse_questions(content)
    except json.JSONDecodeError as exc:
        raise QuestionGenerationError("LLM returned non-JSON output.") from exc


def classify_answer(question, answer):
    lowered = answer.lower().strip()
    words = re.findall(r"[a-z0-9+#.]+", lowered)
    if len(words) <= 2 or re.search(r"\b(i don'?t know|not sure|no idea|nothing)\b", lowered):
        return "insufficient"

    question_terms = set(re.findall(r"[a-z0-9+#.]+", question.lower()))
    answer_terms = set(words)
    relevant_terms = question_terms & answer_terms
    if len(words) < 9 or not relevant_terms:
        return "vague"
    return "clear"


def evaluate_answer(question, answer, context=""):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise QuestionGenerationError("OPENAI_API_KEY is not configured.")

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    base_url = os.getenv("OPENAI_BASE_URL", "").strip() or "https://api.openai.com/v1"
    client = OpenAI(api_key=api_key, base_url=base_url)
    prompt = f"""
Evaluate the candidate's answer for a junior software engineering interview.
Return strict JSON only in this shape:
{{"correctness":"high|medium|low","relevance":"high|medium|low","depth":"high|medium|low","missingConcepts":[],"summary":"short explanation"}}
Assess correctness, relevance to the question, and practical depth. Do not assign a numerical score,
make hiring recommendations, or assume facts not present in the answer or context.
Keep missingConcepts concise and include only important missing ideas.

Question:
{question}

Candidate answer:
{answer}

Previous relevant context:
{context}
""".strip()

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You evaluate one interview answer and return strict JSON."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )
        content = response.choices[0].message.content.strip()
    except Exception as exc:
        error_name = exc.__class__.__name__
        if error_name == "AuthenticationError":
            raise QuestionGenerationError("LLM authentication failed. Check OPENAI_API_KEY.") from exc
        if error_name == "APIConnectionError":
            raise QuestionGenerationError("LLM connection failed.") from exc
        raise QuestionGenerationError("LLM request failed.") from exc

    try:
        content = re.sub(r"^```json\s*|^```\s*|\s*```$", "", content, flags=re.IGNORECASE)
        evaluation = json.loads(content)
    except (json.JSONDecodeError, TypeError) as exc:
        raise QuestionGenerationError("LLM returned invalid answer evaluation JSON.") from exc

    levels = {"high", "medium", "low"}
    if (
        not isinstance(evaluation, dict)
        or evaluation.get("correctness") not in levels
        or evaluation.get("relevance") not in levels
        or evaluation.get("depth") not in levels
        or not isinstance(evaluation.get("missingConcepts"), list)
        or not isinstance(evaluation.get("summary"), str)
    ):
        raise QuestionGenerationError("LLM returned an invalid answer evaluation.")
    evaluation["missingConcepts"] = [str(item).strip() for item in evaluation["missingConcepts"] if str(item).strip()]
    evaluation["summary"] = evaluation["summary"].strip()
    return evaluation


def evaluate_interview_summary(summary):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise QuestionGenerationError("OPENAI_API_KEY is not configured.")

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    base_url = os.getenv("OPENAI_BASE_URL", "").strip() or "https://api.openai.com/v1"
    client = OpenAI(api_key=api_key, base_url=base_url)
    prompt = f"""
Evaluate this completed technical interview using only the supplied interview evidence.
Return strict JSON only in this shape:
{{"technicalKnowledge":"high|medium|low","answerQuality":"high|medium|low","resumeConsistency":"high|medium|low","topicCoverage":"high|medium|low","strengths":[],"weaknesses":[],"summary":"short explanation"}}
Consider technical knowledge, answer relevance, depth, correctness, consistency with resume claims,
and coverage of planned topics. Do not invent facts, calculate a numerical score, or make a hiring recommendation.
Keep strengths and weaknesses concise.

Interview summary:
{json.dumps(summary, ensure_ascii=True)[:14000]}
""".strip()

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You evaluate a completed technical interview and return strict JSON."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )
        content = response.choices[0].message.content.strip()
    except Exception as exc:
        error_name = exc.__class__.__name__
        if error_name == "AuthenticationError":
            raise QuestionGenerationError("LLM authentication failed. Check OPENAI_API_KEY.") from exc
        if error_name == "APIConnectionError":
            raise QuestionGenerationError("LLM connection failed.") from exc
        raise QuestionGenerationError("LLM request failed.") from exc

    try:
        content = re.sub(r"^```json\s*|^```\s*|\s*```$", "", content, flags=re.IGNORECASE)
        evaluation = json.loads(content)
    except (json.JSONDecodeError, TypeError) as exc:
        raise QuestionGenerationError("LLM returned invalid interview evaluation JSON.") from exc

    levels = {"high", "medium", "low"}
    if (
        not isinstance(evaluation, dict)
        or any(evaluation.get(field) not in levels for field in (
            "technicalKnowledge", "answerQuality", "resumeConsistency", "topicCoverage",
        ))
        or not isinstance(evaluation.get("strengths"), list)
        or not isinstance(evaluation.get("weaknesses"), list)
        or not isinstance(evaluation.get("summary"), str)
    ):
        raise QuestionGenerationError("LLM returned an invalid interview evaluation.")
    evaluation["strengths"] = [str(item).strip() for item in evaluation["strengths"] if str(item).strip()]
    evaluation["weaknesses"] = [str(item).strip() for item in evaluation["weaknesses"] if str(item).strip()]
    evaluation["summary"] = evaluation["summary"].strip()
    evaluation.update(_aggregate_final_signals(summary, evaluation))
    return evaluation


LEVEL_SCORES = {"high": 100, "medium": 70, "low": 40}


def _average(values):
    return round(sum(values) / len(values)) if values else None


def _speech_score(speech):
    if not isinstance(speech, dict):
        return None
    scores = []
    for field in ("clarity", "fluency", "fillerUsage", "repetition"):
        if speech.get(field) in LEVEL_SCORES:
            scores.append(LEVEL_SCORES[speech[field]])
    pace_scores = {"slow": 70, "normal": 100, "fast": 70}
    if speech.get("speakingPace") in pace_scores:
        scores.append(pace_scores[speech["speakingPace"]])
    return _average(scores)


def _aggregate_final_signals(summary, technical_evaluation):
    technical_score = _average(
        [LEVEL_SCORES[technical_evaluation[field]]
        for field in ("technicalKnowledge", "answerQuality", "resumeConsistency", "topicCoverage")
        ]
    )
    speech_scores = [
        score
        for response in summary.get("responses", [])
        if isinstance(response, dict)
        for score in [_speech_score(response.get("speech", {}))]
        if score is not None
    ]
    communication = _average(speech_scores)

    gaze_metrics = summary.get("gazeMetrics")
    attention = None
    if isinstance(gaze_metrics, dict):
        on_screen = float(gaze_metrics.get("lookingAtScreenPercentage", 0) or 0)
        away = float(gaze_metrics.get("lookingAwayPercentage", 0) or 0)
        down = float(gaze_metrics.get("lookingDownPercentage", 0) or 0)
        coverage = gaze_metrics.get("observationCoverage")
        if coverage is None:
            valid_count = gaze_metrics.get("validObservationCount")
            total_count = gaze_metrics.get("totalObservationCount")
            if isinstance(valid_count, (int, float)) and isinstance(total_count, (int, float)) and total_count > 0:
                coverage = valid_count / total_count
            elif on_screen + away + down > 0:
                coverage = 1.0
        if isinstance(coverage, (int, float)) and 0.3 <= coverage <= 1 and on_screen + away + down > 0:
            attention = round(on_screen + (away + down) * 0.5)

    weighted_scores = [(technical_score, 0.7)]
    if communication is not None:
        weighted_scores.append((communication, 0.15))
    if attention is not None:
        weighted_scores.append((attention, 0.15))
    weight_total = sum(weight for _, weight in weighted_scores)
    overall_score = round(sum(score * weight for score, weight in weighted_scores) / weight_total)
    recommendation = (
        "strong" if overall_score >= 80
        else "review" if overall_score >= 60
        else "needs_improvement"
    )
    return {
        "communication": communication,
        "attention": attention,
        "overallScore": overall_score,
        "recommendation": recommendation,
    }


def generate_follow_up_question(question, answer, allow_clear=False):
    answer_class = classify_answer(question, answer)
    if answer_class == "clear" and not allow_clear:
        return {"answerClass": answer_class, "followUpQuestion": None}

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise QuestionGenerationError("OPENAI_API_KEY is not configured.")

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    base_url = os.getenv("OPENAI_BASE_URL", "").strip() or "https://api.openai.com/v1"
    client = OpenAI(api_key=api_key, base_url=base_url)
    prompt = f"""
Create exactly one concise technical follow-up question for a {answer_class} answer.
For a vague answer, ask for one important missing implementation detail.
For an insufficient answer, ask one simple fundamental clarification question; do not assume advanced experience.
For a clear but shallow answer, ask one practical probe for the most important missing implementation detail.
Target a fresher or junior software engineer at basic-to-medium difficulty.
Focus on one practical implementation concept from the candidate's answer and keep it answerable in about 30 to 90 seconds.
Probe only one level deeper when the answer supports it; do not introduce technologies or experience not present in the conversation or resume context.
Avoid advanced system design, distributed architecture, obscure framework internals, highly theoretical topics, and competitive-programming questions.
Do not repeat the original question. Return only the question text, with no numbering or explanation.

Original question:
{question}

Candidate answer:
{answer}
""".strip()

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You generate one concise technical follow-up question."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
        )
        content = response.choices[0].message.content.strip()
    except Exception as exc:
        error_name = exc.__class__.__name__
        if error_name == "AuthenticationError":
            raise QuestionGenerationError("LLM authentication failed. Check OPENAI_API_KEY.") from exc
        if error_name == "APIConnectionError":
            raise QuestionGenerationError("LLM connection failed.") from exc
        raise QuestionGenerationError("LLM request failed.") from exc

    if not content:
        raise QuestionGenerationError("LLM returned an empty follow-up question.")
    return {"answerClass": answer_class, "followUpQuestion": content.strip().strip('"')}


def generate_cross_question(resume_claim, question, answer):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise QuestionGenerationError("OPENAI_API_KEY is not configured.")

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    base_url = os.getenv("OPENAI_BASE_URL", "").strip() or "https://api.openai.com/v1"
    client = OpenAI(api_key=api_key, base_url=base_url)
    prompt = f"""
Create exactly one concise technical verification question.
Verify the resume claim, check the candidate's technical understanding, and connect the claim with the candidate's answer.
Target a fresher or junior software engineer at basic-to-medium difficulty.
Prefer one practical implementation question that can normally be answered in about 30 to 90 seconds.
Ask deeper questions only when the candidate's answer demonstrates the necessary understanding.
Do not introduce technologies, assumptions, or experience not present in the resume claim or conversation.
Avoid advanced system design, distributed architecture, obscure framework internals, highly theoretical topics, and competitive-programming questions.
Do not repeat the original question. Return only the question text, with no numbering or explanation.

Resume claim:
{resume_claim}

Original question:
{question}

Candidate answer:
{answer}
""".strip()

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You generate one concise resume-claim verification question."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
        )
        content = response.choices[0].message.content.strip()
    except Exception as exc:
        error_name = exc.__class__.__name__
        if error_name == "AuthenticationError":
            raise QuestionGenerationError("LLM authentication failed. Check OPENAI_API_KEY.") from exc
        if error_name == "APIConnectionError":
            raise QuestionGenerationError("LLM connection failed.") from exc
        raise QuestionGenerationError("LLM request failed.") from exc

    if not content:
        raise QuestionGenerationError("LLM returned an empty cross-question.")
    return content.strip().strip('"')

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


def generate_follow_up_question(question, answer):
    answer_class = classify_answer(question, answer)
    if answer_class == "clear":
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

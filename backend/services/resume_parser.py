import re
from collections import Counter

import pymupdf as fitz


class PDFExtractionError(Exception):
    pass


SECTION_ALIASES = {
    "skills": "skills",
    "technical skills": "skills",
    "core skills": "skills",
    "technologies": "skills",
    "core subjects": "core_subjects",
    "academic subjects": "core_subjects",
    "coursework": "core_subjects",
    "course work": "core_subjects",
    "programming languages": "programming_skills",
    "programming skills": "programming_skills",
    "frameworks": "frameworks_tools",
    "libraries": "frameworks_tools",
    "platforms": "frameworks_tools",
    "tools": "frameworks_tools",
    "databases": "databases",
    "database": "databases",
    "domain knowledge": "technical_domains",
    "technical domains": "technical_domains",
    "domains": "technical_domains",
    "projects": "projects",
    "project experience": "projects",
    "education": "education",
    "academics": "education",
    "experience": "experience",
    "work experience": "experience",
    "professional experience": "experience",
    "internship": "experience",
    "internships": "experience",
    "certifications": "certifications",
    "certificates": "certifications",
}


def extract_text_from_pdf(pdf_path):
    try:
        document = fitz.open(pdf_path)
    except Exception as exc:
        raise PDFExtractionError("Invalid or unreadable PDF file.") from exc

    pages = []
    try:
        for page in document:
            pages.append(page.get_text("text"))
    except Exception as exc:
        raise PDFExtractionError("Failed to extract text from the PDF.") from exc
    finally:
        document.close()

    text = "\n".join(page.strip() for page in pages if page and page.strip()).strip()
    if not text:
        raise PDFExtractionError("No readable text was found in the PDF.")

    return text


def _normalize_lines(text):
    lines = []
    for raw_line in text.splitlines():
        line = re.sub(r"\s+", " ", raw_line).strip()
        if line:
            lines.append(line)
    return lines


def _looks_like_heading(line):
    lowered = line.lower().rstrip(":")
    return lowered in SECTION_ALIASES or (
        len(line) <= 40 and line == line.title() and any(key in lowered for key in SECTION_ALIASES)
    )


def _section_name(line):
    lowered = line.lower().rstrip(":")
    for heading, canonical in sorted(SECTION_ALIASES.items(), key=lambda item: len(item[0]), reverse=True):
        if heading in lowered:
            return canonical
    return None


def _extract_sections(text):
    sections = {
        "skills": [], "core_subjects": [], "programming_skills": [], "frameworks_tools": [],
        "databases": [], "technical_domains": [], "projects": [], "education": [],
        "experience": [], "certifications": [],
    }
    current = None

    for line in _normalize_lines(text):
        if _looks_like_heading(line):
            current = _section_name(line)
            continue
        if current in sections:
            sections[current].append(line)

    return {name: " ".join(lines).strip() for name, lines in sections.items()}


def _dedupe(values, limit=30):
    result = []
    seen = set()
    for value in values:
        cleaned = re.sub(r"\s+", " ", str(value)).strip(" ,;.-")
        key = cleaned.casefold()
        if cleaned and key not in seen:
            seen.add(key)
            result.append(cleaned)
        if len(result) >= limit:
            break
    return result


def _split_entries(section_text):
    if not section_text:
        return []
    return _dedupe(re.split(r"(?:\u2022|â€¢|\||;|,)\s*", section_text))


def _technical_topics(sections, key_terms):
    topics = []
    for category in (
        "core_subjects", "programming_skills", "frameworks_tools", "databases", "technical_domains", "skills",
    ):
        topics.extend(_split_entries(sections.get(category, "")))
    topics.extend(_split_entries(sections.get("certifications", "")))
    if not topics:
        topics = [term for term in key_terms if len(term) > 2]
    return _dedupe(topics, limit=30)


def _top_bullets(section_text, limit=8):
    bullets = []
    for piece in re.split(r"(?:\u2022|•|\-|\*)\s*", section_text):
        cleaned = re.sub(r"\s+", " ", piece).strip(" ,;")
        if len(cleaned) >= 20:
            bullets.append(cleaned)
    if not bullets and section_text:
        bullets = [segment.strip() for segment in re.split(r"[.;]", section_text) if len(segment.strip()) >= 20]
    return bullets[:limit]


def _extract_education_summary(section_text):
    if not section_text:
        return []
    matches = []
    degree_patterns = [
        r"\bB\.?Tech\b",
        r"\bM\.?Tech\b",
        r"\bB\.?E\b",
        r"\bB\.?Sc\b",
        r"\bM\.?Sc\b",
        r"\bMBA\b",
        r"\bBachelor\b",
        r"\bMaster\b",
        r"\bDiploma\b",
    ]
    for pattern in degree_patterns:
        if re.search(pattern, section_text, re.IGNORECASE):
            matches.append(section_text)
            break
    return matches[:3]


def extract_resume_profile(text):
    sections = _extract_sections(text)
    word_counts = Counter(re.findall(r"[A-Za-z][A-Za-z0-9.+#/-]{1,}", text))
    common_terms = [
        term
        for term, _ in word_counts.most_common(25)
        if len(term) > 2 and term.lower() not in {"resume", "project", "projects", "experience", "skills"}
    ]

    technical_topics = _technical_topics(sections, common_terms)
    education = _extract_education_summary(sections["education"])
    projects = _top_bullets(sections["projects"])
    experience = _top_bullets(sections["experience"])
    certifications = _top_bullets(sections["certifications"])
    category_values = {
        category: _split_entries(sections.get(category, ""))
        for category in ("core_subjects", "programming_skills", "frameworks_tools", "databases", "technical_domains")
    }
    return {
        "field": education[0] if education else None,
        "degree": education[0] if education else None,
        "specialization": sections["education"] or None,
        "skills": technical_topics[:15],
        "technologies": technical_topics[:15],
        "technical_topics": technical_topics,
        "core_subjects": category_values["core_subjects"],
        "programming_skills": category_values["programming_skills"],
        "frameworks_tools": category_values["frameworks_tools"],
        "databases": category_values["databases"],
        "technical_domains": category_values["technical_domains"],
        "domain_knowledge": _dedupe(common_terms, limit=20),
        "projects": projects,
        "education": education,
        "experience": experience,
        "certifications": certifications,
        "resume_claims": _dedupe(projects + experience + certifications, limit=20),
        "key_terms": common_terms[:20],
        "sections": sections,
    }

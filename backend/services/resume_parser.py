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
    "tools": "skills",
    "projects": "projects",
    "project experience": "projects",
    "education": "education",
    "academics": "education",
    "experience": "experience",
    "work experience": "experience",
    "professional experience": "experience",
    "internship": "experience",
    "internships": "experience",
}

TECH_KEYWORDS = [
    "python",
    "java",
    "javascript",
    "typescript",
    "react",
    "node",
    "node.js",
    "express",
    "flask",
    "django",
    "fastapi",
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "html",
    "css",
    "tailwind",
    "bootstrap",
    "git",
    "github",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "linux",
    "numpy",
    "pandas",
    "tensorflow",
    "pytorch",
    "machine learning",
    "deep learning",
    "data science",
    "openai",
]


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
    for heading, canonical in SECTION_ALIASES.items():
        if heading in lowered:
            return canonical
    return None


def _extract_sections(text):
    sections = {"skills": [], "projects": [], "education": [], "experience": []}
    current = None

    for line in _normalize_lines(text):
        if _looks_like_heading(line):
            current = _section_name(line)
            continue
        if current in sections:
            sections[current].append(line)

    return {name: " ".join(lines).strip() for name, lines in sections.items()}


def _extract_keywords(text):
    lowered = text.lower()
    found = []
    for keyword in TECH_KEYWORDS:
        if keyword in lowered:
            found.append(keyword)
    return sorted(set(found))


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
    keywords = _extract_keywords(text)
    word_counts = Counter(re.findall(r"[A-Za-z][A-Za-z0-9.+#/-]{1,}", text))
    common_terms = [
        term
        for term, _ in word_counts.most_common(25)
        if len(term) > 2 and term.lower() not in {"resume", "project", "projects", "experience", "skills"}
    ]

    return {
        "skills": keywords[:15],
        "technologies": keywords[:15],
        "projects": _top_bullets(sections["projects"]),
        "education": _extract_education_summary(sections["education"]),
        "experience": _top_bullets(sections["experience"]),
        "key_terms": common_terms[:20],
        "sections": sections,
    }

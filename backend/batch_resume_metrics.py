"""Measure resume-parser outputs for up to ten real PDF resumes.

Usage: python batch_resume_metrics.py [sample_resumes_directory]
"""

import csv
import sys
import time
from pathlib import Path

from services.resume_parser import PDFExtractionError, extract_resume_profile, extract_text_from_pdf


FIELDS = ("resume", "skills_count", "project_count", "claim_count", "processing_ms", "error")


def main():
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("sample_resumes")
    resumes = sorted(source.glob("*.pdf"))[:10]
    if not resumes:
        print(f"No PDF resumes found in: {source.resolve()}", file=sys.stderr)
        return 1

    rows = []
    for pdf_path in resumes:
        started = time.perf_counter()
        try:
            profile = extract_resume_profile(extract_text_from_pdf(pdf_path))
            error = ""
        except PDFExtractionError as exc:
            profile = {}
            error = str(exc)
        rows.append({
            "resume": pdf_path.name,
            "skills_count": len(profile.get("skills", [])),
            "project_count": len(profile.get("projects", [])),
            "claim_count": len(profile.get("resume_claims", [])),
            "processing_ms": round((time.perf_counter() - started) * 1000, 2),
            "error": error,
        })

    output = Path("experiment_exports") / "resume_results.csv"
    output.parent.mkdir(exist_ok=True)
    with output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows to {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

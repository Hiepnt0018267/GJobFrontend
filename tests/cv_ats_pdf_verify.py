"""Read-only verifier for temporary ATS browser-print PDF evidence."""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

import pdfplumber
from pypdf import PdfReader


REQUIRED_MARKERS = (
    "ATS_NAME_ALPHA",
    "ats.alpha@example.test",
    "0900-ATS-ALPHA",
    "ATS_OBJECTIVE_ALPHA",
    "ATS_EXP_COMPANY_ALPHA",
    "ATS_EXP_ROLE_ALPHA",
    "ATS_EDU_SCHOOL_ALPHA",
    "ATS_SKILL_ALPHA",
    "ATS_PROJECT_ALPHA",
    "ATS_CERT_ALPHA",
    "ATS_LANGUAGE_ALPHA",
)
VIETNAMESE_HEADINGS = ("Kinh nghiệm", "Kỹ năng", "Ngôn ngữ", "Chứng chỉ")
ORDER_MARKERS = (
    "ATS_NAME_ALPHA",
    "ats.alpha@example.test",
    "ATS_OBJECTIVE_ALPHA",
    "ATS_EXP_ROLE_ALPHA",
    "ATS_EXP_COMPANY_ALPHA",
    "ATS_EDU_SCHOOL_ALPHA",
    "ATS_PROJECT_ALPHA",
    "ATS_SKILL_ALPHA",
    "ATS_CERT_ALPHA",
    "ATS_LANGUAGE_ALPHA",
)


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFC", value).replace("\u00a0", " ")
    return re.sub(r"\s+", " ", value).strip()


def extract_pypdf(path: Path) -> tuple[int, str]:
    reader = PdfReader(path)
    return len(reader.pages), "\n".join(page.extract_text() or "" for page in reader.pages)


def extract_pdfplumber(path: Path) -> tuple[int, str]:
    with pdfplumber.open(path) as document:
        return len(document.pages), "\n".join(page.extract_text() or "" for page in document.pages)


def verify(path: Path) -> dict[str, object]:
    engines = {}
    expected_long = "-long.pdf" in path.name
    expected_vi = "-vi-" in path.name
    for name, extractor in (("pypdf", extract_pypdf), ("pdfplumber", extract_pdfplumber)):
        page_count, raw = extractor(path)
        normalized = normalize_text(raw)
        missing = [marker for marker in REQUIRED_MARKERS if marker not in normalized]
        if expected_long and "ATS_LONG_TAIL_MARKER" not in normalized:
            missing.append("ATS_LONG_TAIL_MARKER")
        headings_ok = not expected_vi or all(heading in normalized for heading in VIETNAMESE_HEADINGS)
        pathological_spacing = any(re.search(rf"(?<!\w){re.escape(word[0])}\s+{re.escape(word[1])}\s+{re.escape(word[2])}", normalized, re.IGNORECASE) for word in ("Kinh", "Năng", "Ngôn"))
        positions = {marker: normalized.find(marker) for marker in ORDER_MARKERS}
        observed_order = [marker for marker, _ in sorted(positions.items(), key=lambda item: item[1])]
        engines[name] = {
            "pages": page_count,
            "missing": missing,
            "unicode_headings_ok": headings_ok,
            "pathological_spacing": pathological_spacing,
            "observed_order": observed_order,
            "pass": not missing and headings_ok and not pathological_spacing,
        }
    return {"file": path.name, "engines": engines, "pass": all(item["pass"] for item in engines.values())}


if __name__ == "__main__":
    results = [verify(Path(argument).resolve()) for argument in sys.argv[1:]]
    print(json.dumps(results, ensure_ascii=False, indent=2))
    raise SystemExit(0 if results and all(result["pass"] for result in results) else 1)

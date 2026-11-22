"""Parse All Flights Report paste and sum hours since last annual for club gliders."""
from __future__ import annotations

import re
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path

SEG = Path(
    r"C:\Users\ronwa\.cursor\projects\c-Users-ronwa-Documents-Codex-2026-05-15-glider-club-status"
    r"\agent-transcripts\8774c95b-09ec-4db8-b4fb-ccb9f5f3d54e\compaction\segment_000.md"
)

# Log short code -> club fleet tail. Private / cancel / unknown codes omitted.
CODE_TO_TAIL = {
    "G5S": "N1185S",  # Yellow 2-33
    "G85": "N1185S",  # same ship logged as 85
    "G9W": "N2479W",  # White 2-33 (79W)
    "G0S": "N7757S",  # White/Green 2-33 (only other club 2-33 code; flew with G5S 5/31)
    "G9S": "N11139S",  # White 1-26
    "GYP": "N136YP",  # 1-36
    "GSS": "N160SS",  # Grob
    # N27037 White/Yellow 1-26 — annual due unknown; no reliable code
}

# Annual due MM/YY -> approximate last-annual start (same month, prior year)
FLEET = {
    "N1185S": {"due": "10/26", "last_annual": date(2025, 10, 1)},
    "N7757S": {"due": "05/27", "last_annual": date(2026, 5, 1)},
    "N2479W": {"due": "12/26", "last_annual": date(2025, 12, 1)},
    "N11139S": {"due": "05/27", "last_annual": date(2026, 5, 1)},
    "N27037": {"due": None, "last_annual": None},
    "N136YP": {"due": "05/27", "last_annual": date(2026, 5, 1)},
    "N160SS": {"due": "01/27", "last_annual": date(2026, 1, 1)},
}

ROW_PAT = re.compile(
    r"^(\d{2}/\d{2}/\d{4})\t(\d+)\tFLF\t([^\t]*)\t([^\t]*)\t([^\t]*)\t"
    r"([^\t]*)\t([^\t]*)\t([^\t]*)\t([^\t]*)\t([^\t]*)\t(\d{2}:\d{2})\t"
    r"([^\t]*)\t([^\t]*)\t?(.*)$",
    re.M,
)


def parse_duration(dur: str) -> int:
    h, m = map(int, dur.split(":"))
    return h * 60 + m


def parse_date(s: str) -> date:
    return datetime.strptime(s, "%d/%m/%Y").date()


def extract_chunk(text: str) -> str:
    start = text.find("use these hours from our flight logs")
    if start < 0:
        start = text.find("All Flights Report")
    end = text.find("Print Report", start)
    if end < 0:
        end = start + 600_000
    else:
        end += len("Print Report")
    return text[start:end]


def main() -> None:
    text = SEG.read_text(encoding="utf-8")
    chunk = extract_chunk(text)
    rows = ROW_PAT.findall(chunk)
    print(f"parsed_rows={len(rows)}")

    by_code: dict[str, dict] = defaultdict(lambda: {"mins": 0, "n": 0})
    by_tail_since: dict[str, dict] = defaultdict(lambda: {"mins": 0, "n": 0, "codes": set()})
    by_tail_all: dict[str, dict] = defaultdict(lambda: {"mins": 0, "n": 0})
    unmapped: dict[str, dict] = defaultdict(lambda: {"mins": 0, "n": 0})

    for r in rows:
        date_s, _seq, _lt, _tow, glider, *_rest, dur, _h, _ch, _cmt = r
        g = glider.strip().upper()
        if not g:
            continue
        mins = parse_duration(dur)
        d = parse_date(date_s)
        by_code[g]["mins"] += mins
        by_code[g]["n"] += 1

        tail = CODE_TO_TAIL.get(g)
        if not tail:
            unmapped[g]["mins"] += mins
            unmapped[g]["n"] += 1
            continue

        by_tail_all[tail]["mins"] += mins
        by_tail_all[tail]["n"] += 1
        last = FLEET[tail]["last_annual"]
        if last is None or d >= last:
            by_tail_since[tail]["mins"] += mins
            by_tail_since[tail]["n"] += 1
            by_tail_since[tail]["codes"].add(g)

    print("\n=== Hours by log code (all flights in report) ===")
    for g, v in sorted(by_code.items(), key=lambda x: -x[1]["mins"]):
        print(f"  {g:6} {v['n']:4} fl  {v['mins']/60:7.2f}h")

    print("\n=== Club fleet: hours since last annual ===")
    results: dict[str, float | None] = {}
    mapped_tails = set(CODE_TO_TAIL.values())
    for tail, meta in FLEET.items():
        v = by_tail_since[tail]
        hrs = round(v["mins"] / 60, 1)
        if meta["last_annual"] is None or tail not in mapped_tails:
            results[tail] = None
        else:
            results[tail] = hrs
        codes = ",".join(sorted(v["codes"])) if v["codes"] else "(no mapped flights)"
        all_h = by_tail_all[tail]["mins"] / 60
        shown = results[tail] if results[tail] is not None else "n/a"
        print(
            f"  {tail:8} due={meta['due'] or '??':5} last_annual={meta['last_annual']} "
            f"since={shown:>6} ({v['n']} fl) codes={codes}  all_in_report={all_h:.1f}h"
        )

    print("\n=== Unmapped codes with time (private / cancel / unknown) ===")
    for g, v in sorted(unmapped.items(), key=lambda x: -x[1]["mins"]):
        if v["mins"] == 0:
            continue
        print(f"  {g:6} {v['n']:4} fl  {v['mins']/60:7.2f}h")

    out = Path(__file__).resolve().parents[1] / "docs" / "hours-since-annual.json"
    import json

    payload = {
        "asOf": "2026-11-22",
        "source": "All Flights Report 11/22/2025–11/22/2026",
        "mapping": CODE_TO_TAIL,
        "hoursSinceAnnual": {
            t: results[t] for t in FLEET
        },
        "notes": {
            "N7757S": "Mapped from G0S (only other club 2-33 code; flew same day as G5S).",
            "N27037": "Annual due unknown; no reliable log code; hours left blank.",
            "method": "Sum durations on/after approx last annual (due month prior year).",
            "coverage": "Report window 11/22/2025–11/22/2026; N1185S annual ~10/2025 may miss early hours.",
        },

    }
    out.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"\nwrote {out}")


if __name__ == "__main__":
    main()

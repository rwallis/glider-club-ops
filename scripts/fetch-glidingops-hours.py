#!/usr/bin/env python3
"""
Log into Fault Line Flyers GlidingOps, pull All Flights Report, and sum
club glider hours since last annual.

Credentials (never commit these):
  Set in repo-root .env:
    GLIDINGOPS_USER=your@email.com
    GLIDINGOPS_PASSWORD=...

Optional:
    GLIDINGOPS_FROM=MM/DD/YYYY   # report start (default: 1 year before today)
    GLIDINGOPS_TO=MM/DD/YYYY     # report end (default: today)
    GLIDINGOPS_BASE_URL=https://glidingops.faultlineflyers.com

Usage:
  python scripts/fetch-glidingops-hours.py
  python scripts/fetch-glidingops-hours.py --from 11/22/2025 --to 11/22/2026
  python scripts/fetch-glidingops-hours.py --save-html
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from collections import defaultdict
from datetime import date, datetime, timedelta
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.parse import urljoin

try:
    import requests
except ImportError:
    print("Install requests: pip install requests", file=sys.stderr)
    raise

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "docs" / "glidingops-cache"
OUT_JSON = ROOT / "docs" / "hours-since-annual.json"

DEFAULT_BASE = "https://glidingops.faultlineflyers.com"

# Log short code -> club fleet tail
CODE_TO_TAIL = {
    "G5S": "N1185S",
    "G85": "N1185S",
    "G9W": "N2479W",
    "G0S": "N7757S",
    "G9S": "N11139S",
    "GYP": "N136YP",
    "GSS": "N160SS",
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

# Tab-pasted / text table rows (DD/MM/YYYY)
ROW_PAT = re.compile(
    r"^(\d{2}/\d{2}/\d{4})\t(\d+)\tFLF\t([^\t]*)\t([^\t]*)\t([^\t]*)\t"
    r"([^\t]*)\t([^\t]*)\t([^\t]*)\t([^\t]*)\t([^\t]*)\t(\d{2}:\d{2})\t"
    r"([^\t]*)\t([^\t]*)\t?(.*)$",
    re.M,
)

# HTML table cell date DD/MM/YYYY + duration HH:MM somewhere later in the row
HTML_ROW_HINT = re.compile(
    r"<tr[^>]*>\s*<td[^>]*>\s*(\d{2}/\d{2}/\d{4})\s*</td>(.*?)</tr>",
    re.I | re.S,
)
DURATION_PAT = re.compile(r"\b(\d{2}:\d{2})\b")
GLIDER_CODE_PAT = re.compile(r"\b(G[A-Z0-9]{2,3})\b", re.I)


class FormParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.forms: list[dict[str, Any]] = []
        self._form: dict[str, Any] | None = None
        self._option_select: str | None = None
        self._button_name: str | None = None
        self._button_value_chunks: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        a = {k: (v or "") for k, v in attrs}
        if tag == "form":
            self._form = {
                "action": a.get("action", ""),
                "method": (a.get("method") or "GET").upper(),
                "fields": {},
                "date_fields": set(),
                "submits": {},
            }
            self.forms.append(self._form)
        elif self._form is None:
            return
        elif tag == "input":
            name = a.get("name")
            if not name:
                return
            typ = (a.get("type") or "text").lower()
            if typ in {"submit", "button", "image"}:
                self._form["submits"][name] = a.get("value", "") or "1"
                return
            if typ == "checkbox" and "checked" not in a:
                return
            if typ == "radio" and "checked" not in a:
                return
            self._form["fields"][name] = a.get("value", "")
            if typ == "date":
                self._form["date_fields"].add(name)
        elif tag == "button":
            name = a.get("name")
            if not name:
                return
            typ = (a.get("type") or "submit").lower()
            if typ != "submit":
                return
            self._button_name = name
            self._button_value_chunks = [a.get("value", "")]
        elif tag == "select":
            self._option_select = a.get("name") or None
        elif tag == "option" and self._option_select and "selected" in a:
            self._form["fields"][self._option_select] = a.get("value", "")
        elif tag == "textarea":
            name = a.get("name")
            if name and name not in self._form["fields"]:
                self._form["fields"][name] = ""

    def handle_data(self, data: str) -> None:
        if self._button_name is not None:
            self._button_value_chunks.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "form":
            self._form = None
        elif tag == "select":
            self._option_select = None
        elif tag == "button" and self._form is not None and self._button_name:
            value = "".join(self._button_value_chunks).strip() or "1"
            self._form["submits"][self._button_name] = value
            self._button_name = None
            self._button_value_chunks = []


def load_dotenv(path: Path) -> None:
    if not path.is_file():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip().strip("'").strip('"')
        os.environ.setdefault(key, val)


def parse_duration(dur: str) -> int:
    h, m = map(int, dur.split(":"))
    return h * 60 + m


def parse_table_date(s: str) -> date:
    """Flight log table dates are DD/MM/YYYY."""
    return datetime.strptime(s.strip(), "%d/%m/%Y").date()


def parse_form_date(s: str) -> date:
    """Accept MM/DD/YYYY or DD/MM/YYYY for CLI / env report window."""
    s = s.strip()
    for fmt in ("%m/%d/%Y", "%d/%m/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    raise ValueError(f"Unrecognized date: {s!r} (use MM/DD/YYYY)")


def format_form_date(d: date) -> str:
    """US-style MM/DD/YYYY as used on the All Flights Report From/To fields."""
    return d.strftime("%m/%d/%Y")


def extract_csrf(html: str) -> str | None:
    m = re.search(r'name=["\']csrf_token["\'][^>]*value=["\']([^"\']+)["\']', html, re.I)
    if m:
        return m.group(1)
    m = re.search(r'value=["\']([^"\']+)["\'][^>]*name=["\']csrf_token["\']', html, re.I)
    if m:
        return m.group(1)
    m = re.search(r'data-csrf=["\']([^"\']+)["\']', html, re.I)
    if m:
        return m.group(1)
    return None


def parse_forms(html: str) -> list[dict[str, Any]]:
    p = FormParser()
    p.feed(html)
    return p.forms


def pick_report_form(forms: list[dict[str, Any]]) -> dict[str, Any] | None:
    """Prefer a form that looks like the All Flights date filter."""
    scored: list[tuple[int, dict[str, Any]]] = []
    for form in forms:
        keys = {k.lower() for k in form["fields"]}
        joined = " ".join(keys)
        score = 0
        if any(x in joined for x in ("from", "start", "begin")):
            score += 2
        if any(x in joined for x in ("to", "end", "until")):
            score += 2
        if "date" in joined:
            score += 1
        if score:
            scored.append((score, form))
    if not scored:
        return forms[0] if forms else None
    scored.sort(key=lambda t: -t[0])
    return scored[0][1]


def format_iso_date(d: date) -> str:
    return d.strftime("%Y-%m-%d")


def set_date_fields(
    fields: dict[str, str],
    start: date,
    end: date,
    date_fields: set[str] | None = None,
) -> None:
    """Fill From/To fields. HTML5 type=date wants YYYY-MM-DD."""
    date_fields = date_fields or set()
    matched_from = False
    matched_to = False
    for key in list(fields):
        lk = key.lower()
        if "csrf" in lk or lk in {"_token", "token"}:
            continue
        use_iso = key in date_fields or lk.endswith("date")
        start_s = format_iso_date(start) if use_iso else format_form_date(start)
        end_s = format_iso_date(end) if use_iso else format_form_date(end)
        if any(x in lk for x in ("from", "start", "begin")) and not any(
            x in lk for x in ("to", "until")
        ):
            fields[key] = start_s
            matched_from = True
        elif any(x in lk for x in ("to", "end", "until")):
            fields[key] = end_s
            matched_to = True
    if not matched_from:
        fields["fromdate"] = format_iso_date(start)
    if not matched_to:
        fields["todate"] = format_iso_date(end)


def extract_flight_rows(html: str) -> list[tuple[date, str, int]]:
    """Return (flight_date, glider_code, duration_minutes)."""
    rows: list[tuple[date, str, int]] = []

    # Prefer structured tab text if present (copy/paste style)
    for r in ROW_PAT.findall(html.replace("\r\n", "\n")):
        date_s, _seq, _lt, _tow, glider, *_rest, dur, _h, _ch, _cmt = r
        g = glider.strip().upper()
        if not g:
            continue
        rows.append((parse_table_date(date_s), g, parse_duration(dur)))
    if rows:
        return rows

    # HTML table fallback: find DATE cell then glider code + last HH:MM as duration
    for m in HTML_ROW_HINT.finditer(html):
        date_s = m.group(1)
        body = m.group(2)
        texts = re.findall(r"<td[^>]*>(.*?)</td>", body, re.I | re.S)
        cells = [re.sub(r"<[^>]+>", "", t).strip() for t in texts]
        if not cells:
            continue
        # Expected order after DATE: SEQ LOCATION LAUNCH TOW GLIDER ... DURATION
        glider = ""
        if len(cells) >= 5:
            glider = cells[4].strip().upper()
        if not glider:
            codes = GLIDER_CODE_PAT.findall(" ".join(cells))
            glider = codes[0].upper() if codes else ""
        durs = [c for c in cells if DURATION_PAT.fullmatch(c)]
        if not durs:
            continue
        dur = durs[-1]  # DURATION column (TAKE OFF / LAND may also be HH:MM)
        try:
            rows.append((parse_table_date(date_s), glider, parse_duration(dur)))
        except ValueError:
            continue
    return rows


def sum_hours(rows: list[tuple[date, str, int]]) -> dict[str, float | None]:
    by_tail_since: dict[str, dict] = defaultdict(lambda: {"mins": 0, "n": 0, "codes": set()})
    for d, code, mins in rows:
        tail = CODE_TO_TAIL.get(code)
        if not tail:
            continue
        last = FLEET[tail]["last_annual"]
        if last is None or d >= last:
            by_tail_since[tail]["mins"] += mins
            by_tail_since[tail]["n"] += 1
            by_tail_since[tail]["codes"].add(code)

    results: dict[str, float | None] = {}
    mapped = set(CODE_TO_TAIL.values())
    for tail, meta in FLEET.items():
        v = by_tail_since[tail]
        if meta["last_annual"] is None or tail not in mapped:
            results[tail] = None
        else:
            results[tail] = round(v["mins"] / 60, 1)
        codes = ",".join(sorted(v["codes"])) if v["codes"] else "(none)"
        print(
            f"  {tail:8} due={meta['due'] or '??':5} "
            f"since={results[tail] if results[tail] is not None else 'n/a':>6} "
            f"({v['n']} fl) codes={codes}"
        )
    return results


def login(session: requests.Session, base: str, user: str, password: str) -> None:
    login_url = urljoin(base + "/", "Login.php")
    r = session.get(login_url, timeout=60)
    r.raise_for_status()
    csrf = extract_csrf(r.text)
    if not csrf:
        raise RuntimeError("Could not find csrf_token on Login.php")

    post_url = urljoin(base + "/", "checklogin.php")
    payload = {"csrf_token": csrf, "user": user, "pcode": password}
    r2 = session.post(post_url, data=payload, timeout=60, allow_redirects=True)
    r2.raise_for_status()

    # Success usually leaves Login.php; failure stays on login with message
    if "checklogin.php" in r2.url or (
        "Login.php" in r2.url and 'name="user"' in r2.text and "incorrect" in r2.text.lower()
    ):
        raise RuntimeError("Login failed — check GLIDINGOPS_USER / GLIDINGOPS_PASSWORD")

    # Some builds redirect back to Login.php even on success if cookie missing
    if 'name="pcode"' in r2.text and 'name="user"' in r2.text and "Please enter your login" in r2.text:
        raise RuntimeError("Login failed — still on login form after POST")

    print(f"Logged in (landed on {r2.url})")


def fetch_report(
    session: requests.Session,
    base: str,
    start: date,
    end: date,
) -> str:
    report_url = urljoin(base + "/", "app/allFlightsReport")
    r = session.get(report_url, timeout=60, allow_redirects=True)
    r.raise_for_status()
    if "Login.php" in r.url or 'name="pcode"' in r.text:
        raise RuntimeError("Session not authenticated for allFlightsReport")

    forms = parse_forms(r.text)
    form = pick_report_form(forms)
    html = r.text

    if form:
        fields = dict(form["fields"])
        csrf = extract_csrf(r.text)
        if csrf and "csrf_token" not in fields and "_token" not in fields:
            fields["csrf_token"] = csrf
        set_date_fields(fields, start, end, form.get("date_fields") or set())
        # Include the View Report submit control (Laravel-style forms often require it)
        submits = form.get("submits") or {}
        if "view" in submits:
            fields["view"] = submits["view"]
        elif submits:
            name, value = next(iter(submits.items()))
            fields[name] = value
        else:
            fields.setdefault("view", "View Report")

        action = urljoin(r.url, form["action"] or report_url)
        print(f"Submitting report form → {action}")
        interesting = {
            k: fields[k]
            for k in fields
            if k.lower() in {"fromdate", "todate", "from", "to", "view", "_token", "csrf_token"}
            or "date" in k.lower()
        }
        print("  fields: " + ", ".join(f"{k}={v}" for k, v in interesting.items() if k.lower() not in {"_token", "csrf_token"}))
        if form["method"] == "POST":
            r2 = session.post(action, data=fields, timeout=120, allow_redirects=True)
        else:
            r2 = session.get(action, params=fields, timeout=120, allow_redirects=True)
        r2.raise_for_status()
        html = r2.text
    else:
        params = {
            "fromdate": format_iso_date(start),
            "todate": format_iso_date(end),
            "view": "View Report",
        }
        print("No form found; retrying POST with fromdate/todate")
        r2 = session.post(report_url, data=params, timeout=120, allow_redirects=True)
        r2.raise_for_status()
        html = r2.text

    return html


def main() -> int:
    load_dotenv(ROOT / ".env")

    today = date.today()
    default_from = today - timedelta(days=365)

    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--from", dest="date_from", default=os.environ.get("GLIDINGOPS_FROM") or format_form_date(default_from))
    ap.add_argument("--to", dest="date_to", default=os.environ.get("GLIDINGOPS_TO") or format_form_date(today))
    ap.add_argument("--base-url", default=os.environ.get("GLIDINGOPS_BASE_URL") or DEFAULT_BASE)
    ap.add_argument("--save-html", action="store_true", help="Write raw report HTML to docs/glidingops-cache/")
    ap.add_argument("--html-only", type=Path, help="Skip fetch; parse an existing HTML/text file")
    args = ap.parse_args()

    start = parse_form_date(args.date_from)
    end = parse_form_date(args.date_to)

    if args.html_only:
        html = args.html_only.read_text(encoding="utf-8", errors="replace")
        source = f"local file {args.html_only}"
    else:
        user = os.environ.get("GLIDINGOPS_USER", "").strip()
        password = os.environ.get("GLIDINGOPS_PASSWORD", "").strip()
        if not user or not password:
            print(
                "Missing credentials.\n"
                "Add to .env (gitignored):\n"
                "  GLIDINGOPS_USER=your@email.com\n"
                "  GLIDINGOPS_PASSWORD=...\n",
                file=sys.stderr,
            )
            return 1

        base = args.base_url.rstrip("/")
        session = requests.Session()
        session.headers.update(
            {
                "User-Agent": "FLF-AircraftBoard/1.0 (+local hours sync)",
                "Accept": "text/html,application/xhtml+xml",
            }
        )
        print(f"Logging in as {user} @ {base}")
        login(session, base, user, password)
        print(f"Fetching All Flights Report {format_form_date(start)} → {format_form_date(end)}")
        html = fetch_report(session, base, start, end)
        source = f"All Flights Report {format_form_date(start)}–{format_form_date(end)}"

        if args.save_html:
            CACHE.mkdir(parents=True, exist_ok=True)
            out_html = CACHE / f"all-flights-{start.isoformat()}_{end.isoformat()}.html"
            out_html.write_text(html, encoding="utf-8")
            print(f"Wrote {out_html}")

    rows = extract_flight_rows(html)
    print(f"Parsed {len(rows)} flight rows with duration")
    if not rows:
        print(
            "No flight rows parsed. Re-run with --save-html and inspect the cached HTML "
            "(date field names or table markup may differ).",
            file=sys.stderr,
        )
        return 2

    print("\n=== Club fleet: hours since last annual ===")
    results = sum_hours(rows)

    payload = {
        "asOf": date.today().isoformat(),
        "source": source,
        "mapping": CODE_TO_TAIL,
        "hoursSinceAnnual": {t: results[t] for t in FLEET},
        "notes": {
            "N7757S": "Mapped from G0S (only other club 2-33 code; flew same day as G5S).",
            "N27037": "Annual due unknown; no reliable log code; hours left blank.",
            "method": "Sum durations on/after approx last annual (due month prior year).",
            "coverage": f"Report window {format_form_date(start)}–{format_form_date(end)}.",
        },
    }
    OUT_JSON.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"\nWrote {OUT_JSON}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

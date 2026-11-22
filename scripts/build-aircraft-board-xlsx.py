#!/usr/bin/env python3
"""Build a card-style Aircraft Status workbook for Google Sheets import."""

from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

OUT = Path(__file__).resolve().parents[1] / "docs" / "Aircraft-Status-Board.xlsx"

# As of 2026-11-22
# type, color, tail, status, last_annual, due, hours, reason, last_updated, urgency, demo
FLEET = [
    ("Pawnee", "", "N42VA", "Down", "", "05/26", "", "Down since May 2026", "2026-11-22", "red", "Demo N/A"),
    ("Cessna", "", "N48887", "Down", "", "10/26", "", "Annual overdue", "2026-11-22", "red", "Demo N/A"),
    ("2-33", "Yellow", "N1185S", "Down", "", "10/26", 65.7, "Annual overdue", "2026-11-22", "red", "Demo Down"),
    ("2-33", "White/Green", "N7757S", "Up", "", "05/27", 2.5, "", "2026-11-22", "green", "Demo Up"),
    ("2-33", "White", "N2479W", "Up", "", "12/26", 43.9, "", "2026-11-22", "amber", "Demo Up"),
    ("Grob", "", "N160SS", "Up", "", "01/27", 18.9, "", "2026-11-22", "green", "Demo Up"),
    ("1-26", "White", "N11139S", "Up", "", "05/27", 21.6, "", "2026-11-22", "green", "Demo N/A"),
    ("1-26", "White/Yellow", "N27037", "Down", "", "", "", "Annual due unknown", "2026-11-22", "unknown", "Demo N/A"),
    ("1-36", "", "N136YP", "Up", "", "05/27", 30.2, "", "2026-11-22", "green", "Demo N/A"),
]

SECTIONS = [
    ("Tow planes", "Launch aircraft — demo rides N/A", [0, 1]),
    ("2-seat gliders", "2-33s and Grob — demo rides apply", [2, 3, 4, 5]),
    ("Single-seat gliders", "1-26s and 1-36 — demo rides N/A", [6, 7, 8]),
]

FILL = {
    "bg": PatternFill("solid", fgColor="0F2744"),
    "card": PatternFill("solid", fgColor="173553"),
    "header": PatternFill("solid", fgColor="0C1A2E"),
    "up": PatternFill("solid", fgColor="065F46"),
    "down": PatternFill("solid", fgColor="9F1239"),
    "green": PatternFill("solid", fgColor="047857"),
    "amber": PatternFill("solid", fgColor="B45309"),
    "red": PatternFill("solid", fgColor="BE123C"),
    "unknown": PatternFill("solid", fgColor="475569"),
    "muted": PatternFill("solid", fgColor="1E3A56"),
    "white": PatternFill("solid", fgColor="FFFFFF"),
    "data_header": PatternFill("solid", fgColor="1E293B"),
    "data_alt": PatternFill("solid", fgColor="F8FAFC"),
    "demo_up": PatternFill("solid", fgColor="064E3B"),
    "demo_down": PatternFill("solid", fgColor="7F1D1D"),
    "demo_na": PatternFill("solid", fgColor="334155"),
}

FONT = {
    "title": Font(name="Arial", size=22, bold=True, color="F8FAFC"),
    "subtitle": Font(name="Arial", size=11, color="7DD3FC"),
    "section": Font(name="Arial", size=14, bold=True, color="F8FAFC"),
    "section_sub": Font(name="Arial", size=9, color="94A3B8"),
    "tail": Font(name="Arial", size=18, bold=True, color="FFFFFF"),
    "meta": Font(name="Arial", size=10, color="BAE6FD"),
    "label": Font(name="Arial", size=8, bold=True, color="94A3B8"),
    "value": Font(name="Arial", size=11, color="E2E8F0"),
    "ops_chip": Font(name="Arial", size=12, bold=True, color="FFFFFF"),
    "demo_chip": Font(name="Arial", size=8, bold=True, color="FFFFFF"),
    "chip": Font(name="Arial", size=10, bold=True, color="FFFFFF"),
    "legend": Font(name="Arial", size=10, color="CBD5E1"),
    "data": Font(name="Arial", size=11, color="0F172A"),
    "data_header": Font(name="Arial", size=11, bold=True, color="F8FAFC"),
}

THIN = Border(
    left=Side(style="thin", color="334155"),
    right=Side(style="thin", color="334155"),
    top=Side(style="thin", color="334155"),
    bottom=Side(style="thin", color="334155"),
)


def paint(ws, row, col, value="", fill=None, font=None, align=None, border=None):
    cell = ws.cell(row=row, column=col, value=value)
    if fill:
        cell.fill = fill
    if font:
        cell.font = font
    if align:
        cell.alignment = align
    if border:
        cell.border = border
    return cell


def demo_fill(demo: str):
    if demo == "Demo Up":
        return FILL["demo_up"]
    if demo == "Demo Down":
        return FILL["demo_down"]
    return FILL["demo_na"]


def build_fleet_data(wb: Workbook):
    ws = wb.create_sheet("FleetData", 0)
    headers = [
        "Type",
        "Color",
        "Tail",
        "Status",
        "Last Annual",
        "Due (MM/YY)",
        "Hours Since Annual",
        "Reason Grounded",
        "Last Updated",
    ]
    for i, h in enumerate(headers, 1):
        paint(
            ws,
            1,
            i,
            h,
            FILL["data_header"],
            FONT["data_header"],
            Alignment(horizontal="center", vertical="center"),
            THIN,
        )

    for r, row in enumerate(FLEET, 2):
        vals = row[:9]
        for c, v in enumerate(vals, 1):
            paint(
                ws,
                r,
                c,
                v,
                FILL["white"] if r % 2 == 0 else FILL["data_alt"],
                FONT["data"],
                Alignment(vertical="center"),
                THIN,
            )

    widths = [10, 14, 12, 10, 12, 12, 18, 28, 14]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w

    dv = DataValidation(type="list", formula1='"Up,Down"', allow_blank=False)
    ws.add_data_validation(dv)
    dv.add(f"D2:D{1 + len(FLEET)}")

    ws.freeze_panes = "A2"
    ws.auto_filter.ref = f"A1:I{1 + len(FLEET)}"


def card_block(ws, start_row, start_col, aircraft):
    type_, color, tail, status, last_annual, due, hours, reason, updated, urgency, demo = aircraft
    # Card is 4 cols x 9 rows (extra row for demo)
    end_row = start_row + 8
    end_col = start_col + 3

    urgency_fill = FILL.get(urgency, FILL["unknown"])
    status_fill = FILL["up"] if status == "Up" else FILL["down"]
    subtitle = " · ".join(p for p in (type_, color) if p)
    due_label = f"Due {due or '—'}  ·  {'UNKNOWN' if not due else urgency.upper()}"
    reason_show = reason if status == "Down" else "—"
    hours_show = hours if hours != "" else "—"
    last_show = last_annual if last_annual else "—"

    for r in range(start_row, end_row + 1):
        for c in range(start_col, end_col + 1):
            paint(ws, r, c, "", FILL["card"], border=THIN)

    for r in range(start_row, end_row + 1):
        paint(ws, r, start_col, "", urgency_fill, border=THIN)

    # Tail (taller for ops prominence)
    ws.merge_cells(
        start_row=start_row,
        start_column=start_col + 1,
        end_row=start_row + 1,
        end_column=start_col + 2,
    )
    t = ws.cell(row=start_row, column=start_col + 1, value=tail)
    t.font = FONT["tail"]
    t.fill = FILL["card"]
    t.alignment = Alignment(horizontal="left", vertical="center")

    # Larger Ops chip (2 rows)
    ws.merge_cells(
        start_row=start_row,
        start_column=start_col + 3,
        end_row=start_row + 1,
        end_column=start_col + 3,
    )
    s = ws.cell(row=start_row, column=start_col + 3, value=f"OPS {status.upper()}")
    s.font = FONT["ops_chip"]
    s.fill = status_fill
    s.alignment = Alignment(horizontal="center", vertical="center")
    s.border = THIN

    # Smaller Demo chip
    paint(
        ws,
        start_row + 2,
        start_col + 3,
        demo,
        demo_fill(demo),
        FONT["demo_chip"],
        Alignment(horizontal="center", vertical="center"),
        THIN,
    )

    ws.merge_cells(
        start_row=start_row + 2,
        start_column=start_col + 1,
        end_row=start_row + 2,
        end_column=start_col + 2,
    )
    sub = ws.cell(row=start_row + 2, column=start_col + 1, value=subtitle)
    sub.font = FONT["meta"]
    sub.fill = FILL["card"]

    ws.merge_cells(
        start_row=start_row + 3,
        start_column=start_col + 1,
        end_row=start_row + 3,
        end_column=end_col,
    )
    d = ws.cell(row=start_row + 3, column=start_col + 1, value=due_label)
    d.font = FONT["chip"]
    d.fill = urgency_fill
    d.alignment = Alignment(horizontal="left", vertical="center")

    paint(ws, start_row + 4, start_col + 1, "LAST ANNUAL", FILL["card"], FONT["label"])
    paint(ws, start_row + 4, start_col + 2, last_show, FILL["card"], FONT["value"])
    paint(ws, start_row + 4, start_col + 3, f"HRS {hours_show}", FILL["card"], FONT["value"])

    paint(ws, start_row + 5, start_col + 1, "GROUNDED", FILL["card"], FONT["label"])
    ws.merge_cells(
        start_row=start_row + 5,
        start_column=start_col + 2,
        end_row=start_row + 5,
        end_column=end_col,
    )
    g = ws.cell(row=start_row + 5, column=start_col + 2, value=reason_show)
    g.font = FONT["value"]
    g.fill = FILL["card"]

    paint(ws, start_row + 6, start_col + 1, "UPDATED", FILL["card"], FONT["label"])
    ws.merge_cells(
        start_row=start_row + 6,
        start_column=start_col + 2,
        end_row=start_row + 6,
        end_column=end_col,
    )
    u = ws.cell(row=start_row + 6, column=start_col + 2, value=updated)
    u.font = FONT["value"]
    u.fill = FILL["card"]

    ws.merge_cells(
        start_row=start_row + 7,
        start_column=start_col + 1,
        end_row=start_row + 8,
        end_column=end_col,
    )
    note = ws.cell(
        row=start_row + 7,
        column=start_col + 1,
        value="Edit Status / Due / Hours on FleetData tab",
    )
    note.font = Font(name="Arial", size=8, italic=True, color="94A3B8")
    note.fill = FILL["muted"]
    note.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

    return end_row, end_col


def build_board(wb: Workbook):
    ws = wb.create_sheet("Board", 1)
    ws.sheet_view.showGridLines = False

    for c in range(1, 16):
        ws.column_dimensions[get_column_letter(c)].width = 12
    for r in range(1, 55):
        ws.row_dimensions[r].height = 18
        for c in range(1, 16):
            paint(ws, r, c, "", FILL["bg"])

    for r in range(1, 4):
        for c in range(1, 15):
            paint(ws, r, c, "", FILL["header"])
    ws.merge_cells("A1:N2")
    title = ws["A1"]
    title.value = "Aircraft Status Board"
    title.font = FONT["title"]
    title.alignment = Alignment(horizontal="left", vertical="center")
    title.fill = FILL["header"]

    ws.merge_cells("A3:N3")
    sub = ws["A3"]
    sub.value = (
        "Fredericksburg Lonestar Flyers  ·  Tow / 2-seat / Single-seat  ·  "
        "Ops pill larger than Demo  ·  Demo only on 2-33 & Grob"
    )
    sub.font = FONT["subtitle"]
    sub.alignment = Alignment(horizontal="left", vertical="center")
    sub.fill = FILL["header"]

    paint(ws, 4, 1, "", FILL["red"])
    paint(ws, 4, 2, "≤14d / overdue", FILL["bg"], FONT["legend"])
    paint(ws, 4, 4, "", FILL["amber"])
    paint(ws, 4, 5, "≤60d", FILL["bg"], FONT["legend"])
    paint(ws, 4, 7, "", FILL["green"])
    paint(ws, 4, 8, ">60d", FILL["bg"], FONT["legend"])
    paint(ws, 4, 10, "", FILL["unknown"])
    paint(ws, 4, 11, "Due unknown", FILL["bg"], FONT["legend"])

    card_cols = [1, 6, 11]
    row = 6
    for section_title, section_blurb, indices in SECTIONS:
        for c in range(1, 15):
            paint(ws, row, c, "", FILL["header"])
        ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=14)
        h = ws.cell(row=row, column=1, value=section_title)
        h.font = FONT["section"]
        h.fill = FILL["header"]
        h.alignment = Alignment(horizontal="left", vertical="center")
        row += 1
        for c in range(1, 15):
            paint(ws, row, c, "", FILL["header"])
        ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=14)
        b = ws.cell(row=row, column=1, value=section_blurb)
        b.font = FONT["section_sub"]
        b.fill = FILL["header"]
        row += 1

        for i, idx in enumerate(indices):
            col = card_cols[i % 3]
            if i > 0 and i % 3 == 0:
                row += 10
            card_block(ws, row, col, FLEET[idx])
        # advance past last card row (+9 height) plus gap
        cards_in_last_row = ((len(indices) - 1) % 3) + 1
        _ = cards_in_last_row
        row += 11

    up = sum(1 for a in FLEET if a[3] == "Up")
    down = sum(1 for a in FLEET if a[3] == "Down")
    for r in range(row, row + 2):
        for c in range(1, 15):
            paint(ws, r, c, "", FILL["header"])
    ws.merge_cells(start_row=row, start_column=1, end_row=row + 1, end_column=14)
    foot = ws.cell(row=row, column=1)
    foot.value = (
        f"{up} Ops Up   ·   {down} Ops Down   ·   Seed 2026-11-22   ·   Source: FleetData tab"
    )
    foot.font = FONT["legend"]
    foot.alignment = Alignment(horizontal="left", vertical="center")
    foot.fill = FILL["header"]

    ws.row_dimensions[1].height = 28
    ws.row_dimensions[2].height = 10


def main():
    wb = Workbook()
    default = wb.active
    wb.remove(default)
    build_fleet_data(wb)
    build_board(wb)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    wb.save(OUT)
    print(str(OUT))


if __name__ == "__main__":
    main()

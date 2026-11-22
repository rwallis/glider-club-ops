#!/usr/bin/env python3
"""Build a card-style Aircraft Status workbook for Google Sheets import."""

from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

OUT = Path(__file__).resolve().parents[1] / "docs" / "Aircraft-Status-Board.xlsx"

# As of 2026-11-22
FLEET = [
    # type, color, tail, status, last_annual, due, hours, reason, last_updated, urgency
    ("Pawnee", "", "N42VA", "Down", "", "05/26", "", "Down since May 2026", "2026-11-22", "red"),
    ("Cessna", "", "N48887", "Down", "", "10/26", "", "Annual overdue", "2026-11-22", "red"),
    ("2-33", "Yellow", "N1185S", "Down", "", "10/26", "", "Annual overdue", "2026-11-22", "red"),
    ("2-33", "White/Green", "N7757S", "Up", "", "05/27", "", "", "2026-11-22", "green"),
    ("2-33", "White", "N2479W", "Up", "", "12/26", "", "", "2026-11-22", "amber"),
    ("1-26", "White", "N11139S", "Up", "", "05/27", "", "", "2026-11-22", "green"),
    ("1-26", "White/Yellow", "N27037", "Down", "", "", "", "Annual due unknown", "2026-11-22", "unknown"),
    ("1-36", "", "N136YP", "Up", "", "05/27", "", "", "2026-11-22", "green"),
    ("Grob", "", "N160SS", "Up", "", "01/27", "", "", "2026-11-22", "green"),
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
}

FONT = {
    "title": Font(name="Arial", size=22, bold=True, color="F8FAFC"),
    "subtitle": Font(name="Arial", size=11, color="7DD3FC"),
    "tail": Font(name="Arial", size=18, bold=True, color="FFFFFF"),
    "meta": Font(name="Arial", size=10, color="BAE6FD"),
    "label": Font(name="Arial", size=8, bold=True, color="94A3B8"),
    "value": Font(name="Arial", size=11, color="E2E8F0"),
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


def merge_paint(ws, r1, c1, r2, c2, value="", fill=None, font=None, align=None, border=None):
    for r in range(r1, r2 + 1):
        for c in range(c1, c2 + 1):
            cell = ws.cell(row=r, column=c)
            if fill:
                cell.fill = fill
            if border:
                cell.border = border
    ws.merge_cells(start_row=r1, start_column=c1, end_row=r2, end_column=c2)
    cell = ws.cell(row=r1, column=c1, value=value)
    if fill:
        cell.fill = fill
    if font:
        cell.font = font
    if align:
        cell.alignment = align
    if border:
        cell.border = border
    return cell


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
    type_, color, tail, status, last_annual, due, hours, reason, updated, urgency = aircraft
    # Card is 4 cols x 8 rows
    end_row = start_row + 7
    end_col = start_col + 3

    urgency_fill = FILL.get(urgency, FILL["unknown"])
    status_fill = FILL["up"] if status == "Up" else FILL["down"]
    subtitle = " · ".join(p for p in (type_, color) if p)
    due_label = f"Due {due or '—'}  ·  {'UNKNOWN' if not due else urgency.upper()}"
    reason_show = reason if status == "Down" else "—"
    hours_show = hours if hours != "" else "—"
    last_show = last_annual if last_annual else "—"

    # Card body fill
    for r in range(start_row, end_row + 1):
        for c in range(start_col, end_col + 1):
            paint(ws, r, c, "", FILL["card"], border=THIN)

    # Urgency strip
    for r in range(start_row, end_row + 1):
        paint(ws, r, start_col, "", urgency_fill, border=THIN)

    # Tail (2x2)
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

    # Status chip
    ws.merge_cells(
        start_row=start_row,
        start_column=start_col + 3,
        end_row=start_row + 1,
        end_column=start_col + 3,
    )
    s = ws.cell(row=start_row, column=start_col + 3, value=status.upper())
    s.font = FONT["chip"]
    s.fill = status_fill
    s.alignment = Alignment(horizontal="center", vertical="center")
    s.border = THIN

    # Subtitle
    ws.merge_cells(
        start_row=start_row + 2,
        start_column=start_col + 1,
        end_row=start_row + 2,
        end_column=end_col,
    )
    sub = ws.cell(row=start_row + 2, column=start_col + 1, value=subtitle)
    sub.font = FONT["meta"]
    sub.fill = FILL["card"]

    # Due chip
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
        end_row=start_row + 7,
        end_column=end_col,
    )
    note = ws.cell(
        row=start_row + 7,
        column=start_col + 1,
        value="Edit Status / Due on FleetData tab",
    )
    note.font = Font(name="Arial", size=8, italic=True, color="94A3B8")
    note.fill = FILL["muted"]

    return end_row, end_col


def build_board(wb: Workbook):
    ws = wb.create_sheet("Board", 1)
    ws.sheet_view.showGridLines = False

    # Canvas size: 3 cards per row, each 4 cols, with 1-col gap → cols 1..14
    for c in range(1, 16):
        ws.column_dimensions[get_column_letter(c)].width = 12
    for r in range(1, 40):
        ws.row_dimensions[r].height = 18

    # Background wash (no merges yet)
    for r in range(1, 40):
        for c in range(1, 16):
            paint(ws, r, c, "", FILL["bg"])

    # Header band
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
        "Fredericksburg Lonestar Flyers  ·  Up / Down  ·  Annual due MM/YY  ·  "
        "Red / Amber / Green urgency strip"
    )
    sub.font = FONT["subtitle"]
    sub.alignment = Alignment(horizontal="left", vertical="center")
    sub.fill = FILL["header"]

    # Legend
    paint(ws, 4, 1, "", FILL["red"])
    paint(ws, 4, 2, "≤14d / overdue", FILL["bg"], FONT["legend"])
    paint(ws, 4, 4, "", FILL["amber"])
    paint(ws, 4, 5, "≤60d", FILL["bg"], FONT["legend"])
    paint(ws, 4, 7, "", FILL["green"])
    paint(ws, 4, 8, ">60d", FILL["bg"], FONT["legend"])
    paint(ws, 4, 10, "", FILL["unknown"])
    paint(ws, 4, 11, "Due unknown", FILL["bg"], FONT["legend"])

    # Sort: Down first (already ordered in FLEET)
    positions = [
        (6, 1),
        (6, 6),
        (6, 11),
        (16, 1),
        (16, 6),
        (16, 11),
        (26, 1),
        (26, 6),
        (26, 11),
    ]
    for aircraft, (r, c) in zip(FLEET, positions):
        card_block(ws, r, c, aircraft)

    # Counts
    up = sum(1 for a in FLEET if a[3] == "Up")
    down = sum(1 for a in FLEET if a[3] == "Down")
    for r in range(35, 37):
        for c in range(1, 15):
            paint(ws, r, c, "", FILL["header"])
    ws.merge_cells("A35:N36")
    foot = ws["A35"]
    foot.value = (
        f"{up} Up   ·   {down} Down   ·   Prototype seed 2026-11-22   ·   Source: FleetData tab"
    )
    foot.font = FONT["legend"]
    foot.alignment = Alignment(horizontal="left", vertical="center")
    foot.fill = FILL["header"]

    ws.row_dimensions[1].height = 28
    ws.row_dimensions[2].height = 10


def main():
    wb = Workbook()
    # remove default
    default = wb.active
    wb.remove(default)
    build_fleet_data(wb)
    build_board(wb)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    wb.save(OUT)
    print(str(OUT))


if __name__ == "__main__":
    main()

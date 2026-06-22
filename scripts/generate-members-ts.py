import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ODS = Path(r"c:\Users\ronwa\Downloads\FLF_February_2024_Member_List.ods")
OUT = Path(__file__).resolve().parent.parent / "src" / "data" / "members.ts"
NS = {
    "office": "urn:oasis:names:tc:opendocument:xmlns:office:1.0",
    "table": "urn:oasis:names:tc:opendocument:xmlns:table:1.0",
    "text": "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
}

z = zipfile.ZipFile(ODS)
root = ET.fromstring(z.read("content.xml"))
names = []
for row in root.findall(".//table:table-row", NS):
    cells = []
    for cell in row.findall("table:table-cell", NS):
        reps = int(cell.get(f"{{{NS['table']}}}number-columns-repeated", 1))
        texts = "".join((p.text or "") for p in cell.findall(".//text:p", NS))
        cells.extend([texts] * reps)
    if not cells or not cells[0].strip():
        continue
    name = cells[0].strip()
    if name.lower() in ("name", "email address"):
        continue
    names.append(name)

names = sorted(set(names), key=lambda n: n.split()[-1].lower() if n.split() else n.lower())

lines = [
    "/** FLF member roster (Feb 2024) — used for signup pilot picker */",
    "export const CLUB_MEMBERS = [",
]
for n in names:
    lines.append(f"  {n!r},")
lines.append("] as const")
lines.append("")
lines.append("export type ClubMember = (typeof CLUB_MEMBERS)[number]")
OUT.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {len(names)} members to {OUT}")

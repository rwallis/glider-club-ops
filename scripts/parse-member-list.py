import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ODS = Path(r"c:\Users\ronwa\Downloads\FLF_February_2024_Member_List.ods")
NS = {
    "office": "urn:oasis:names:tc:opendocument:xmlns:office:1.0",
    "table": "urn:oasis:names:tc:opendocument:xmlns:table:1.0",
    "text": "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
}
z = zipfile.ZipFile(ODS)
root = ET.fromstring(z.read("content.xml"))
rows = []
for row in root.findall(".//table:table-row", NS):
    cells = []
    for cell in row.findall("table:table-cell", NS):
        reps = int(cell.get(f"{{{NS['table']}}}number-columns-repeated", 1))
        texts = "".join(
            (p.text or "") for p in cell.findall(".//text:p", NS)
        )
        cells.extend([texts] * reps)
    if any(c.strip() for c in cells):
        rows.append(cells)

for r in rows[:40]:
    print("|".join(r[:8]))
print("---TOTAL ROWS", len(rows))

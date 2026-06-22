import re
from pathlib import Path

html = Path(__file__).resolve().parent.parent / "tmp-joy-page.html"
text = html.read_text(encoding="utf-8", errors="ignore")

urls = set(re.findall(r"https://lh3\.googleusercontent\.com/sitesv/[^\"'\\>\s]+", text))
urls |= set(re.findall(r"https://www\.youtube\.com/embed/[^\"'\\>\s]+", text))
urls |= set(re.findall(r"https://youtu\.be/[^\"'\\>\s]+", text))

for u in sorted(urls):
    print(u[:120])

print("---", len(urls))

import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "tmp-joy.html"
OUT = ROOT / "public" / "images" / "joy"
OUT.mkdir(parents=True, exist_ok=True)

text = HTML.read_text(encoding="utf-8", errors="ignore")
text = text.replace("\\x3d", "=").replace("\\u003d", "=")

# Google Sites image paths are long tokens; stop at delimiter only.
pattern = re.compile(
    r"https://lh3\.googleusercontent\.com/sitesv/[A-Za-z0-9_\-]+(?:=w\d+)?"
)
urls = []
seen = set()
for match in pattern.finditer(text):
    url = match.group(0)
    if url not in seen:
        seen.add(url)
        urls.append(url)

print(f"Found {len(urls)} unique image URLs")
if urls:
    print("sample length", len(urls[0]))

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://www.faultlineflyers.com/the-joy-of-soaring",
    "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
}

manifest = []
for i, url in enumerate(urls):
    fetch_url = url if "=w" in url else f"{url}=w1600"
    dest = OUT / f"photo-{i + 1:02d}.jpg"
    req = urllib.request.Request(fetch_url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = resp.read()
            if len(data) < 2000:
                print(f"skip {i + 1}: small payload ({len(data)} bytes)")
                continue
            dest.write_bytes(data)
            manifest.append(f"photo-{i + 1:02d}.jpg")
            print(f"ok {dest.name} ({len(data) // 1024} KB)")
    except Exception as e:
        print(f"fail {i + 1}: {e}")

manifest_path = ROOT / "src" / "data" / "joy-manifest.txt"
manifest_path.write_text("\n".join(manifest), encoding="utf-8")
print(f"Saved {len(manifest)} images")

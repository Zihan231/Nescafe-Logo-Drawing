"""Read a JSON array of doodle records on stdin and render an artwork QA sheet."""
import json
import math
import sys
from pathlib import Path
from urllib.parse import unquote

import pymupdf as fitz
from PIL import Image, ImageDraw, ImageFont

items = json.load(sys.stdin)
columns = 8
sheet = Image.new("RGB", (columns * 160, math.ceil(len(items) / columns) * 150), "#f5ebdf")
draw = ImageDraw.Draw(sheet)
font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 12)
for index, item in enumerate(items):
    source = item["src"]
    svg = unquote(source.split(",", 1)[1]) if source.startswith("data:") else Path("public" + source).read_text(encoding="utf-8")
    page = fitz.open(stream=svg.encode(), filetype="svg")[0]
    pix = page.get_pixmap(matrix=fitz.Matrix(1, 1), alpha=True)
    image = Image.frombytes("RGBA", (pix.width, pix.height), pix.samples)
    if not image.getbbox():
        raise ValueError("Empty artwork: " + item["label"])
    image.thumbnail((110, 110))
    x, y = (index % columns) * 160, (index // columns) * 150
    sheet.paste(image, (x + (160 - image.width) // 2, y + 8), image)
    draw.text((x + 80, y + 125), item["label"], font=font, fill="#3a1d18", anchor="mt")
target = Path("tmp/ai-doodles/profession-expansion-preview.png")
target.parent.mkdir(parents=True, exist_ok=True)
sheet.save(target)
print(f"Rendered {len(items)} non-empty SVG doodles: {target}")

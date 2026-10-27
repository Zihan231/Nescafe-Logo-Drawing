"""Extract original vector doodles from the PDF-compatible NESCAFE Illustrator board.

Usage: python scripts/extract_ai_doodles.py SOURCE.ai
Regions reference the 1800px-wide overview of artboard 1. The source is read only.
Requires PyMuPDF and Pillow. Outputs transparent SVGs, a manifest, and a QA sheet.
"""

import argparse
import json
import math
from pathlib import Path

import pymupdf as fitz
from PIL import Image, ImageDraw, ImageFont


REGIONS = [
    ("headphones", "Headphones", (179, 135, 278, 245)),
    ("guitar", "Guitar", (1535, 319, 1635, 416)),
    ("music-notes", "Music notes", (1474, 152, 1507, 196)),
    ("music-note", "Music note", (412, 195, 462, 243)),
    ("guitarist", "Guitarist", (482, 342, 616, 457)),
    ("music-listener", "Music listener", (708, 633, 803, 748)),
    ("dancer", "Dancer", (249, 315, 434, 505)),
    ("jumping-dancer", "Jumping dancer", (530, 52, 631, 165)),
    ("skater", "Street dancer", (936, 566, 1083, 697)),
    ("photographer", "Photographer", (1125, 602, 1208, 735)),
    ("camera", "Camera", (1117, 379, 1176, 437)),
    ("football", "Football", (1328, 8, 1376, 57)),
    ("basketball", "Basketball", (275, 110, 320, 154)),
    ("trophy", "Trophy", (1201, 200, 1263, 267)),
    ("medal", "Medal", (562, 207, 613, 267)),
    ("stopwatch", "Stopwatch", (128, 186, 181, 237)),
    ("tennis-ball", "Tennis ball", (1389, 313, 1429, 354)),
    ("laptop", "Laptop", (1017, 441, 1071, 481)),
    ("phone", "Phone", (650, 581, 685, 635)),
    ("game-controller", "Game controller", (1300, 191, 1402, 281)),
    ("rocket", "Rocket", (1415, 1, 1457, 75)),
    ("globe", "Globe", (1348, 122, 1402, 166)),
    ("lightning", "Lightning", (1251, 20, 1286, 65)),
    ("pen", "Pencil", (834, 549, 883, 586)),
    ("paintbrush", "Paintbrush", (1150, 126, 1178, 189)),
    ("potted-flower", "Potted flower", (1198, 357, 1238, 425)),
    ("coffee-leaves", "Coffee leaves", (1618, 437, 1718, 528)),
    ("sunglasses", "Sunglasses", (1459, 676, 1505, 722)),
    ("cap", "Cap", (771, 506, 837, 550)),
    ("coffee-break", "Coffee break", (881, 367, 1038, 490)),
    ("reading", "Reading", (1309, 526, 1472, 634)),
    ("red-mug", "Red NESCAFE mug", (72, 72, 153, 153)),
    ("steaming-coffee", "Steaming coffee", (47, 731, 109, 818)),
    ("takeaway-coffee", "Takeaway coffee", (1269, 354, 1328, 428)),
    ("coffee-jar", "Coffee jar", (1441, 295, 1512, 376)),
    ("skateboard", "Skateboard", (533, 468, 590, 519)),
];

# Exact source path sequences keep neighboring board decorations out of the asset.
SEQUENCES = {
    "headphones": (253, 262),
    "guitar": (1354, 1358),
    "guitarist": (4650, 4687),
    "music-listener": (4563, 4594),
    "dancer": (101, 107),
    "jumping-dancer": (2332, 2336),
    "skater": (1030, 1036),
    "photographer": (4506, 4531),
    "coffee-leaves": (3463, 3463),
    "coffee-break": (4535, 4561),
    "reading": (4595, 4630),
    "red-mug": (4753, 4764),
    "steaming-coffee": (17, 22),
    "takeaway-coffee": (520, 531),
}
EXTRA_SEQUENCES = {
    "guitarist": {4562},
    "music-listener": {4534},
    "coffee-break": {4505},
}


def number(value):
    return f"{value:.4f}".rstrip("0").rstrip(".") or "0"


def point(p):
    return f"{number(p.x)} {number(p.y)}"


def svg_path(drawing):
    commands, previous = [], None
    for item in drawing["items"]:
        kind = item[0]
        if kind == "re":
            r = item[1]
            commands.append(f"M{point(r.tl)} L{point(r.tr)} L{point(r.br)} L{point(r.bl)} Z")
            previous = None
            continue
        if kind not in ("l", "c"):
            raise ValueError(f"Unsupported vector segment: {kind}")
        start = item[1]
        if previous is None or abs(previous.x - start.x) + abs(previous.y - start.y) > 0.001:
            commands.append(f"M{point(start)}")
        if kind == "l":
            commands.append(f"L{point(item[2])}")
        else:
            commands.append(f"C{point(item[2])} {point(item[3])} {point(item[4])}")
        previous = item[-1]
    fill = "#" + "".join(f"{round(v * 255):02x}" for v in drawing["fill"])
    rule = "evenodd" if drawing["even_odd"] else "nonzero"
    opacity = drawing.get("fill_opacity", 1)
    return f'<path fill="{fill}" fill-rule="{rule}" opacity="{opacity}" d="{" ".join(commands)}"/>'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--output", type=Path, default=Path("public/assets/doodles/nescafe-board"))
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    qa = Path("tmp/ai-doodles")
    qa.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(args.source)
    page = doc[0]
    drawings = page.get_drawings()
    scale = page.rect.width / 1800
    manifest = []
    thumbnails = []
    for slug, label, region in REGIONS:
        bounds = fitz.Rect(*(v * scale for v in region))
        selected = [d for d in drawings if d["fill"] is not None and (
            bounds.contains(d["rect"]) or (
                d["rect"].get_area() > 0
                and (bounds & d["rect"]).get_area() / d["rect"].get_area() > 0.75
                and d["rect"].width < bounds.width * 1.4
                and d["rect"].height < bounds.height * 1.4
            )
        )]
        if slug in SEQUENCES:
            first, last = SEQUENCES[slug]
            extra = EXTRA_SEQUENCES.get(slug, set())
            selected = [d for d in drawings if d["fill"] is not None and (
                first <= d["seqno"] <= last or d["seqno"] in extra
            )]
        if not selected:
            raise ValueError(f"No vector paths for {slug}")
        tight = fitz.Rect(selected[0]["rect"])
        for drawing in selected[1:]:
            tight |= drawing["rect"]
        tight += (-1.5, -1.5, 1.5, 1.5)
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{number(tight.x0)} {number(tight.y0)} '
               f'{number(tight.width)} {number(tight.height)}" width="{math.ceil(tight.width * 8)}" '
               f'height="{math.ceil(tight.height * 8)}">' + "".join(svg_path(d) for d in selected) + "</svg>")
        (args.output / f"{slug}.svg").write_text(svg, encoding="utf-8")
        manifest.append({"slug": slug, "label": label, "aspect": round(tight.height / tight.width, 4),
                         "sourceBounds": list(tight), "paths": len(selected)})
        preview_doc = fitz.open(stream=svg.encode(), filetype="svg")
        pix = preview_doc[0].get_pixmap(matrix=fitz.Matrix(2, 2), alpha=True)
        thumb = Image.frombytes("RGBA", (pix.width, pix.height), pix.samples)
        thumb.thumbnail((145, 130))
        thumbnails.append((label, thumb))
    (args.output / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    sheet = Image.new("RGB", (6 * 180, math.ceil(len(thumbnails) / 6) * 175), "#f5ebdf")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
    for i, (label, thumb) in enumerate(thumbnails):
        x, y = (i % 6) * 180, (i // 6) * 175
        sheet.paste(thumb, (x + (180 - thumb.width) // 2, y + (140 - thumb.height) // 2), thumb)
        draw.text((x + 90, y + 150), label, font=font, fill="#3a1d18", anchor="mt")
    sheet.save(qa / "extracted-contact-sheet.png")
    print(f"Extracted {len(manifest)} original SVGs to {args.output}")


if __name__ == "__main__":
    main()

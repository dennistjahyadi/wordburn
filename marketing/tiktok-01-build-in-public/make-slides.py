#!/usr/bin/env python3
"""Render the build-in-public carousel: 1080 × 1920 PNGs from copy + stock.

Run from anywhere:  python3 marketing/tiktok-01-build-in-public/make-slides.py
Reads slides.json beside it, backgrounds from stock/, the app's own fonts from
assets/fonts, and writes slides/NN.png plus contact.jpg for a quick look.

Safe zones follow the app's own safeZoneUnion() on a 1080 × 1920 frame:
211 px top, 422 px bottom, 54 px left, 259 px right. Text never crosses them.
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
FONTS = os.path.join(ROOT, "assets", "fonts")

W, H = 1080, 1920
SAFE_TOP, SAFE_BOTTOM, SAFE_LEFT, SAFE_RIGHT = 211, 422, 54, 259
X0 = 84                      # text left edge, inside the safe left
X1 = W - SAFE_RIGHT - 20     # text right edge, clear of the rail
TEXT_W = X1 - X0

YELLOW = (255, 224, 61)
WHITE = (255, 255, 255)
DIM = (200, 196, 190)
INK = (15, 14, 13)


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


F_KICKER = font("BeVietnamPro-SemiBold.ttf", 34)
F_TITLE = font("BeVietnamPro-ExtraBold.ttf", 84)
F_TITLE_BIG = font("BeVietnamPro-ExtraBold.ttf", 100)
F_BODY = font("BeVietnamPro-Medium.ttf", 44)
F_STAT = font("BeVietnamPro-ExtraBold.ttf", 72)
F_STAT_LABEL = font("BeVietnamPro-Medium.ttf", 40)
F_FOOT = font("BeVietnamPro-Medium.ttf", 32)
F_HANDLE = font("BeVietnamPro-ExtraBold.ttf", 60)


def cover(im, w, h, focus=0.5):
    """Scale to cover w × h, crop around a vertical focus (0 top … 1 bottom)."""
    im = im.convert("RGB")
    s = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = (im.width - w) // 2
    y = round((im.height - h) * focus)
    return im.crop((x, y, x + w, y + h))


def backdrop(path, darken=0.62, focus=0.5, blur=0):
    im = cover(Image.open(path), W, H, focus)
    if blur:
        im = im.filter(ImageFilter.GaussianBlur(blur))
    # Flat darkening so white type holds anywhere, plus a heavier top band
    # where the copy sits and a foot for the caption TikTok draws.
    shade = Image.new("L", (W, H), int(255 * darken))
    grad = Image.linear_gradient("L").resize((W, H))          # 0 top → 255 bottom
    top = grad.point(lambda v: int(255 * (0.25 * (1 - v / 255))))
    foot = grad.point(lambda v: int(255 * (0.35 * max(0, (v - 170)) / 85)))
    from PIL import ImageChops
    shade = ImageChops.add(shade, top)
    shade = ImageChops.add(shade, foot)
    black = Image.new("RGB", (W, H), INK)
    return Image.composite(black, im, shade)


def tokens(text):
    """Words, with {braced} runs marked as accent."""
    out = []
    for raw in text.split(" "):
        if not raw:
            continue
        # "{word}" or "{word}." — the brace may sit before trailing punctuation.
        accent = raw.startswith("{") and "}" in raw
        out.append((raw.replace("{", "").replace("}", ""), accent))
    return out


def wrap(text, fnt, width):
    lines, line, wlen = [], [], 0
    space = fnt.getlength(" ")
    for word, accent in tokens(text):
        wl = fnt.getlength(word)
        if line and wlen + space + wl > width:
            lines.append(line)
            line, wlen = [], 0
        line.append((word, accent))
        wlen += wl + (space if wlen else 0)
    if line:
        lines.append(line)
    return lines


def draw_rich(d, x, y, text, fnt, width, color=WHITE, leading=1.18):
    """Draw wrapped text with {accent} words in yellow. Returns the next y."""
    lh = round(fnt.size * leading)
    space = fnt.getlength(" ")
    for line in wrap(text, fnt, width):
        cx = x
        for word, accent in line:
            d.text((cx, y), word, font=fnt, fill=YELLOW if accent else color)
            cx += fnt.getlength(word) + space
        y += lh
    return y


def dash(d, y):
    d.rounded_rectangle((X0, y, X0 + 52, y + 8), radius=4, fill=YELLOW)


def footer(d, handle, n, total):
    y = H - SAFE_BOTTOM - 60
    d.text((X0, y), handle, font=F_FOOT, fill=DIM)
    label = f"{n}/{total}"
    d.text((X1 - F_FOOT.getlength(label), y), label, font=F_FOOT, fill=DIM)


def render(slide, n, total, handle):
    kind = slide.get("kind", "text")
    bg = slide.get("bg")
    if bg:
        im = backdrop(os.path.join(HERE, "stock", bg), slide.get("darken", 0.62),
                      slide.get("focus", 0.5), slide.get("blur", 0))
    else:
        im = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(im)

    y = SAFE_TOP + 120
    dash(d, y)
    y += 48
    if slide.get("kicker"):
        d.text((X0, y), slide["kicker"], font=F_KICKER, fill=YELLOW)
        y += 70

    if kind == "hook":
        y = draw_rich(d, X0, y, slide["title"], F_TITLE_BIG, TEXT_W, leading=1.1)
        if slide.get("body"):
            y += 40
            draw_rich(d, X0, y, slide["body"], F_BODY, TEXT_W, color=DIM)

    elif kind == "text":
        y = draw_rich(d, X0, y, slide["title"], F_TITLE, TEXT_W, leading=1.1)
        y += 36
        for para in slide.get("body", []):
            y = draw_rich(d, X0, y, para, F_BODY, TEXT_W, color=WHITE)
            y += 26

    elif kind == "bullets":
        y = draw_rich(d, X0, y, slide["title"], F_TITLE, TEXT_W, leading=1.1)
        y += 36
        for item in slide["items"]:
            d.rounded_rectangle((X0, y + 20, X0 + 22, y + 30), radius=5, fill=YELLOW)
            y = draw_rich(d, X0 + 48, y, item, F_BODY, TEXT_W - 48)
            y += 18
        if slide.get("note"):
            y += 24
            draw_rich(d, X0, y, slide["note"], F_BODY, TEXT_W, color=DIM)

    elif kind == "stats":
        y = draw_rich(d, X0, y, slide["title"], F_TITLE, TEXT_W, leading=1.1)
        y += 30
        for value, label in slide["stats"]:
            d.text((X0, y), value, font=F_STAT, fill=YELLOW)
            vx = X0 + F_STAT.getlength(value) + 24
            d.text((vx, y + 26), label, font=F_STAT_LABEL, fill=WHITE)
            y += 96
        if slide.get("note"):
            y += 20
            draw_rich(d, X0, y, slide["note"], F_BODY, TEXT_W, color=DIM)

    elif kind == "product":
        # Title, then the app's own screenshot cropped to the phone and set to
        # the left with the bullets beside it.
        y = draw_rich(d, X0, y, slide["title"], F_TITLE, TEXT_W, leading=1.1)
        y += 40
        shot = Image.open(os.path.join(ROOT, slide["shot"]))
        l, t, r, b = slide["crop"]
        shot = shot.crop((l, t, r, b))
        ph = slide.get("shot_height", 700)
        shot = shot.resize((round(shot.width * ph / shot.height), ph), Image.LANCZOS)
        # Rounded corners + a hairline so it reads as a device on the dark frame.
        mask = Image.new("L", shot.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, shot.width - 1, shot.height - 1),
                                               radius=28, fill=255)
        im.paste(shot, (X0, y), mask)
        d.rounded_rectangle((X0, y, X0 + shot.width - 1, y + shot.height - 1),
                            radius=28, outline=(70, 68, 64), width=2)
        bx = X0 + shot.width + 40
        by = y + 10
        for item in slide["items"]:
            d.rounded_rectangle((bx, by + 18, bx + 20, by + 28), radius=5, fill=YELLOW)
            by = draw_rich(d, bx + 40, by, item, F_STAT_LABEL, X1 - bx - 40)
            by += 22
        y += shot.height + 40
        if slide.get("note"):
            draw_rich(d, X0, y, slide["note"], F_BODY, TEXT_W, color=DIM)

    elif kind == "cta":
        y = draw_rich(d, X0, y, slide["title"], F_TITLE_BIG, TEXT_W, leading=1.1)
        y += 36
        for para in slide.get("body", []):
            y = draw_rich(d, X0, y, para, F_BODY, TEXT_W)
            y += 26
        y += 30
        d.text((X0, y), handle, font=F_HANDLE, fill=YELLOW)

    footer(d, handle, n, total)
    return im


def main():
    spec = json.load(open(os.path.join(HERE, "slides.json")))
    out = os.path.join(HERE, "slides")
    os.makedirs(out, exist_ok=True)
    slides = spec["slides"]
    handle = spec["handle"]
    rendered = []
    for i, s in enumerate(slides, 1):
        im = render(s, i, len(slides), handle)
        path = os.path.join(out, f"{i:02d}.png")
        im.save(path, optimize=True)
        rendered.append(im)
        print("wrote", os.path.relpath(path, ROOT))
    # Contact sheet for a one-glance review.
    tw, th = 360, 640
    sheet = Image.new("RGB", (tw * 4, th * ((len(rendered) + 3) // 4)), INK)
    for i, im in enumerate(rendered):
        sheet.paste(im.resize((tw, th), Image.LANCZOS), ((i % 4) * tw, (i // 4) * th))
    sheet.save(os.path.join(HERE, "contact.jpg"), quality=85)


if __name__ == "__main__":
    sys.exit(main())

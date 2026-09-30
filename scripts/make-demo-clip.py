#!/usr/bin/env python3
"""
The demo clip: 1080 x 1920 of speech over footage this project owns outright.

Every screenshot in a Play listing has a video inside it, and that video cannot
come from a stock library. Two separate reasons, either one fatal:

  * Licence. Pexels, Pixabay, Mixkit and Coverr all let you use a clip
    commercially, and none of them collect a model release. A recognisable face
    in a store listing is an advertisement for a product, which is exactly the
    use a release exists to cover. STORE-ASSETS.md already bans third-party
    footage from the listing; this script is what replaces it.
  * Audio. Pexels publishes every video without an audio track, as policy, and
    the rest of the free libraries are b-roll. A captions app cannot test on
    silence.

So the footage is generated and the voice is `say`. Nothing here is anybody
else's: three defocused warm plates drawn in Pillow, drifted and crossfaded by
ffmpeg, under a macOS system voice reading a script written for this repo.

**No type is drawn in the frame.** Captions are the only words on screen, which
is the whole subject of the listing, and a preset in `upperMiddle` would collide
with anything set across the top anyway.

    python3 scripts/make-demo-clip.py             # 0:20, the listing clip
    python3 scripts/make-demo-clip.py long        # 1:15, for the slow screens
    python3 scripts/make-demo-clip.py podcast     # ~6:00, for auto clip
    adb push test-clips/demo/demo-1080x1920.mp4 /sdcard/Movies/

Two lengths because they answer different questions. The short one is what the
store screenshots are taken on. The long one is the only way to photograph
Processing at all: on a fast machine `base.en` finishes twenty seconds of clean
speech between two `adb exec-out screencap` calls, so the progress bar the
listing needs to show does not exist long enough to capture.

Needs ffmpeg and macOS `say`.
"""
import random
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "test-clips" / "demo"

W, H = 1080, 1920
FPS = 30
VOICE = "Samantha"
RATE = 168
FADE = 1.2  # crossfade between plates, seconds

# What the voice says. Short-form creator advice, because that is who the app is
# for and a transcript of marketing copy inside the product's own screenshot
# reads as a lie. Deliberately plain English with one number in it: `emphasis.ts`
# scores numbers, so "twenty percent" gives the style presets something to mark.
SHORT = (
    "Here's the part nobody tells you about your first brand deal. "
    "You're going to want to say yes to the first number they send. Don't. "
    "Take one day. Send them your rate sheet, your last three videos, "
    "and the numbers those videos actually pulled. "
    "Then ask for twenty percent more than you think it's worth. "
    "The worst they can say is no, and no costs you nothing."
)

LONG = SHORT + (
    " Here's what goes in the rate sheet, because mine was wrong for a year. "
    "One line per deliverable. Not a package, a line. "
    "A video on your feed, a set of stories, and the right to run it as an ad "
    "are three different things, and the third one is where the money is. "
    "Put a number on usage. Thirty days, ninety days, one year, paid media or "
    "organic only. If you hand over a flat fee with no usage terms, you have "
    "just sold a year of ad inventory for the price of one post. "
    "Then put your audience numbers next to it. Not followers. "
    "Watch time, saves, and the share of your audience in the country they "
    "actually sell in. That is the number that ends the negotiation, "
    "and it is the one almost nobody sends."
)

# The same talk three times over. Nothing reads it — it exists so that a run
# takes minutes rather than seconds, which is the only way to photograph the
# Transcribing stage, and to have something to point the checkpointing at.
XLONG = " ".join([LONG] * 3)

# A six-minute episode for auto clip, which refuses anything under five. It is
# written to have moments in it: an intro and an outro the scorer should skip,
# talk that goes nowhere in particular, and four passages that open with a hook
# or a question and land on a point. `[[slnc]]` is `say`'s own pause, so the
# silences between passages are real silence for Remove dead air to find.
_PAUSE = " [[slnc 1300]] "
_TALK = [
    "So we had the lights set up, the camera, the microphone, all of it.",
    "Honestly the first few weeks were mostly about getting the schedule right.",
    "My co-host had a lot of opinions about the colour grading, as usual.",
    "We went through three editors before we found one we liked.",
    "There was a lot of back and forth about the thumbnails.",
    "Some weeks we recorded on a Monday, some weeks on a Friday.",
]
_MOMENTS = [
    "Here's the thing nobody tells you about pricing. You are almost always "
    "charging too little. When we doubled our rate, we lost two clients and "
    "gained five. A low price tells people you are not sure you are worth it.",
    "What if the biggest mistake you are making is working on too many things "
    "at once? We had six projects running last spring and every one was late. "
    "We cut down to two, and both shipped early. Focus is a decision you make "
    "every morning.",
    "The truth is that consistency beats talent. The most talented person I "
    "know posts twice a year. The most consistent posts every day, and she now "
    "runs a studio of twelve people.",
    "Why do people burn out? Because they never decide what done looks like. "
    "Write down what finished means before you start, and stop when you get "
    "there.",
]
PODCAST = _PAUSE.join(
    ["Welcome back to the show, and thanks for watching. Today we are talking "
     "about building a creative business from nothing."]
    + [part for moment in _MOMENTS for part in (_TALK + _TALK[::-1] + [moment])]
    + _TALK
    + ["That's all for today. Thanks for watching, subscribe, and see you next "
       "week."]
)

SCRIPTS = {"short": SHORT, "long": LONG, "xlong": XLONG, "podcast": PODCAST}

# Warm, low-contrast, and dark enough that white captions hold without a plate
# and light enough that the dark-on-yellow box preset does too. Drawn at 1.5x so
# the drift below has somewhere to travel.
PLATES = [
    ((28, 22, 18), [((0.30, 0.28), 0.62, (196, 132, 54)), ((0.78, 0.66), 0.52, (92, 58, 120))],
     (150, 108, 58)),
    ((20, 20, 26), [((0.68, 0.30), 0.58, (70, 116, 168)), ((0.26, 0.74), 0.60, (188, 96, 72))],
     (104, 122, 156)),
    ((26, 20, 20), [((0.44, 0.22), 0.66, (214, 158, 72)), ((0.60, 0.82), 0.54, (58, 84, 110))],
     (158, 118, 66)),
]

OVER = 1.5  # plate is rendered this much larger than the frame


def bokeh(size: tuple[int, int], tint, seed: int) -> Image.Image:
    """Out-of-focus highlights.

    A blurred colour field on its own reads as a gradient wallpaper, not as
    footage. Discs with a brighter rim are what a fast lens does to a point of
    light behind the subject, and they are the cue that makes the eye accept the
    frame as a defocused shot of something.
    """
    layer = Image.new("RGB", size, (0, 0, 0))
    d = ImageDraw.Draw(layer)
    rng = random.Random(seed)
    for _ in range(16):
        r = rng.uniform(0.03, 0.11) * size[0]
        # Biased to the top of the frame. Both caption bands sit below the
        # middle or across it, and a cluster of bright discs under a caption is
        # the one thing that makes white type on video hard to read.
        cx = rng.uniform(0, size[0])
        cy = rng.uniform(0, size[1]) ** 1.6 / size[1] ** 0.6
        k = rng.uniform(0.25, 1.0)
        body = tuple(round(c * k * 0.55) for c in tint)
        rim = tuple(round(c * k) for c in tint)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=body, outline=rim,
                  width=max(2, round(r * 0.13)))
    return layer.filter(ImageFilter.GaussianBlur(size[0] * 0.012))


def plate(ground, blobs, tint, seed: int, path: Path) -> None:
    """One defocused frame: soft colour masses on a warm ground, plus highlights.

    The colour field is drawn small and scaled up rather than drawn large and
    blurred — a Gaussian wide enough to defocus a 2880 px frame costs seconds per
    plate, and the result is identical once nothing in it has an edge. The
    highlights go on at full size, where their rims survive.
    """
    small = 180
    img = Image.new("RGB", (small, round(small * H / W)), ground)
    d = ImageDraw.Draw(img)
    for (cx, cy), radius, colour in blobs:
        # Concentric ellipses rather than a radial gradient, which Pillow lacks.
        for step in range(40, 0, -1):
            k = (41 - step) / 41
            r = step / 40 * radius * small
            fill = tuple(round(ground[i] + (colour[i] - ground[i]) * k * 0.55) for i in range(3))
            d.ellipse([cx * img.width - r, cy * img.height - r * 1.15,
                       cx * img.width + r, cy * img.height + r * 1.15], fill=fill)
    img = img.filter(ImageFilter.GaussianBlur(9))

    full = (round(W * OVER), round(H * OVER))
    field = img.resize(full, Image.LANCZOS)
    # Added, not blended: a highlight is light arriving on top of the scene, and
    # alpha-blending one would darken the field wherever a disc is dim.
    ImageChops.add(field, bokeh(full, tint, seed)).save(path)


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True, capture_output=True)


def duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(path)],
        check=True, capture_output=True, text=True)
    return float(out.stdout.strip())


def main() -> None:
    for tool in ("ffmpeg", "say"):
        if subprocess.run(["which", tool], capture_output=True).returncode:
            sys.exit(f"{tool} is missing")

    variant = sys.argv[1] if len(sys.argv) > 1 else "short"
    if variant not in SCRIPTS:
        sys.exit(f"unknown variant {variant!r} (expected: {', '.join(SCRIPTS)})")
    script = SCRIPTS[variant]
    suffix = "" if variant == "short" else f"-{variant}"
    clip = OUT / f"demo{suffix}-1080x1920.mp4"

    OUT.mkdir(parents=True, exist_ok=True)
    aiff, voice = OUT / "voice.aiff", OUT / "voice.m4a"

    run(["say", "-v", VOICE, "-r", str(RATE), "-o", str(aiff), script])
    run(["ffmpeg", "-y", "-i", str(aiff), "-c:a", "aac", "-b:a", "128k",
         "-ar", "44100", "-ac", "1", str(voice)])
    aiff.unlink()

    # A beat of room at each end. A clip that starts on the first phoneme gives
    # the editor nothing to show paused, and VAD wants a little silence anyway.
    total = duration(voice) + 1.6
    n = len(PLATES)
    # n plates crossfading n-1 times, each overlap eating FADE seconds.
    each = (total + (n - 1) * FADE) / n

    paths = []
    for i, (ground, blobs, tint) in enumerate(PLATES):
        p = OUT / f"plate{i}.png"
        plate(ground, blobs, tint, seed=i, path=p)
        paths.append(p)

    args = ["ffmpeg", "-y"]
    for p in paths:
        args += ["-loop", "1", "-t", f"{each:.3f}", "-i", str(p)]
    args += ["-i", str(voice)]

    # Slow drift: alternate plates pan the opposite way, so the cut never reads
    # as one continuous move and never as a hard stop.
    chain = []
    for i in range(n):
        sign = 1 if i % 2 == 0 else -1
        travel = (OVER - 1) * W
        x = f"(iw-{W})/2+{sign}*{travel / 2:.1f}*(1-2*t/{each:.3f})"
        y = f"(ih-{H})/2+{-sign}*{travel / 2:.1f}*(1-2*t/{each:.3f})"
        chain.append(
            f"[{i}:v]fps={FPS},crop={W}:{H}:'{x}':'{y}',setpts=PTS-STARTPTS[v{i}]")

    prev, offset = "v0", each - FADE
    for i in range(1, n):
        out = f"x{i}"
        chain.append(f"[{prev}][v{i}]xfade=transition=fade:duration={FADE}:"
                     f"offset={offset:.3f}[{out}]")
        prev, offset = out, offset + each - FADE

    # Grain last, over the blend, so it does not cross-dissolve with itself.
    chain.append(f"[{prev}]noise=alls=7:allf=t+u,format=yuv420p[vout]")

    args += ["-filter_complex", ";".join(chain), "-map", "[vout]", "-map", f"{n}:a",
             "-c:v", "libx264", "-preset", "medium", "-crf", "20",
             "-profile:v", "high", "-pix_fmt", "yuv420p", "-r", str(FPS),
             "-c:a", "copy", "-shortest", "-movflags", "+faststart", str(clip)]
    run(args)
    voice.unlink()

    for p in paths:
        p.unlink()

    print(f"{clip.relative_to(ROOT)}  {W} x {H}  {duration(clip):.1f}s  "
          f"{clip.stat().st_size / 1e6:.1f} MB")
    print(f"words: {len(script.split())}")


if __name__ == "__main__":
    main()

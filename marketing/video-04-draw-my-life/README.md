# Video 04 — Draw my life

A 52-second "draw my life" ad (9:16, 30 fps). Fourteen generated doodles are
built up one after another to an ElevenLabs read of [script.md](script.md). The
composition is `drawmylife` in `marketing/remotion`
(`src/drawmylife/`).

```sh
./render.sh               # → marketing/remotion/out/drawmylife.mp4
./render.sh --scale=0.5   # → out/drawmylife-preview.mp4, ~30 s
./render.sh --stage-only  # rebuild public/drawmylife only
./render.sh --no-captions # → out/drawmylife-nocaptions.mp4
```

`drawmylife-nocaptions` is the same ad with no subtitles. The drawings take
the band the subtitles used and run down to the bottom safe line, so they come
out up to about 15% larger. Everything written into the drawings (the pill
words, "pops", the name and the store line) is still there.

The inputs are in `references/ads/` and are not in git: the doodles
(`…-1.png` to `…-14.png`, numbered in the order they were generated, not in
script order) and exactly one mp3. `render.sh` stages them into
`public/drawmylife/`, which is gitignored.

## How it is built

- **`pieces.py` cuts each doodle into the things in it**: the character, the
  phone, the clock, each burst of lines. Ink within ~5 px of other ink is one
  object, its holes are filled, small objects join their nearest neighbour, and
  every painted pixel belongs to exactly one piece. It also whitens the
  generators' off-white paper tone, which otherwise shows as a grey card on the
  page.
- **`Drawing.tsx` pops the pieces on one by one**, biggest first (the last page
  goes top-down so its logo comes before the name), each with a small
  overshoot. Then the original fades over them so the page settles on the exact
  image. There is no pen and no line-by-line drawing; Dennis turned that down
  on 2026-10-03.
- **Pages change with `@remotion/transitions` `slide`** (14 frames, from the
  right), which reads as a pan along a whiteboard. Each pan lands just before
  that scene's first word.
- **The beats that make a claim get extras** (`Extras.tsx`):
  - the real editor (scene 7) and the real style sheet (scene 10), taped on
  - "Wordbern" → "Wordburn" written into the drawn pills
  - "pops" written into the speech bubble
  - a marker circle drawn round each "no" with `@remotion/paths`
  - the name and the store line written into the last page
- **Subtitles use the app's own Box highlight** (`Captions.tsx`): ink words,
  with the spoken word on the yellow box. They sit above the bottom 22% that
  TikTok covers. "pops" grows when it is said.

Word timings are in `words.drawmylife.json`, measured once with faster-whisper
(small.en), as for video 03. Two words were corrected by hand: "Time" →
"Timed" and "GoPro" → "Go Pro".

## Plugins

| Package | Used for |
|---|---|
| `@remotion/transitions` | the whiteboard pan between pages |
| `@remotion/paths` | `evolvePath` for the hand-drawn circles |

## Before posting

- **The store line is our own type, not Google's badge.** Before running it as
  a paid ad, put the official "Get it on Google Play" badge over the last
  page's outline.
- **The screenshots come from the 2026-09-30 listing captures**, with a bokeh
  demo clip. They still match the app. Recapture them on the A54 with a real
  talking clip when you can (see `image-prompts.md`).
- **The Play listing has to be live**, as for videos 02 and 03.
- **Changing a doodle:** replace the file in `references/ads` with the same
  number and run `./render.sh`. If the voice changes, re-measure the word
  timings and check `PHRASE_SIZES` and `SCENES` in `src/drawmylife/script.ts`.

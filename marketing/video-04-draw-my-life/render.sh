#!/usr/bin/env bash
# Video 04, draw my life: stage everything the composition reads, then render.
#
#   ./render.sh               full size, out/drawmylife.mp4
#   ./render.sh --scale=0.5   half size preview, out/drawmylife-preview.mp4
#   ./render.sh --stage-only  rebuild public/drawmylife and stop
#   ./render.sh --no-captions the same ad with no subtitles,
#                             out/drawmylife-nocaptions.mp4
#
# Inputs (not in git): references/ads/*.png, the doodles, and the ElevenLabs
# mp3 beside them. public/ is gitignored, so this is the only way it is made.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
PUB=marketing/remotion/public/drawmylife
mkdir -p "$PUB"

shopt -s nullglob
voices=(references/ads/*.mp3)
if [ ${#voices[@]} -ne 1 ]; then
  echo "expected exactly one mp3 in references/ads, found ${#voices[@]}" >&2
  exit 1
fi
cp "${voices[0]}" "$PUB/voice.mp3"

python3 marketing/video-04-draw-my-life/pieces.py

python3 - <<'EOF'
from PIL import Image
D = 'marketing/remotion/public/drawmylife'
for src, box, name in [('04-editor', (0, 200, 1440, 2200), 'shot-editor'),
                       ('05-style', (0, 1420, 1440, 2640), 'shot-style')]:
    im = Image.open(f'store/shots/listing/{src}.png').convert('RGB').crop(box)
    im = im.resize((900, round(im.height * 900 / im.width)), Image.LANCZOS)
    im.save(f'{D}/{name}.jpg', quality=90)
EOF

[ "${1:-}" = "--stage-only" ] && exit 0

cd marketing/remotion
if [ "${1:-}" = "--no-captions" ]; then
  npx remotion render drawmylife-nocaptions out/drawmylife-nocaptions.mp4 --concurrency=6
elif [[ "${1:-}" == --scale=* ]]; then
  npx remotion render drawmylife out/drawmylife-preview.mp4 "$1" --concurrency=6
else
  npx remotion render drawmylife out/drawmylife.mp4 --concurrency=6
fi

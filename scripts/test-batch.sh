#!/usr/bin/env bash
#
# The batch's instrumented test: two copies of a 30-second clip through the real
# queue on a device or emulator, then a check that two captioned exports landed
# in the gallery.
#
#   scripts/test-batch.sh <clip.mp4> [adb serial]
#
# Needs the debug build (it uses `run-as` and a __DEV__-only route) running
# against Metro, the app past Welcome, and a batch not already in progress.
# English, so the downloaded model is not involved.
set -euo pipefail

CLIP="${1:?usage: scripts/test-batch.sh <clip.mp4> [serial]}"
SERIAL="${2:-${ANDROID_SERIAL:-}}"
ADB=(adb); [ -n "$SERIAL" ] && ADB=(adb -s "$SERIAL")
PKG=com.wordburn.app
NAME="batchtest$(date +%s).mp4"
STEM="${NAME%.mp4}"
TIMEOUT_S=600

count_exports() {
  "${ADB[@]}" shell content query --uri content://media/external/video/media \
    --projection _display_name 2>/dev/null | grep -c "_display_name=${STEM}_captioned" || true
}

echo "==> Copying the clip into the app's cache"
"${ADB[@]}" push "$CLIP" "/data/local/tmp/$NAME" >/dev/null
"${ADB[@]}" shell "run-as $PKG cp /data/local/tmp/$NAME cache/$NAME"
"${ADB[@]}" shell rm "/data/local/tmp/$NAME"

echo "==> Queueing two clips"
"${ADB[@]}" shell am start -a android.intent.action.VIEW -d "wordburn://dev/batch-test?clip=$NAME" "$PKG" >/dev/null

started=$(date +%s)
while :; do
  found=$(count_exports)
  if [ "$found" -ge 2 ]; then break; fi
  if [ $(( $(date +%s) - started )) -gt $TIMEOUT_S ]; then
    echo "FAIL: $found of 2 exports after ${TIMEOUT_S}s" >&2
    "${ADB[@]}" shell "run-as $PKG cat files/batch.json" >&2 || true
    exit 1
  fi
  sleep 5
done

echo "PASS: 2 exports in the gallery after $(( $(date +%s) - started ))s"
"${ADB[@]}" shell content query --uri content://media/external/video/media \
  --projection _display_name:relative_path:duration | grep "${STEM}_captioned"

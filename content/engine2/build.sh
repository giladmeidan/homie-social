#!/usr/bin/env bash
# homie Engine 2 · build one reel.
#   bash build.sh reels/<id> <output-name>                    ->  export/<output-name>.mp4
#   E2_EXPORT_DIR=/dir bash build.sh /abs/reel/folder <name>  ->  /dir/<name>.mp4   (what scripts/render-batch.py does)
# Needs `bash tools_setup.sh` once on the machine. Prints a line starting with FAIL and exits 1 when a step fails.
set -euo pipefail
R=${1%/}; NAME=${2:-$(basename "$R")}
HERE="$(cd "$(dirname "$0")" && pwd)"; cd "$HERE"
OUT="${E2_EXPORT_DIR:-$HERE/export}"
HF="$HERE/node_modules/.bin/hyperframes"
[ -x "$HF" ] || { echo "FAIL setup: Engine 2 is not set up on this machine. Run: bash content/engine2/tools_setup.sh"; exit 1; }
[ -f "$R/index.html" ] || { echo "FAIL setup: $R/index.html not found"; exit 1; }
export HYPERFRAMES_NO_TELEMETRY=1
# The pages rendered here are this repo's own files, so Chrome runs without its sandbox. GitHub's Ubuntu
# runners and root containers cannot start the sandbox anyway.
export HYPERFRAMES_CHROME_SANDBOX="${HYPERFRAMES_CHROME_SANDBOX:-0}"
# Use the machine's own Chrome (GitHub's runners and the cloud sandboxes have one) instead of a download.
if [ -z "${PUPPETEER_EXECUTABLE_PATH:-}" ]; then
  for c in google-chrome google-chrome-stable chromium chromium-browser; do
    if command -v "$c" >/dev/null 2>&1; then PUPPETEER_EXECUTABLE_PATH="$(command -v "$c")"; export PUPPETEER_EXECUTABLE_PATH; break; fi
  done
fi
bash tools_sync.sh "$R"
# the page needs its audio file to exist before the cues can be read from it
[ -f "$R/assets/mix.wav" ] || ffmpeg -y -loglevel error -f lavfi -i anullsrc=r=44100:cl=stereo -t 1 "$R/assets/mix.wav"
python3 audio/make_audio.py "$R"
( cd "$R" && "$HF" check --json > build/check.json ) || { python3 tools_check_report.py "$R/build/check.json" || true; echo "FAIL check"; exit 1; }
python3 tools_check_report.py "$R/build/check.json" || { echo "FAIL check"; exit 1; }
mkdir -p "$OUT"
( cd "$R" && "$HF" render -o "$OUT/$NAME.part.mp4" --fps 30 --quiet )
mv "$OUT/$NAME.part.mp4" "$OUT/$NAME.mp4"
python3 tools_postcheck.py "$OUT/$NAME.mp4" "$R/build/export.json"
echo "done -> $OUT/$NAME.mp4"

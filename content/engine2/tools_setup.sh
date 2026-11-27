#!/usr/bin/env bash
# homie Engine 2 · one-time setup on a machine (the render workflow runs it when a waiting reel says "engine": "v2").
#   bash tools_setup.sh
# Installs the pinned packages and recreates the shared base files that are not committed because they are
# binary or copied from a package: base/fonts/*.woff2, base/gsap.min.js, base/SplitText.min.js, base/grain.png.
# Needs: Node 22 or newer, Python 3 with pip, ffmpeg, Chrome. Safe to run again.
set -euo pipefail
cd "$(dirname "$0")"
export HYPERFRAMES_NO_TELEMETRY=1 PUPPETEER_SKIP_DOWNLOAD=1
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 22 ] || { echo "FAIL setup: Engine 2 needs Node 22 or newer, found $(node -v)"; exit 1; }
if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
mkdir -p base/fonts
cp node_modules/gsap/dist/gsap.min.js node_modules/gsap/dist/SplitText.min.js base/
for f in fredoka-hebrew-600-normal fredoka-latin-600-normal; do cp "node_modules/@fontsource/fredoka/files/$f.woff2" base/fonts/; done
for f in rubik-hebrew-500-normal rubik-hebrew-700-normal rubik-latin-500-normal rubik-latin-700-normal; do cp "node_modules/@fontsource/rubik/files/$f.woff2" base/fonts/; done
# pip: a plain install on the build server; cloud sandboxes need --break-system-packages
pipi() { python3 -m pip install -q "$@" 2>/dev/null || python3 -m pip install -q --break-system-packages "$@"; }
pipi -r requirements.txt
pipi --no-deps tinysoundfont==0.3.7   # --no-deps: its pyaudio dependency is only for live playback and needs system headers
python3 - <<'EOF'
# static paper grain tile, seeded so every setup gives the same file
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
n = gaussian_filter(np.random.RandomState(7).normal(0, 1, (512, 512)), 0.7)
n = (n - n.min()) / (n.max() - n.min())
a = (np.clip((n - 0.5) * 2.2 + 0.5, 0, 1) * 255).astype('uint8')
Image.merge('LA', (Image.fromarray(np.full((512, 512), 20, 'uint8')), Image.fromarray(a))).save('base/grain.png')
EOF
node_modules/.bin/hyperframes telemetry disable >/dev/null 2>&1 || true
command -v ffmpeg >/dev/null 2>&1 || { echo "FAIL setup: ffmpeg not found"; exit 1; }
python3 audio/make_audio.py --check
echo "setup done"

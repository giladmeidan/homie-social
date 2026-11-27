#!/usr/bin/env bash
# Copies the shared base (fonts, GSAP, helpers, grain) into a reel folder, because a HyperFrames
# project only reads files inside its own folder.   usage: bash tools_sync.sh reels/<id>
set -e
R=$1; mkdir -p "$R/assets/base"
cp -r base/fonts base/gsap.min.js base/SplitText.min.js base/e2.js base/grain.png "$R/assets/base/"

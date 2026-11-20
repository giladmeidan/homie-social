#!/usr/bin/env bash
# Rebuilds one reel from source. Needs: python3 + playwright (chromium), numpy, scipy, ffmpeg.
# Run from this folder:  bash build.sh r19 reel-19-suspicious-friends   (or: r20 reel-20-friday-dinner)
set -e
R=$1; NAME=$2
python3 render.py $R                 # scenes/<R>_a..d.mp4 + <R>_events.json
python3 audio.py $R                  # audio/<R>.wav
if [ -f ${R}_voice.json ]; then python3 voice.py $R; fi   # episode has window.VOICE -> ElevenLabs voiceover mixed in
ls scenes/${R}_*.mp4 | sort | sed "s/^/file '/; s/$/'/" > ${R}_list.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i ${R}_list.txt -c copy ${R}_silent.mp4
ffmpeg -y -loglevel error -i ${R}_silent.mp4 -i audio/$R.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest ../export/$NAME.mp4
echo "done -> ../export/$NAME.mp4"

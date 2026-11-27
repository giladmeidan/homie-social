#!/usr/bin/env python3
"""The same file checks scripts/render-batch.py runs in homie-social: 1080x1920, 30 fps, an audio stream,
the declared length, mean loudness -21.5..-16.5 dB, no clipping. Plus the v2 rule that the ask is on screen by 3 s."""
import json, re, subprocess, sys
path, export = sys.argv[1], json.load(open(sys.argv[2], encoding='utf8'))
meta = export['meta']
info = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', path], capture_output=True, text=True, check=True).stdout)
v = [s for s in info['streams'] if s['codec_type'] == 'video']; a = [s for s in info['streams'] if s['codec_type'] == 'audio']
problems = []
if not v: problems.append('no video stream')
else:
    v = v[0]
    if (v['width'], v['height']) != (1080, 1920): problems.append(f"size {v['width']}x{v['height']}")
    num, den = map(int, v['r_frame_rate'].split('/'))
    if abs(num / den - 30) > 0.01: problems.append(f'{num/den:.2f} fps')
if not a: problems.append('no audio stream')
length = float(info['format']['duration'])
if abs(length - float(meta['dur'])) > 0.6: problems.append(f"length {length:.1f}s, reel says {meta['dur']}s")
vol = subprocess.run(['ffmpeg', '-i', path, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
mean = float(re.search(r'mean_volume: (-?[\d.]+) dB', vol).group(1)); peak = float(re.search(r'max_volume: (-?[\d.]+) dB', vol).group(1))
if not -21.5 <= mean <= -16.5: problems.append(f'loudness {mean} dB mean (want -21..-17)')
if peak >= 0: problems.append(f'audio clips (peak {peak} dB)')
p = meta.get('prompt') or {}
if not isinstance(p.get('t'), (int, float)) or p['t'] > 3.0: problems.append('the ask is not on screen by 3 s')
if not (meta.get('cover') or {}).get('title'): problems.append('no cover declared')
print(f"postcheck: {v['width']}x{v['height']} {length:.2f}s, mean {mean} dB, peak {peak} dB, ask at {p.get('t')}s")
if problems: sys.exit('FAIL postcheck: ' + '; '.join(problems))
print('ok postcheck')

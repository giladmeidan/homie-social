#!/usr/bin/env python3
"""Renders the reels listed in content/batches/*.json and sends each one to the
Telegram approval queue (via scripts/enqueue.mjs).

Run by .github/workflows/render-reels.yml. Locally:

    python3 scripts/render-batch.py                  # every batch, skipping reels already sent
    python3 scripts/render-batch.py content/batches/2026-11-20.json
    DRY_RUN=1 python3 scripts/render-batch.py ...    # render + check, don't enqueue

Batch file format (written by the nightly reel task):

    {
      "batch": "2026-11-20",
      "reels": [
        {
          "reel": 48,                              # reel number (unique)
          "episode": "r48",                        # content/episodes/r48.js
          "name": "reel-48-redflags-music",        # output file name, no .mp4
          "title": "ריל 48 · דגלים אדומים · #7",    # shown in Telegram
          "caption": "...",                        # Instagram caption, ready to post
          "at": null,                              # optional "2026-11-21 19:00" (Asia/Jerusalem)
          "preview": false                         # optional: true = send to Telegram as a plain video
                                                   #   with the caption (no Approve button, nothing is
                                                   #   posted); Gilad downloads and uploads it himself
        }
      ]
    }

Markers (committed back by the workflow so a re-run never sends a reel twice):
    content/sent/<reel>.json     enqueued; never rendered again
    content/failed/<reel>.json   failed checks; skipped unless RETRY_FAILED=1
"""
import glob, json, os, re, shutil, subprocess, sys, time
from datetime import datetime
from zoneinfo import ZoneInfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENGINE = os.path.join(ROOT, 'content', 'engine')
EPISODES = os.path.join(ROOT, 'content', 'episodes')
SENT = os.path.join(ROOT, 'content', 'sent')
FAILED = os.path.join(ROOT, 'content', 'failed')
BUILD = os.path.join(ROOT, 'build')
EXPORT = os.path.join(BUILD, 'export')
TZ = ZoneInfo('Asia/Jerusalem')

DRY_RUN = os.environ.get('DRY_RUN') == '1'
# Voiced reels (window.VOICE, ElevenLabs) are only sent to the approval queue when the
# ElevenLabs plan includes a commercial license. Until then they go to Telegram as a
# plain preview message, which has no Approve button and can't be posted.
VOICE_LICENSED = os.environ.get('ELEVENLABS_LICENSED') == '1'
RETRY_FAILED = os.environ.get('RETRY_FAILED') == '1'

# Loudness window. The series bible aims for a mean of -21..-17 dB; outside the
# wider window below the reel is treated as broken.
MEAN_OK = (-21.5, -16.5)
MEAN_HARD = (-25.0, -13.0)


def sh(cmd, cwd=None, capture=False):
    r = subprocess.run(cmd, cwd=cwd, text=True, capture_output=True)
    if r.returncode != 0:
        tail = (r.stderr or r.stdout or '').strip()[-1500:]
        raise RuntimeError(f"{' '.join(cmd[:3])}... failed:\n{tail}")
    return r.stdout + r.stderr if capture else r.stdout


def marker(folder, reel):
    return os.path.join(folder, f'{int(reel)}.json')


def write_marker(folder, reel, data):
    os.makedirs(folder, exist_ok=True)
    with open(marker(folder, reel), 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')


def validate(item):
    for k in ('reel', 'episode', 'name', 'caption'):
        if not item.get(k):
            raise ValueError(f'missing "{k}"')
    if not re.fullmatch(r'r\d+', item['episode']):
        raise ValueError(f'episode must look like r48, got {item["episode"]!r}')
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]*', item['name']):
        raise ValueError(f'name must be lowercase letters, digits and dashes, got {item["name"]!r}')
    if not os.path.exists(os.path.join(EPISODES, item['episode'] + '.js')):
        raise ValueError(f'content/episodes/{item["episode"]}.js not found')
    check_not_repeat(item)


def _opening(caption):
    """First non-empty caption line, reduced to letters and digits so emoji,
    punctuation and spacing don't hide a repeat."""
    for line in caption.splitlines():
        norm = re.sub(r'[\W_]+', '', line, flags=re.UNICODE).lower()
        if norm:
            return norm
    return ''


def _episode_body(path):
    """Episode source without whitespace and without the seed/number lines that
    a lazy copy would change, so a re-numbered copy still counts as a copy."""
    src = open(path, encoding='utf8').read()
    src = re.sub(r'seed\s*:\s*\d+', 'seed:0', src)
    return re.sub(r'\s+', '', src)


def check_not_repeat(item):
    """Refuses a reel that is an exact copy of an earlier one: the same episode
    source, or a caption that opens with the same line as an earlier caption."""
    me = os.path.join(EPISODES, item['episode'] + '.js')
    body = _episode_body(me)
    for other in glob.glob(os.path.join(EPISODES, 'r*.js')):
        if os.path.abspath(other) != os.path.abspath(me) and _episode_body(other) == body:
            raise ValueError(f'episode is identical to {os.path.basename(other)}')
    opening = _opening(item['caption'])
    if not opening:
        return
    for bf in glob.glob(os.path.join(ROOT, 'content', 'batches', '*.json')):
        try:
            batch = json.load(open(bf, encoding='utf8'))
        except (ValueError, OSError):
            continue
        for prev in batch.get('reels', []):
            if prev.get('reel') == item['reel'] or not prev.get('caption'):
                continue
            if _opening(prev['caption']) == opening:
                raise ValueError(f'caption opens with the same line as reel {prev.get("reel")} '
                                 f'({os.path.basename(bf)})')


def build(item):
    ep, name = item['episode'], item['name']
    work = os.path.join(BUILD, ep)
    shutil.rmtree(work, ignore_errors=True)
    shutil.copytree(ENGINE, work)
    shutil.copy(os.path.join(EPISODES, ep + '.js'), work)
    os.makedirs(EXPORT, exist_ok=True)
    out = os.path.join(EXPORT, name + '.mp4')
    if os.path.exists(out):
        os.remove(out)
    log = sh(['bash', 'build.sh', ep, name], cwd=work, capture=True)
    if re.search(r'^(ERR|FAIL)\b', log, re.M):
        raise RuntimeError('render reported errors:\n' + log[-1500:])
    if not os.path.exists(out):
        raise RuntimeError('build finished but no mp4 was written')
    cfg_path = os.path.join(work, ep + '_cfg.json')
    dur = json.load(open(cfg_path))['dur'] if os.path.exists(cfg_path) else None
    voiced = os.path.exists(os.path.join(work, ep + '_voice.json'))
    beats_path = os.path.join(work, ep + '_beats.json')
    beats = json.load(open(beats_path)) if os.path.exists(beats_path) else None
    return out, dur, voiced, beats


def check(path, dur):
    """Same checks as section 4 of the series bible. Returns a list of warnings; raises on failure."""
    info = json.loads(sh(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', path]))
    v = [s for s in info['streams'] if s['codec_type'] == 'video']
    a = [s for s in info['streams'] if s['codec_type'] == 'audio']
    problems, warnings = [], []
    if not v:
        problems.append('no video stream')
    else:
        v = v[0]
        if (v['width'], v['height']) != (1080, 1920):
            problems.append(f"size {v['width']}x{v['height']}, expected 1080x1920")
        num, den = map(int, v['r_frame_rate'].split('/'))
        if abs(num / den - 30) > 0.01:
            problems.append(f"{num / den:.2f} fps, expected 30")
    if not a:
        problems.append('no audio stream')
    length = float(info['format']['duration'])
    if dur and abs(length - dur) > 0.6:
        problems.append(f'length {length:.1f}s, episode says {dur}s')
    if a:
        vol = sh(['ffmpeg', '-i', path, '-af', 'volumedetect', '-f', 'null', '-'], capture=True)
        mean = float(re.search(r'mean_volume: (-?[\d.]+) dB', vol).group(1))
        peak = float(re.search(r'max_volume: (-?[\d.]+) dB', vol).group(1))
        if not MEAN_HARD[0] <= mean <= MEAN_HARD[1]:
            problems.append(f'loudness {mean} dB mean')
        elif not MEAN_OK[0] <= mean <= MEAN_OK[1]:
            warnings.append(f'loudness {mean} dB mean (target -21..-17)')
        if peak >= 0.0:
            problems.append(f'audio clips (peak {peak} dB)')
    if problems:
        raise RuntimeError('; '.join(problems))
    return warnings, length


def enqueue(item, path, beats=None):
    if DRY_RUN:
        return 'dry-run'
    cap = os.path.join(BUILD, f"{item['episode']}_caption.txt")
    with open(cap, 'w') as f:
        f.write(item['caption'].strip() + '\n')
    cmd = ['node', os.path.join(ROOT, 'scripts', 'enqueue.mjs'), path, '--caption-file', cap,
           '--title', item.get('title') or item['name']]
    if beats:  # reel structure for the dashboard's retention insight
        bp = os.path.join(BUILD, f"{item['episode']}_beats.json")
        with open(bp, 'w') as f:
            json.dump(beats, f)
        cmd += ['--beats-file', bp]
    if item.get('at'):
        at = datetime.fromisoformat(item['at'])
        if at.tzinfo is None:
            at = at.replace(tzinfo=TZ)
        cmd += ['--at', at.isoformat()]
    out = sh(cmd, cwd=ROOT)
    m = re.search(r'Queued as (\S+?)\.', out)
    return m.group(1) if m else out.strip()


def preview(item, path, manual=False):
    """Sends the video to Telegram as a plain message (no Approve button).
    manual=True: a reel Gilad uploads himself, so the message carries the caption to copy."""
    if DRY_RUN:
        return 'dry-run'
    if manual:
        text = f"📥 {item.get('title') or item['name']}\n\n{item['caption'].strip()}"
    else:
        text = (f"🎧 {item.get('title') or item['name']}\n"
                'Voice preview (ElevenLabs free plan). Not in the approval queue and not for posting.')
    out = sh(['node', os.path.join(ROOT, 'scripts', 'telegram-preview.mjs'), path, text], cwd=ROOT)
    return 'preview ' + out.strip()[-80:]


def main():
    files = sys.argv[1:] or sorted(glob.glob(os.path.join(ROOT, 'content', 'batches', '*.json')))
    results = []
    for bf in files:
        batch = json.load(open(bf))
        for item in batch.get('reels', []):
            reel = item.get('reel')
            label = f"reel {reel} ({item.get('title') or item.get('name')})"
            if reel is None:
                results.append(('failed', f'{os.path.basename(bf)}: an entry has no "reel" number'))
                continue
            if os.path.exists(marker(SENT, reel)):
                continue
            if os.path.exists(marker(FAILED, reel)) and not RETRY_FAILED:
                continue
            ep_file = os.path.join(EPISODES, str(item.get('episode')) + '.js')
            if (os.path.exists(ep_file) and 'window.VOICE' in open(ep_file, encoding='utf8').read()
                    and not os.environ.get('ELEVENLABS_API_KEY')):
                # no marker: it renders on the first run after the secret is added
                results.append(('waiting', f'{label}: has a voiceover, waiting for the ELEVENLABS_API_KEY secret'))
                continue
            t0 = time.time()
            print(f'::group::{label}', flush=True)
            try:
                validate(item)
                path, dur, voiced, beats = build(item)
                warnings, length = check(path, dur)
                if item.get('preview'):
                    queued = preview(item, path, manual=True)
                    warnings.append('manual upload: sent as a plain video, not in the approval queue')
                elif voiced and not VOICE_LICENSED:
                    queued = preview(item, path)
                    warnings.append('voiced: preview only (ElevenLabs free plan, not licensed for posting)')
                else:
                    queued = enqueue(item, path, beats)
                if not DRY_RUN:
                    write_marker(SENT, reel, {'reel': reel, 'name': item['name'], 'batch': batch.get('batch'),
                                              'queued_as': queued, 'length': round(length, 2), 'warnings': warnings, 'beats': beats,
                                              'sent_at': datetime.now(TZ).isoformat(timespec='seconds')})
                    if os.path.exists(marker(FAILED, reel)):
                        os.remove(marker(FAILED, reel))
                note = f' ({"; ".join(warnings)})' if warnings else ''
                results.append(('sent' if not DRY_RUN else 'built', f'{label}{note}'))
                print(f'ok in {time.time() - t0:.0f}s -> {queued}', flush=True)
            except Exception as e:  # one broken reel must not stop the others
                msg = str(e).strip()
                print(f'FAILED: {msg}', flush=True)
                if not DRY_RUN:
                    write_marker(FAILED, reel, {'reel': reel, 'name': item.get('name'), 'batch': batch.get('batch'),
                                                'error': msg[-1500:],
                                                'failed_at': datetime.now(TZ).isoformat(timespec='seconds')})
                results.append(('failed', f'{label}: {msg.splitlines()[0][:300]}'))
            print('::endgroup::', flush=True)

    summary = os.environ.get('GITHUB_STEP_SUMMARY')
    lines = ['## Reels'] + [f'- **{s}** {t}' for s, t in results] if results else ['## Reels', 'Nothing new to render.']
    print('\n'.join(lines))
    if summary:
        with open(summary, 'a') as f:
            f.write('\n'.join(lines) + '\n')
    with open(os.path.join(ROOT, 'build', 'results.json') if os.path.isdir(BUILD) else os.devnull, 'w') as f:
        json.dump([{'status': s, 'text': t} for s, t in results], f, ensure_ascii=False)
    sys.exit(1 if any(s == 'failed' for s, _ in results) else 0)


if __name__ == '__main__':
    main()

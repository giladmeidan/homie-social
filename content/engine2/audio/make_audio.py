#!/usr/bin/env python3
"""homie Engine 2 · audio builder

    python3 audio/make_audio.py reels/<id>      ->  reels/<id>/assets/mix.wav
                                                    reels/<id>/build/export.json  (cues + reel facts read from the page)
                                                    reels/<id>/build/audio.json   (what was mixed, measured levels)

What it does
  1. Loads the reel's index.html in headless Chrome and reads the JSON that E2.publish() wrote into the page:
     the sound cues (declared next to the moves they belong to) and the reel's facts (bpm, bars, length).
  2. Music bed: a short loop written as notes and played through SAMPLED instruments (a SoundFont), not
     synthesized tones. The bar grid is the reel's grid, so the picture's bar lines are the music's bar lines.
  3. Sound effects: sampled percussion for anything that lands or taps, shaped noise for air, paper and cardboard.
  4. Mixes, sets loudness for the pipeline's check (mean -21..-17 dB, peak under -1 dB), writes a stereo wav.

Everything is seeded: the same reel gives the same file.

SoundFont: GeneralUser GS by S. Christian Collins (free for commercial music; license in its repo).
It is not committed (32 MB). It is read from $E2_SOUNDFONT, else audio/cache/GeneralUser-GS.sf2, and
downloaded there from the author's GitHub when missing: one fixed commit, checked against a known hash.

Chrome: $E2_CHROME, else $PUPPETEER_EXECUTABLE_PATH or $CHROME_PATH, else the first of google-chrome,
google-chrome-stable, chromium, chromium-browser on the PATH.

    python3 audio/make_audio.py --check         ->  confirms Chrome, the sampler and the SoundFont are in place

Later, in the render workflow: when ELEVENLABS_API_KEY is set, the bed and the effects can come from
ElevenLabs Music / Sound Effects instead (same cue list, same grid). Not built yet.
"""
import hashlib, json, os, re, shutil, subprocess, sys, urllib.request
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
SF_COMMIT = '684543d5e5efaef08d02be50dcda8d552478fa60'   # GeneralUser GS v2.0.3, as downloaded on 27 Nov 2026
SF_URL = f'https://raw.githubusercontent.com/mrbumpy409/GeneralUser-GS/{SF_COMMIT}/GeneralUser-GS.sf2'
SF_SHA256 = '9575028c7a1f589f5770fccc8cff2734566af40cd26ed836944e9a5152688cfe'
_SF = None
TARGET_MEAN_DB = -18.5      # ffmpeg volumedetect mean_volume; the pipeline accepts -21..-17
CEIL_DB = -1.2


def chrome():
    for p in (os.environ.get('E2_CHROME'), os.environ.get('PUPPETEER_EXECUTABLE_PATH'), os.environ.get('CHROME_PATH')):
        if p and os.path.exists(p):
            return p
    for name in ('google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'):
        p = shutil.which(name)
        if p:
            return p
    sys.exit('FAIL audio: Chrome not found. Install it or set E2_CHROME to its path')


# ---------------------------------------------------------------- reel facts and cues
def export(reel_dir):
    url = 'file://' + os.path.abspath(os.path.join(reel_dir, 'index.html'))
    dom = subprocess.run([chrome(), '--headless=new', '--no-sandbox', '--disable-gpu', '--allow-file-access-from-files',
                          '--virtual-time-budget=4000', '--dump-dom', url], capture_output=True, text=True, timeout=120).stdout
    m = re.search(r'<script type="application/json" id="e2-export">(.*?)</script>', dom, re.S)
    if not m:
        sys.exit('FAIL audio: the page did not publish cues (E2.publish missing, or a script error)')
    data = json.loads(m.group(1))
    os.makedirs(os.path.join(reel_dir, 'build'), exist_ok=True)
    json.dump(data, open(os.path.join(reel_dir, 'build', 'export.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    return data


# ---------------------------------------------------------------- sampled instruments
def soundfont():
    """Path of the SoundFont. The cached copy is checked once per run and downloaded again when it is not the expected file."""
    global _SF
    if _SF:
        return _SF
    p = os.environ.get('E2_SOUNDFONT')
    if p:
        _SF = p   # your own file: not checked
        return p
    p = os.path.join(HERE, 'cache', 'GeneralUser-GS.sf2')
    if os.path.exists(p) and _sha256(p) != SF_SHA256:
        os.remove(p)
    if not os.path.exists(p):
        os.makedirs(os.path.dirname(p), exist_ok=True)
        print('downloading the SoundFont (32 MB, once)...', flush=True)
        urllib.request.urlretrieve(SF_URL, p + '.part')
        got = _sha256(p + '.part')
        if got != SF_SHA256:
            os.remove(p + '.part')
            sys.exit(f'FAIL audio: the downloaded SoundFont is not the expected file (sha256 {got[:12]}...)')
        os.rename(p + '.part', p)
    _SF = p
    return p


def _sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for block in iter(lambda: f.read(1 << 20), b''):
            h.update(block)
    return h.hexdigest()


def self_check():
    """Run by tools_setup.sh: fails early, with a plain message, when something the audio step needs is missing."""
    import tinysoundfont  # noqa: F401
    print('ok audio setup: chrome', chrome(), '| soundfont', os.path.basename(soundfont()), flush=True)


def play(events, dur, programs, drums=(9,), volumes=None):
    """events: [(t, chan, key, vel, length_s)] -> stereo float array [n,2]. Sample-accurate scheduling."""
    import tinysoundfont
    synth = tinysoundfont.Synth(samplerate=SR)
    sf = synth.sfload(soundfont())
    for chan, (bank, preset) in programs.items():
        synth.program_select(chan, sf, bank, preset, chan in drums)
    for chan, v in (volumes or {}).items():
        synth.control_change(chan, 7, v)
    acts = []
    for t, chan, key, vel, ln in events:
        acts.append((int(round(t * SR)), 1, chan, key, int(max(1, min(127, vel)))))
        acts.append((int(round((t + ln) * SR)), 0, chan, key, 0))
    acts.sort(key=lambda a: (a[0], a[1]))
    n_total = int(round(dur * SR)); out = np.zeros((n_total, 2), np.float32); pos = 0
    for n, on, chan, key, vel in acts + [(n_total, -1, 0, 0, 0)]:
        n = min(n, n_total)
        if n > pos:
            buf = np.frombuffer(bytes(synth.generate(n - pos)), dtype=np.float32).reshape(-1, 2)
            out[pos:n] = buf; pos = n
        if on == 1: synth.noteon(chan, key, vel)
        elif on == 0: synth.noteoff(chan, key)
    return out.astype(np.float64)


# ---------------------------------------------------------------- music: warm lo-fi loop
def bed_lofi(bpm, bars, payoff_bar=None):
    """Electric piano, upright bass, brushed kit, a few vibraphone notes. | Fmaj7 | Em7 | Dm7 | G7 | loops back to F.
    Every note is a chord tone, so nothing clashes. payoff_bar gets a fuller chord and a soft cymbal."""
    beat = 60.0 / bpm
    EP, BASS, VIB, DR = 0, 1, 2, 9
    prog = [(41, [53, 57, 60, 64]), (40, [52, 55, 59, 62]), (38, [50, 53, 57, 60]), (43, [55, 59, 62, 65])]
    motif = [[(1.5, 69, 1.0), (3.0, 72, 0.9)], [(1.5, 71, 1.0), (3.0, 67, 0.9)],
             [(1.5, 69, 1.0), (3.0, 65, 0.9)], [(1.5, 71, 0.9), (2.5, 74, 1.4)]]
    keys, bass, drums = [], [], []
    for b in range(bars):
        root, tones = prog[b % 4]; t0 = b * 4 * beat; big = payoff_bar is not None and b == payoff_bar
        for bt, ln, vel in [(0, 2.4, 76 if big else 70), (2.5, 1.5, 60)]:                       # chords ring into each other
            for i, k in enumerate(tones + ([tones[0] + 12] if big and bt == 0 else [])):
                keys.append((t0 + bt * beat + i * 0.013, EP, k, vel - i * 2, ln * beat))       # a slight strum
            for i, k in enumerate(tones[2:]):                                                    # the top two again, an octave up and softer
                keys.append((t0 + bt * beat + 0.05 + i * 0.013, EP, k + 12, vel - 16, ln * beat))
        for bt, k, ln in motif[b % 4]: keys.append((t0 + bt * beat, VIB, k, 58, ln * beat))
        for bt, k, ln, vel in [(0, root, 1.4, 88), (2.5, root, 0.45, 66), (3, root + 7, 0.9, 74)]:
            bass.append((t0 + bt * beat, BASS, k, vel, ln * beat))
        drums.append((t0, DR, 36, 96 if big else 88, 0.2)); drums.append((t0 + 2.5 * beat, DR, 36, 74, 0.2))   # kick
        for bt in (1, 3): drums.append((t0 + bt * beat, DR, 37, 78, 0.2))                              # side stick
        for i in range(8):                                                                            # swung hats
            drums.append((t0 + (i * 0.5 + (0.09 if i % 2 else 0)) * beat, DR, 42, 70 if i % 2 == 0 else 48, 0.1))
        if big: drums.append((t0, DR, 55, 50, 1.2))                                                   # soft splash
    dur = bars * 4 * beat
    def rms(x): return np.sqrt(np.mean(x ** 2)) + 1e-12
    def hp(x, f): b_, a_ = butter(2, f / (SR / 2), 'high'); return lfilter(b_, a_, x, axis=0)
    k_ = play(keys, dur, {EP: (0, 4), VIB: (0, 11)}, volumes={EP: 110, VIB: 92})
    b_s = play(bass, dur, {BASS: (0, 32)})
    d_ = play(drums, dur, {DR: (128, 40)})
    k_ = k_ + hp(k_, 1800) * 0.9                       # presence, so the chords read on a phone speaker
    b_s = np.tanh(hp(b_s, 55) * 6) / 6                 # overtones: a phone has nothing under 150 Hz
    d_ = hp(d_, 45)
    # stems balanced by level: the keys carry it, the bass supports, the kit keeps time
    x = k_ / rms(k_) * 10 ** (-20 / 20) + b_s / rms(b_s) * 10 ** (-27 / 20) + d_ / rms(d_) * 10 ** (-24.5 / 20)
    lb, la = butter(2, 9000 / (SR / 2), 'low'); x = lfilter(lb, la, x, axis=0)       # take the digital edge off
    return np.tanh(x * 1.5) / 1.5                                                    # a little tape-like saturation


# ---------------------------------------------------------------- effects
def env(n, a=0.003, d=20.0):
    t = np.arange(n) / SR; e = np.exp(-d * t); k = max(1, int(a * SR)); e[:k] *= np.linspace(0, 1, k); return e

def bp(x, lo, hi):
    b_, a_ = butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'); return lfilter(b_, a_, x)

def lp(x, f):
    b_, a_ = butter(2, f / (SR / 2), 'low'); return lfilter(b_, a_, x)

def noise_fx(kind, rs, extra):
    """Shaped noise for air, paper and cardboard. Returns a mono array."""
    if kind == 'whiff':
        n = int(.14 * SR); t = np.arange(n) / SR; return bp(rs.randn(n), 1500, 6500) * np.sin(np.pi * t / .14) ** 2 * .5
    if kind == 'whoosh':                     # rises into the hit that follows it
        n = int(.32 * SR); t = np.arange(n) / SR
        return (bp(rs.randn(n), 500, 2500) * .6 + bp(rs.randn(n), 2500, 8000) * (t / .32) * .6) * (t / .32) ** 2
    if kind == 'creak':                      # cardboard leaning: a short run of tiny ticks
        n = int(.16 * SR); x = np.zeros(n)
        for i in range(9):
            p = int((i / 9 + rs.rand() * .04) * n * .9); m = int(.006 * SR)
            if p + m < n: x[p:p + m] += rs.randn(m) * env(m, .0005, 500) * (1 - i / 12)
        return bp(x, 700, 3200) * 1.1
    if kind == 'crumple':
        n = int(.34 * SR); x = np.zeros(n)
        for i in range(26):
            p = int(rs.rand() ** 1.6 * n * .9); m = int((.004 + rs.rand() * .01) * SR)
            if p + m < n: x[p:p + m] += rs.randn(m) * env(m, .0005, 300) * (.4 + rs.rand() * .6)
        return bp(x, 1200, 7000) * .9
    if kind == 'peel':                       # tape letting go: a buzzing rip that speeds up
        n = int(.26 * SR); t = np.arange(n) / SR; rate = 70 + 260 * (t / .26) ** 2
        am = (np.sin(2 * np.pi * np.cumsum(rate) / SR) > .2).astype(float)
        return bp(rs.randn(n), 1800, 7500) * am * np.sin(np.pi * t / .26) ** .7 * .55
    if kind == 'slide':                      # cardboard on glass
        d = float(extra.get('dur', .4)); n = int(d * SR); t = np.arange(n) / SR
        return bp(rs.randn(n), 350, 1900) * np.sin(np.pi * t / d) ** 1.5 * (1 + .3 * np.sin(2 * np.pi * 23 * t)) * .5
    if kind == 'scribble':                   # a marker: three short strokes
        n = int(.26 * SR); x = np.zeros(n)
        for i, p0 in enumerate((0, .09, .17)):
            m = int(.06 * SR); p = int(p0 * SR); tt = np.arange(m) / SR
            x[p:p + m] += bp(rs.randn(m), 2200, 5200) * np.sin(np.pi * tt / .06) ** 2
        return x * .5
    if kind == 'hum':                        # the fridge: very low, only there to be missed if removed
        d = float(extra.get('dur', 1)); n = int(d * SR); x = bp(rs.randn(n), 90, 420)
        k = int(.25 * SR); x[:k] *= np.linspace(0, 1, k); x[-k:] *= np.linspace(1, 0, k); return x * .05
    return None

# kinds played by sampled percussion: [(GM drum key, velocity)]
PERC = {
    'thud':   [(77, 78), (36, 46)],          # low wood block + a soft kick: a carton landing on glass
    'tok':    [(76, 62)],                    # hi wood block: a nod
    'pop':    [(62, 70)],                    # muted conga: a pill arriving
    'bump':   [(64, 78), (77, 50)],          # low conga + wood: two cartons meeting
    'impact': [(36, 118), (41, 96), (77, 70)],  # kick + floor tom + wood: the payoff
    'slap':   [(37, 74)],                    # side stick: a note slapped on
}

def effects(cues, dur, seed):
    rs = np.random.RandomState(seed); n = int(round(dur * SR)); out = np.zeros((n, 2)); ev = []; used = {}
    for c in cues:
        k, t, v = c['k'], float(c['t']), float(c.get('v', 1)); used[k] = used.get(k, 0) + 1
        if k in PERC:
            for key, vel in PERC[k]: ev.append((t + 0.012, 9, key, vel * (0.55 + 0.45 * v), 0.3))
            if k == 'slap':
                m = int(.03 * SR); x = bp(rs.randn(m), 2500, 9000) * env(m, .0005, 160) * .5 * v
            else: x = None
        else:
            x = noise_fx(k, rs, c)
            if x is None:
                print('  (no sound defined for cue kind %r, skipped)' % k); continue
            x = x * v
        if x is not None:
            i = int(t * SR); j = min(n, i + len(x))
            if i < n: out[i:j, 0] += x[:j - i]; out[i:j, 1] += x[:j - i]
    if ev: out += play(ev, dur, {9: (128, 0)}, volumes={9: 110}) * 1.5
    return out, used


# ---------------------------------------------------------------- mix
def db(x): return 20 * np.log10(max(1e-12, x))

def main():
    if sys.argv[1:2] == ['--check']:
        return self_check()
    reel_dir = sys.argv[1].rstrip('/')
    data = export(reel_dir); meta = data['meta']; cues = data['cues']
    dur = float(meta['dur']); bpm = float(meta.get('bpm', 100)); bars = int(meta.get('bars') or round(dur / (240.0 / bpm)))
    seed = sum(ord(ch) for ch in str(meta.get('id', 'reel')))
    payoff = meta.get('beats', {}).get('payoff')
    payoff_bar = int(round(payoff / (240.0 / bpm))) if isinstance(payoff, (int, float)) else None
    n = int(round(dur * SR))
    music = bed_lofi(bpm, bars, payoff_bar)[:n]
    if len(music) < n: music = np.vstack([music, np.zeros((n - len(music), 2))])
    fx, used = effects(cues, dur, seed)
    mrms = np.sqrt(np.mean(music ** 2)) + 1e-12
    music = music / mrms * 10 ** (-21 / 20)                 # the bed sits low
    hits = fx / (np.max(np.abs(fx)) + 1e-12) * 10 ** (-7 / 20)   # the loudest hit peaks about 5 dB over the bed's peaks
    mix = music + hits
    fade = int(.05 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]; mix[:64] *= np.linspace(0, 1, 64)[:, None]
    # loudness for the pipeline's check, then a soft knee under the ceiling
    mix *= 10 ** (TARGET_MEAN_DB / 20) / (np.sqrt(np.mean(mix ** 2)) + 1e-12)
    ceil = 10 ** (CEIL_DB / 20); k = ceil * 0.7; over = np.abs(mix) > k
    mix[over] = np.sign(mix[over]) * (k + (ceil - k) * np.tanh((np.abs(mix[over]) - k) / (ceil - k)))
    mix *= 10 ** (TARGET_MEAN_DB / 20) / (np.sqrt(np.mean(mix ** 2)) + 1e-12)
    mix = np.clip(mix, -ceil, ceil)
    os.makedirs(os.path.join(reel_dir, 'assets'), exist_ok=True)
    wavfile.write(os.path.join(reel_dir, 'assets', 'mix.wav'), SR, (mix * 32767).astype(np.int16))
    stats = {'dur': dur, 'bpm': bpm, 'bars': bars, 'bed': 'lofi (SoundFont: GeneralUser GS)', 'cues': used,
             'mean_db': round(db(np.sqrt(np.mean(mix ** 2))), 1), 'peak_db': round(db(np.max(np.abs(mix))), 1),
             'bed_mean_db': round(db(np.sqrt(np.mean((music) ** 2))), 1)}
    json.dump(stats, open(os.path.join(reel_dir, 'build', 'audio.json'), 'w'), indent=1)
    print('ok audio', meta.get('id'), stats, flush=True)


if __name__ == '__main__':
    main()

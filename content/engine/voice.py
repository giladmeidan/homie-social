# usage: python3 voice.py r1014   (run after audio.py; only does something if r1014_voice.json exists)
#
# Adds an ElevenLabs voiceover to audio/<reel>.wav:
#   1. reads the episode's window.VOICE (dumped by render.py to <reel>_voice.json)
#   2. makes one TTS clip per line (cached by text+voice+model, so a re-run costs no credits)
#   3. places each clip at its time, speeding it up a little if it runs into the next line
#   4. ducks the music under the voice, mixes, and sets loudness for the render checks
#
# Episode format:
#   window.VOICE={
#     voice:'<voice id>',            // optional; else $ELEVENLABS_VOICE_ID; else a premade voice
#     model:'eleven_v4',             // optional; else tries eleven_v4, then eleven_v3
#     duck:0.7,                      // optional; how far the music drops under the voice (0..1)
#     gain:1.0,                      // optional; voice level against the music
#     lines:[[0.3,'בעוד שנה, מישהו ישאל...'],[3.2,'התשובה מתחילה ביום הכניסה.'], ...]
#   };
#
# Env: ELEVENLABS_API_KEY (required when the episode has VOICE), ELEVENLABS_VOICE_ID,
#      VOICE_CACHE (default ./voice-cache), VOICE_MAX_CHARS (default 1500, a guard per reel).
import hashlib, json, os, subprocess, sys, time, urllib.error, urllib.request
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter

reel = sys.argv[1]
SR = 44100
cfg_path = f'{reel}_voice.json'
if not os.path.exists(cfg_path):
    print('no voice for', reel); sys.exit(0)

V = json.load(open(cfg_path, encoding='utf8'))
LINES = [(float(t), str(txt).strip()) for t, txt in V['lines'] if str(txt).strip()]
LINES.sort()
KEY = os.environ.get('ELEVENLABS_API_KEY', '').strip()
VOICE = V.get('voice') or os.environ.get('ELEVENLABS_VOICE_ID') or 'EXAVITQu4vr4xnSDxMaL'  # premade "Sarah"
MODELS = [V['model']] if V.get('model') else ['eleven_v4', 'eleven_v3']
CACHE = os.environ.get('VOICE_CACHE') or 'voice-cache'
MAX_CHARS = int(os.environ.get('VOICE_MAX_CHARS', '1500'))
DUCK = float(V.get('duck', 0.7))
GAIN = float(V.get('gain', 1.0))
os.makedirs(CACHE, exist_ok=True)


def die(msg):
    print('FAIL voice:', msg, flush=True); sys.exit(1)


def cache_path(text, model):
    h = hashlib.sha256(json.dumps([text, VOICE, model, 'he', 2], ensure_ascii=False).encode()).hexdigest()[:24]
    return os.path.join(CACHE, h + '.mp3')


def api(path, body=None):
    req = urllib.request.Request('https://api.elevenlabs.io' + path, method='POST' if body else 'GET',
                                 data=json.dumps(body, ensure_ascii=False).encode() if body else None,
                                 headers={'xi-api-key': KEY, 'content-type': 'application/json'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            detail = e.read().decode('utf8', 'replace')[:400]
            if e.code == 429 and attempt < 2:
                time.sleep(5 * (attempt + 1)); continue
            raise RuntimeError(f'{e.code} {detail}')
        except urllib.error.URLError as e:
            if attempt < 2:
                time.sleep(3); continue
            raise RuntimeError(f'network: {e.reason}')


def tts(text):
    """Returns (mp3 path, model used). Tries each model on the TTS endpoint, then on the
    dialogue endpoint (some models are only offered there)."""
    for model in MODELS:
        p = cache_path(text, model)
        if os.path.exists(p):
            return p, model + ' (cached)'
    if not KEY:
        die('the episode has VOICE but ELEVENLABS_API_KEY is not set (add it as a repo secret)')
    errors = []
    for model in MODELS:
        attempts = [
            (f'/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128',
             {'text': text, 'model_id': model, 'language_code': 'he'}),
            ('/v1/text-to-dialogue?output_format=mp3_44100_128',
             {'inputs': [{'text': text, 'voice_id': VOICE}], 'model_id': model, 'language_code': 'he'}),
        ]
        for path, body in attempts:
            try:
                audio = api(path, body)
            except RuntimeError as e:
                msg = str(e)
                errors.append(f'{model} {path.split("?")[0].split("/")[2]}: {msg[:160]}')
                if msg.startswith(('401', '402')) or 'quota' in msg.lower() or 'credits' in msg.lower():
                    die('ElevenLabs refused the key or is out of credits: ' + msg[:300])
                continue
            p = cache_path(text, model)
            open(p, 'wb').write(audio)
            return p, model
    die('no model accepted the line. Tried:\n  ' + '\n  '.join(errors))


def credits_left():
    try:
        s = json.loads(api('/v1/user/subscription'))
        return s['character_limit'] - s['character_count'], s.get('tier')
    except Exception as e:  # a missing permission on the key must not block the render
        print('could not read credits:', str(e)[:120]); return None, None


def decode(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float64) / 32768
    # trim silence at both ends so the clip starts exactly on its time
    nz = np.where(np.abs(x) > 0.01)[0]
    return x[max(0, nz[0] - int(.02 * SR)):nz[-1] + int(.08 * SR)] if len(nz) else x


def speed_up(x, factor):
    """Pitch-preserving speed-up through ffmpeg's atempo."""
    r = subprocess.run(['ffmpeg', '-loglevel', 'error', '-f', 's16le', '-ac', '1', '-ar', str(SR), '-i', '-',
                        '-af', f'atempo={factor:.4f}', '-f', 's16le', '-'],
                       input=(np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes(), capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.int16).astype(np.float64) / 32768


# ---- credit guard -------------------------------------------------------------------
need = sum(len(t) for _, t in LINES if not any(os.path.exists(cache_path(t, m)) for m in MODELS))
if need > MAX_CHARS:
    die(f'{need} characters to voice, more than VOICE_MAX_CHARS={MAX_CHARS}; shorten the lines')
if need and KEY:
    left, tier = credits_left()
    if left is not None:
        print(f'ElevenLabs plan: {tier}, {left} characters left, this reel needs about {need}')
        if left < need:
            die(f'only {left} ElevenLabs characters left this month, this reel needs {need}')

# ---- clips --------------------------------------------------------------------------
sr, music = wavfile.read(f'audio/{reel}.wav')
music = music.astype(np.float64) / 32768
if music.ndim > 1:
    music = music.mean(axis=1)
N = len(music); DUR = N / SR
voice = np.zeros(N)
for i, (t, text) in enumerate(LINES):
    path, used = tts(text)
    clip = decode(path)
    end = LINES[i + 1][0] - 0.12 if i + 1 < len(LINES) else DUR - 0.25
    slot = end - t
    length = len(clip) / SR
    note = ''
    if length > slot:
        f = length / slot
        if f > 1.25:
            die(f'line at {t}s is {length:.2f}s but has only {slot:.2f}s before the next line; shorten it: {text}')
        clip = speed_up(clip, f); note = f' sped up x{f:.2f}'
    a = int(t * SR); b = min(N, a + len(clip))
    voice[a:b] += clip[:b - a]
    print(f'voice {t:5.2f}s  {len(clip) / SR:4.2f}s/{slot:4.2f}s  {used}{note}  {text}', flush=True)

# ---- duck and mix -------------------------------------------------------------------
def lp(x, f):
    bb, aa = butter(1, f / (SR / 2), 'low'); return lfilter(bb, aa, x)

vpk = np.max(np.abs(voice))
if vpk > 0:
    voice = voice / vpk
# voice activity: rectify, smooth, and hold, so the music stays down between words
act = lp(np.abs(voice), 8.0)
act = np.clip(act / (np.max(act) + 1e-9) * 4, 0, 1)
hold = int(.18 * SR)
act = np.convolve(act, np.ones(hold) / hold, 'same')
act = np.clip(act * 2.5, 0, 1)
act = lp(lp(act, 4.0), 4.0)                     # ~100 ms attack / release
mix = music * (1 - DUCK * act) * 0.55 + voice * 0.9 * GAIN

# loudness: aim for a -18.5 dB mean (render check wants -21..-17), keep peaks under -1 dB
rms = np.sqrt(np.mean(mix ** 2)) + 1e-12
mix *= 10 ** (-18.5 / 20) / rms
ceil = 10 ** (-1.0 / 20)
over = np.abs(mix) > ceil * 0.8
if over.any():  # soft knee limiter on the loud parts only
    k = ceil * 0.8
    mix[over] = np.sign(mix[over]) * (k + (ceil - k) * np.tanh((np.abs(mix[over]) - k) / (ceil - k)))
wavfile.write(f'audio/{reel}.wav', SR, (np.clip(mix, -1, 1) * 32767).astype(np.int16))
print(f'ok voice {reel}: {len(LINES)} lines, mean {20 * np.log10(np.sqrt(np.mean(mix ** 2))):.1f} dB', flush=True)

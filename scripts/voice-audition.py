#!/usr/bin/env python3
"""Sends the same Hebrew sample in several voices to the Telegram chat, so a voice can be
picked by ear. Run from Actions > Render reels > Run workflow > "voice_audition":
    mine                  every voice you added to My Voices in ElevenLabs (up to 8)
    id1,id2,id3           those voice ids
Cost: about 45 characters per voice. Then set the one you like as the repo variable
ELEVENLABS_VOICE_ID (Settings > Secrets and variables > Actions > Variables)."""
import json, os, sys, urllib.error, urllib.request

KEY = os.environ.get('ELEVENLABS_API_KEY', '').strip()
TG, CHAT = os.environ.get('TELEGRAM_BOT_TOKEN'), os.environ.get('TELEGRAM_CHAT_ID')
WHICH = (os.environ.get('AUDITION') or '').strip()
SAMPLE = 'בעוד שנה, מישהו ישאל: השריטה הזאת? הייתה. הנה התמונה.'
if not (KEY and TG and CHAT and WHICH):
    sys.exit('needs ELEVENLABS_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID and the voice_audition input')


def el(path, body=None):
    req = urllib.request.Request('https://api.elevenlabs.io' + path, method='POST' if body else 'GET',
                                 data=json.dumps(body, ensure_ascii=False).encode() if body else None,
                                 headers={'xi-api-key': KEY, 'content-type': 'application/json'})
    with urllib.request.urlopen(req, timeout=90) as r:
        return r.read()


def telegram(method, fields, file=None):
    boundary = 'homieaudition'
    parts = []
    for k, v in fields.items():
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    if file:
        name, data = file
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="audio"; filename="{name}"\r\n'
                     f'Content-Type: audio/mpeg\r\n\r\n'.encode() + data + b'\r\n')
    parts.append(f'--{boundary}--\r\n'.encode())
    req = urllib.request.Request(f'https://api.telegram.org/bot{TG}/{method}', data=b''.join(parts),
                                 headers={'content-type': f'multipart/form-data; boundary={boundary}'})
    urllib.request.urlopen(req, timeout=60).read()


voices = json.loads(el('/v1/voices'))['voices']
names = {v['voice_id']: v['name'] for v in voices}
if WHICH.lower() == 'mine':
    ids = [v['voice_id'] for v in voices if v.get('category') != 'premade'][:8]
    if not ids:
        sys.exit('No voices in My Voices yet. In ElevenLabs open Voices > Voice Library, filter Language: Hebrew, '
                 'and add 3-5 voices to My Voices, then run this again.')
else:
    ids = [x.strip() for x in WHICH.split(',') if x.strip()][:8]

telegram('sendMessage', {'chat_id': CHAT, 'text': f'🎙️ Voice audition: {len(ids)} voices, same line each. '
                         'Copy the id of the one you like into the repo variable ELEVENLABS_VOICE_ID.'})
for vid in ids:
    label = f"{names.get(vid, '?')} · {vid}"
    audio, used, err = None, None, ''
    for model in ('eleven_v4', 'eleven_v3'):
        for path, body in ((f'/v1/text-to-speech/{vid}?output_format=mp3_44100_128',
                            {'text': SAMPLE, 'model_id': model, 'language_code': 'he'}),
                           ('/v1/text-to-dialogue?output_format=mp3_44100_128',
                            {'inputs': [{'text': SAMPLE, 'voice_id': vid}], 'model_id': model, 'language_code': 'he'})):
            try:
                audio, used = el(path, body), model; break
            except urllib.error.HTTPError as e:
                err = f'{e.code} {e.read().decode("utf8", "replace")[:150]}'
        if audio:
            break
    if audio:
        telegram('sendAudio', {'chat_id': CHAT, 'caption': f'{label}\nmodel: {used}', 'title': label}, (f'{vid}.mp3', audio))
        print('sent', label, used)
    else:
        telegram('sendMessage', {'chat_id': CHAT, 'text': f'❌ {label}: {err}'})
        print('failed', label, err)

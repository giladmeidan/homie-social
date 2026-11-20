#!/usr/bin/env python3
"""Checks the ElevenLabs key: plan, characters left this month, and which models can
speak Hebrew through the API. Run from GitHub Actions with "voice_check", or locally:
    ELEVENLABS_API_KEY=... python3 scripts/elevenlabs-check.py
Prints nothing secret."""
import json, os, sys, urllib.error, urllib.request

KEY = os.environ.get('ELEVENLABS_API_KEY', '').strip()
if not KEY:
    sys.exit('ELEVENLABS_API_KEY is not set (add it under Settings > Secrets and variables > Actions)')


def get(path):
    req = urllib.request.Request('https://api.elevenlabs.io' + path, headers={'xi-api-key': KEY})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        return {'_error': f'{e.code} {e.read().decode("utf8", "replace")[:200]}'}


sub = get('/v1/user/subscription')
if '_error' in sub:
    print('subscription:', sub['_error'], '(the key may lack the user_read permission; renders still work)')
else:
    left = sub['character_limit'] - sub['character_count']
    print(f"plan: {sub.get('tier')}  ·  {sub['character_count']}/{sub['character_limit']} used  ·  {left} left")
    print('commercial use: ' + ('NO (free plan) - keep ELEVENLABS_LICENSED unset' if sub.get('tier') == 'free'
                                else 'paid plan - set the repo variable ELEVENLABS_LICENSED=1 (voiced reels then go to approval)'))
    if os.environ.get('ELEVENLABS_LICENSED') == '1' and sub.get('tier') == 'free':
        print('WARNING: ELEVENLABS_LICENSED=1 is set but the key is on the free plan')

models = get('/v1/models')
if isinstance(models, dict) and '_error' in models:
    sys.exit('models: ' + models['_error'])
print('\nmodels that do text to speech (* = lists Hebrew):')
for m in models:
    if not m.get('can_do_text_to_speech'):
        continue
    langs = {l.get('language_id') for l in m.get('languages', [])}
    print(f"  {'*' if 'he' in langs else ' '} {m['model_id']:<28} {m.get('name', '')}")

voices = get('/v1/voices')
if isinstance(voices, dict) and 'voices' in voices:
    print('\nvoices on this account (set one as the repo variable ELEVENLABS_VOICE_ID):')
    for v in voices['voices'][:40]:
        labels = ', '.join(f'{k}: {x}' for k, x in (v.get('labels') or {}).items())
        print(f"  {v['voice_id']}  {v['name']:<22} {labels}")

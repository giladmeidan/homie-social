"""Reels plan v2 checks (homie/marketing/reels-plan.md, from 22.11.2026).

The plan's rules used to exist only as text an agent could skip. These checks run in the
render workflow and refuse a reel that breaks them, before it reaches Gilad's Telegram.

Applies to a batch item that has "format", and to every daily reel from H27 on (reel 1027-1999).
Batch item fields used here:
    "format":   one of FORMATS below (required for v2 reels)
    "slot":     "YYYY-MM-DD HH" Israel time of the schedule slot, e.g. "2026-11-22 13" (required)
    "replaces": optional reel number this reel replaces in the same slot (a re-run after a rejection)

Episode fields used here:
    window.COVER  = {t, title}          required (frame 0 is the cover)
    window.PROMPT = {t, text}           required: when the viewer is first asked to act (episode time)
    window.STRETCH                      at most 1.10
"""
import glob, json, os, re

# key: (name in titles, min s, max s) -- rendered length, after STRETCH
FORMATS = {
    'pick': ('Pick one', 10.0, 14.0),
    'pain': ('Pain point', 8.0, 12.0),
    'roommate': ('Roommate moment', 8.0, 12.0),
    'feature': ('Feature / promo', 10.0, 14.0),
    'smart': ('Renting smart story', 12.0, 14.0),
    'experiment': ('Experiment', 4.0, 14.0),
}
LENGTH_SLACK = 0.4      # render rounding
PROMPT_BY = 3.0         # the ask is on screen within the first 3 s (rendered time)
MAX_STRETCH = 1.10
ENDING_MAX = 1.0        # brand ending (wordmark()/endCard) at most 1 s ...
ENDING_MAX_FEATURE = 1.5  # ... 1.5 s in a feature / promo reel
VOICE_MAX_CHARS = 220   # about 200 spoken characters, with a little slack
SLOT_RE = re.compile(r'\d{4}-\d{2}-\d{2} \d{2}')


def applies(item):
    reel = item.get('reel')
    return bool(item.get('format')) or (isinstance(reel, int) and 1027 <= reel < 2000)


def _num(src, pattern):
    m = re.search(pattern, src)
    return float(m.group(1)) if m else None


def stretch_of(src):
    v = _num(src, r'window\.STRETCH\s*=\s*([\d.]+)')
    return v if v is not None else 1.0


def pre_check(item, src, sent_dir):
    """Cheap checks on the batch item and the episode source, before rendering. Returns nothing; raises ValueError."""
    problems = []
    fmt = item.get('format')
    if fmt not in FORMATS:
        problems.append(f'"format" must be one of {", ".join(FORMATS)} (got {fmt!r})')
    slot = item.get('slot')
    if not isinstance(slot, str) or not SLOT_RE.fullmatch(slot):
        problems.append(f'"slot" must look like "2026-11-22 13" (got {slot!r})')
    if 'window.COVER' not in src:
        problems.append('no window.COVER: frame 0 must be a designed cover')
    k = stretch_of(src)
    if k > MAX_STRETCH + 1e-9:
        problems.append(f'window.STRETCH={k}, at most {MAX_STRETCH}')
    pt = _num(src, r'window\.PROMPT\s*=\s*\{\s*t\s*:\s*([\d.]+)')
    if pt is None:
        problems.append('no window.PROMPT={t,text}: say when the viewer is first asked to act')
    elif pt * k > PROMPT_BY + 1e-9:
        problems.append(f'the prompt first shows at {pt * k:.1f}s; it must be on screen by {PROMPT_BY:.0f}s')
    if fmt and fmt != 'feature' and re.search(r'\bFEAT\.', src):
        problems.append('a FEAT card is only allowed in a feature / promo reel')
    if isinstance(slot, str) and SLOT_RE.fullmatch(slot):
        other = slot_taken(slot, item.get('reel'), sent_dir)
        if other is not None and item.get('replaces') != other:
            problems.append(f'slot {slot} already has reel {other}; add "replaces": {other} if this reel replaces it')
    if problems:
        raise ValueError('reels plan v2: ' + '; '.join(problems))


def slot_taken(slot, reel, sent_dir):
    """The reel already sent for this slot, or None."""
    for f in sorted(glob.glob(os.path.join(sent_dir, '*.json'))):
        try:
            m = json.load(open(f, encoding='utf8'))
        except (ValueError, OSError):
            continue
        if m.get('slot') == slot and m.get('reel') != reel:
            return m.get('reel')
    return None


def post_check(item, length, beats, voice):
    """Checks on the rendered reel. beats = content/engine/beats.py output; voice = <ep>_voice.json or None."""
    problems = []
    fmt = item.get('format')
    if fmt in FORMATS:
        name, lo, hi = FORMATS[fmt]
        if not (lo - LENGTH_SLACK) <= length <= (hi + LENGTH_SLACK):
            problems.append(f'{length:.1f}s long; a {name} reel is {lo:.0f}-{hi:.0f}s')
    if beats:
        dur = beats.get('dur') or length
        starts = [t for t in (beats.get('wordmarks') or []) if isinstance(t, (int, float))]
        if isinstance(beats.get('endcard'), (int, float)):
            starts.append(beats['endcard'])
        late = [t for t in starts if t >= dur / 2]  # the brand ending, not a wordmark in the middle
        if late:
            ending = dur - min(late)
            limit = ENDING_MAX_FEATURE if fmt == 'feature' else ENDING_MAX
            if ending > limit + 0.15:
                problems.append(f'brand ending is {ending:.1f}s; at most {limit:g}s')
        if isinstance(beats.get('endcard'), (int, float)) and fmt != 'feature':
            problems.append('endCard is only allowed in a feature / promo reel; use wordmark()')
    if voice:
        chars = sum(len(str(x[2]).strip()) for x in (voice.get('say') or []) if len(x) >= 3)
        chars += sum(len(str(x[1]).strip()) for x in (voice.get('lines') or []) if len(x) >= 2)
        if chars > VOICE_MAX_CHARS:
            problems.append(f'{chars} spoken characters; at most about {VOICE_MAX_CHARS - 20}')
    if problems:
        raise RuntimeError('reels plan v2: ' + '; '.join(problems))

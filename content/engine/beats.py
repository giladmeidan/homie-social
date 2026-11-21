# A reel's structure, for the dashboard's retention insight ("which part loses viewers: hook, buildup or payoff?").
# Read from the loaded episode page; every time is multiplied by window.STRETCH, so it matches the rendered video.
#   dur        rendered length (s)
#   scenes     [[name, t0, t1]]        the first scene change at 4 s or later is taken as the payoff (the turn)
#   endcard    start of endCard(), or null   -> the brand ending
#   wordmarks  starts of wordmark()           (a late one is the brand ending when there is no end card)
#   declared   window.BEATS = {payoff: t, outro: t} in the episode overrides both guesses (episode time, unstretched)
import json


def beats_of(pg):
    k = float(pg.evaluate("window.STRETCH||1"))
    raw = pg.evaluate("""() => ({
        dur: window.DUR,
        scenes: window.SCENES || [],
        marks: window.MARKS || [],
        declared: window.BEATS || null,
    })""")
    sc = lambda t: round(float(t) * k, 3) if isinstance(t, (int, float)) else None
    marks = raw['marks']
    ends = [sc(t) for kind, t in marks if kind == 'endCard' and isinstance(t, (int, float))]
    out = {
        'dur': sc(raw['dur']),
        'scenes': [[str(n), sc(a), sc(b)] for n, a, b in raw['scenes']],
        'endcard': min(ends) if ends else None,
        'wordmarks': sorted(sc(t) for kind, t in marks if kind == 'wordmark' and isinstance(t, (int, float))),
        'stretch': k,
    }
    d = raw['declared']
    if isinstance(d, dict):
        dd = {key: sc(d.get(key)) for key in ('payoff', 'outro') if isinstance(d.get(key), (int, float))}
        if dd:
            out['declared'] = dd
    return out


def write_beats(pg, path):
    with open(path, 'w') as f:
        json.dump(beats_of(pg), f)

#!/usr/bin/env python3
"""Saves the structure (hook / buildup / payoff timing) of reels that were sent before
render-batch started recording it, so the dashboard's retention insight can use them.

Loads each sent episode in Chromium (no rendering, a second or two each), reads its scenes,
end card and STRETCH (content/engine/beats.py) and posts them to the Worker's /api/beats.
The Worker only fills reels that have no structure yet, so running this twice is harmless.

    HOMIE_SOCIAL_URL=... ADMIN_TOKEN=... python3 scripts/backfill-beats.py
    DRY_RUN=1 python3 scripts/backfill-beats.py        # print, don't post
Runs in GitHub Actions from the "Render reels" workflow with "backfill beats" ticked.
"""
import glob, json, os, re, shutil, sys, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENGINE = os.path.join(ROOT, 'content', 'engine')
EPISODES = os.path.join(ROOT, 'content', 'episodes')
WORK = os.path.join(ROOT, 'build', 'beats-backfill')
sys.path.insert(0, ENGINE)
from beats import beats_of  # noqa: E402

DRY = os.environ.get('DRY_RUN') == '1'


def batch_items():
    items = {}
    for bf in glob.glob(os.path.join(ROOT, 'content', 'batches', '*.json')):
        try:
            for it in json.load(open(bf, encoding='utf8')).get('reels', []):
                if it.get('reel') is not None:
                    items[int(it['reel'])] = it
        except (ValueError, OSError):
            pass
    return items


def main():
    items = batch_items()
    todo = []
    for mf in sorted(glob.glob(os.path.join(ROOT, 'content', 'sent', '*.json'))):
        m = json.load(open(mf, encoding='utf8'))
        reel = int(m['reel'])
        q = str(m.get('queued_as') or '')
        if q.startswith('preview') or q == 'dry-run':
            continue  # never went to the approval queue
        it = items.get(reel, {})
        ep = it.get('episode') or f'r{reel}'
        if not os.path.exists(os.path.join(EPISODES, ep + '.js')):
            print(f'skip {reel}: no episode {ep}.js')
            continue
        rid = q if re.fullmatch(r'[a-f0-9]{6,32}', q) else None
        title = it.get('title') or it.get('name') or m.get('name')
        todo.append((reel, ep, rid, title))

    shutil.rmtree(WORK, ignore_errors=True)
    shutil.copytree(ENGINE, WORK)
    for _, ep, _, _ in todo:
        shutil.copy(os.path.join(EPISODES, ep + '.js'), WORK)

    from playwright.sync_api import sync_playwright
    out = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for reel, ep, rid, title in todo:
            pg = b.new_page(viewport={'width': 1080, 'height': 1920})
            errors = []
            pg.on('pageerror', lambda e: errors.append(str(e)))
            pg.goto('file://' + os.path.join(WORK, 'reel.html') + '?r=' + ep)
            pg.wait_for_timeout(300)
            try:
                beats = beats_of(pg)
            except Exception as e:  # one broken episode must not stop the rest
                print(f'skip {reel}: {e}')
                pg.close()
                continue
            pg.close()
            if not beats.get('dur'):
                print(f'skip {reel}: episode did not load {errors[:1]}')
                continue
            print(f'{reel} ({ep}): {beats["dur"]}s, scenes {[s[1] for s in beats["scenes"]]}, end card {beats["endcard"]}')
            out.append({**({'id': rid} if rid else {}), 'title': title, 'beats': beats})
        b.close()

    if DRY or not out:
        print(f'{len(out)} reels read' + (' (dry run, nothing posted)' if DRY else ''))
        return
    url = os.environ['HOMIE_SOCIAL_URL'].rstrip('/') + '/api/beats'
    req = urllib.request.Request(url, data=json.dumps({'items': out}).encode(), method='POST', headers={
        'authorization': 'Bearer ' + os.environ['ADMIN_TOKEN'], 'content-type': 'application/json',
        # Cloudflare blocks the default "Python-urllib" user agent with a 403 before the Worker sees it.
        'user-agent': 'homie-social-backfill/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            res = json.loads(r.read())
    except urllib.error.HTTPError as e:
        sys.exit(f'POST {url} failed: HTTP {e.code} {e.read()[:300].decode(errors="replace")}')
    print(f"posted {len(out)} reels: {res.get('updated')} updated, {res.get('skipped')} skipped as unreadable; reels that already had a structure are left as they were")
    summary = os.environ.get('GITHUB_STEP_SUMMARY')
    if summary:
        with open(summary, 'a') as f:
            f.write(f"## Beats backfill\n- {len(out)} reels read, {res.get('updated')} updated in the dashboard\n")


if __name__ == '__main__':
    main()

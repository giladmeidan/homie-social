# homie · Engine 2

A second reel engine that runs next to Engine 1 (`content/engine/`) on the same pipeline: same batch files, same checks, same Telegram approval. A reel is an HTML page animated with GSAP and rendered by [HyperFrames](https://github.com/heygen-com/hyperframes). The look is illustrated ("paper"): the brand's black, white and blue with tone, light, soft shadows, depth layers and a camera. No filmed footage.

Research and decisions: `homie/video/engine-v2/` in the homie Project.

## Using it from a batch

A batch entry builds with Engine 2 when it says `"engine": "v2"`. Left out, it is Engine 1.

```json
{
  "reel": 1041, "episode": "r1041", "name": "reel-h041-experiment-two-milks",
  "title": "ריל H41 · Experiment · שני חלבים",
  "caption": "...", "at": null,
  "engine": "v2", "format": "experiment", "slot": "2026-11-28 13"
}
```

- The episode is a folder: `content/engine2/reels/r1041/` with `index.html`, `index.motion.json`, `hyperframes.json` and `meta.json`. Copy an existing reel folder to start.
- `format` and `slot` are required, as for every plan v2 reel. A `"preview": true` entry needs no slot.
- `render-batch.py` adds `E2` to the title (`ריל H41 · Experiment · E2 · שני חלבים`). The dashboard and `content/insights.json` show titles, so the two engines can be compared. The sent marker gets `"engine": "v2"` and the look.
- The workflow sets Engine 2 up only when a waiting reel uses it. If that setup fails, Engine 1 reels in the same run still render.
- Reels numbered r9000 and up are tests: they do not count as earlier reels in the no-repeats check. `r9002` is the pilot ("יום 1. שני חלבים."), kept as the pipeline test.

## Building locally

```bash
bash content/engine2/tools_setup.sh                       # once per machine
DRY_RUN=1 python3 scripts/render-batch.py content/batches/<file>.json      # the pipeline's way
cd content/engine2 && bash build.sh reels/r9002 my-test                    # one reel, straight
```

Needs Node 22 or newer, Python 3 with pip, ffmpeg and Chrome. `build.sh` runs, in order:

1. **Base:** fonts, GSAP, `e2.js` and the grain tile are copied into the reel's `assets/base/`.
2. **Audio:** `audio/make_audio.py` opens the page in headless Chrome, reads the cues and facts the page published, and writes `assets/mix.wav`.
3. **Checks:** `hyperframes check`: lint, runtime errors, text inside the TikTok / Reels / Shorts safe area, the reel's own motion rules, contrast, audio. An error stops the build.
4. **Render:** 1080×1920, 30 fps, H.264 + AAC.
5. **File checks:** size, frame rate, length, loudness, and the ask on screen by 3 s.

The pilot builds in about 90 seconds on two CPU cores.

## What a reel must do (checked by `scripts/rules_v2.py`)

- Call `E2.publish({ id, format, dur, cover: {t, title}, prompt: {t, text}, beats: {payoff, outro}, bpm, bars, look, voice: null })`. The cover is frame 0; the prompt is on screen by 3 s; `format` matches the batch entry.
- Carry an `index.motion.json` that asserts on the rendered page that the headline is there at frame 0 and the ask by 3 s (two `appearsBy` rules). The engine fails the build when the page does not do what the file says.
- Stay inside its format's length (same table as Engine 1).
- No voice yet: a reel that publishes a `voice` is refused until the voice step exists.

## Conventions

- **Time is a beat grid.** `const g = E2.grid(100)`: `g(5)` is beat 5, `g.bar(2)` the start of bar 3, each rounded to a frame. At 100 BPM a beat is 18 frames and a bar 2.4 s. The picture changes on bar lines; hits land on beats.
- **Sound is declared next to the picture.** `E2.cue('thud', g(5))` sits on the line of the move it belongs to. The audio builder reads the cues from the page, so picture and sound cannot drift apart.
- **Titles never ride the camera.** The world (three depth layers) moves; a landed title stays still until it leaves.
- **Safe area for anything meant to be read:** 288–1248 px down, 120–888 px across, 120–780 px across below 840 px.
- **Deterministic:** no clocks, timers or unseeded random. The same reel renders the same file.
- **Brand rules are Engine 1's:** black, white, blue `#2563EB` and the mascot tints; Fredoka and Rubik; gender-neutral Hebrew; no emoji in the video; one turtle per frame.
- **HyperFrames contract:** timed elements have `class="clip"`, `data-start` and `data-duration`; one paused GSAP timeline registered at `window.__timelines["main"]`; never tween `display` or `visibility` on a `.clip` (animate a child); every `<audio>` has an id.

## Sound

Music is a short loop written as notes and played through sampled instruments from the GeneralUser GS SoundFont (free for commercial music). Effects are sampled percussion and shaped noise. The SoundFont (32 MB) is not committed: `make_audio.py` downloads one fixed commit from the author's GitHub and checks its hash. The workflow keeps it in the Actions cache.

## Files

| File | What it does |
|---|---|
| `package.json`, `package-lock.json` | Pinned: hyperframes 0.9.102, gsap 3.15.1, the two font packages |
| `tools_setup.sh` | One-time setup: packages, base files, sampler, SoundFont |
| `build.sh` | Builds one reel |
| `tools_sync.sh` | Copies the shared base into a reel (a HyperFrames project reads only its own folder) |
| `tools_check_report.py` | Short summary of `hyperframes check --json` |
| `tools_postcheck.py` | The file checks |
| `base/e2.js` | Motion helpers: beat grid, titles, acting, parallax camera, sound cues, publish |
| `audio/make_audio.py` | Music bed and sound effects from the page's cue list |
| `reels/<episode>/` | One folder per reel |

Not committed (see `.gitignore`): `node_modules/`, the copied base files (`base/fonts/`, `base/gsap.min.js`, `base/SplitText.min.js`, `base/grain.png`), the SoundFont, and each reel's build output. `tools_setup.sh` recreates the base files.

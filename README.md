# homie-social

Publishes homie reels to Instagram and drops them into TikTok as drafts. Nothing goes out without a tap on **Approve** in Telegram.

```
finished mp4 ──enqueue──▶ Worker ──▶ Telegram: video + caption + [Approve] [Edit caption] [Reject]
                                              │ Approve
                          ┌───────────────────┴───────────────────┐
                          ▼                                       ▼
   Instagram processes ──▶ published ──▶ link      TikTok upload ──▶ draft in your TikTok inbox
                                                                  ──▶ caption sent to Telegram to paste
```

Runs on Cloudflare (Worker + D1 database + R2 storage).

**Why TikTok is a draft, not a post:** TikTok only lets audited apps post publicly, and it does not audit tools that post to your own accounts. Upload mode (drafts) needs no audit. You finish each post in the TikTok app: tap the inbox notification, paste the caption, post. That step is also where you add a trending sound.

## One-time setup

### 1. Accounts (outside this repo)

1. Switch homie's Instagram to a professional account (Business or Creator).
2. At developers.facebook.com create an app, add the Instagram product, choose "Instagram API with Instagram Login".
3. Add homie's Instagram account as an Instagram Tester on the app, and accept the invite from that account.
4. Generate an access token for it with `instagram_business_basic` and `instagram_business_content_publish`.
5. In Telegram, message @BotFather, create a bot, keep its token.

### 2. Cloudflare

```bash
npm install
npx wrangler login
npx wrangler d1 create homie-social          # paste the printed database_id into wrangler.toml
npx wrangler r2 bucket create homie-social-media
npm run db:init
```

### 3. Secrets

Make up two long random strings for `ADMIN_TOKEN` and `TELEGRAM_WEBHOOK_SECRET` (`openssl rand -hex 24`).

```bash
npx wrangler secret put IG_ACCESS_TOKEN
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET
npx wrangler secret put ADMIN_TOKEN
npm run deploy                                # prints the Worker URL
```

### 4. Connect Telegram

```bash
cp .env.example .env                          # fill in the URL, ADMIN_TOKEN, bot token, webhook secret
npm run telegram:webhook
```

Send `/id` to your bot. It replies with the chat id. Then:

```bash
npx wrangler secret put TELEGRAM_CHAT_ID      # the number from /id
```

Only that chat can approve, reject or edit.

### 5. TikTok (optional; without it everything is Instagram-only)

1. At developers.tiktok.com sign in, go to **Manage apps** and create an app (Individual developer is fine).
2. Add the products **Login Kit** and **Content Posting API**. Leave **Direct Post** off.
3. Scopes: `user.info.basic` and `video.upload` for posting, plus `user.info.stats` and `video.list` for the dashboard.
4. Login Kit → Web → Redirect URI: `https://homie-social.meidan-gilad.workers.dev/tiktok/callback` (exactly).
5. Use the **Sandbox** tab: create a sandbox, add homie's TikTok account under **Target users**. Sandbox is enough for your own account; you don't have to submit the app for review.
6. Copy the sandbox **Client key** and **Client secret**, then:

```bash
npx wrangler secret put TIKTOK_CLIENT_KEY
npx wrangler secret put TIKTOK_CLIENT_SECRET
npm run db:migrate:tiktok        # once, adds the TikTok columns to the existing database
npm run deploy
```

7. Open the dashboard and click **Connect TikTok** (or go to `/dashboard/tiktok/connect`). Sign in with homie's TikTok account and allow access. Telegram confirms with "TikTok connected".

The sign-in renews itself (the access token lasts 24 hours, the refresh token a year and rolls forward). If renewal fails you get a Telegram message; clicking **Connect TikTok** again fixes it.

## Daily use

```bash
# caption taken from captions-log.md by reel number
npm run enqueue -- ~/rent_app/rent-app/homie/video/series-engine/export/reel-44.mp4 --reel 44

# publish at a set time (your Mac's local time) instead of right after approval
npm run enqueue -- reel.mp4 --reel 44 --at "2026-11-21 19:00"

# caption from a file or inline
npm run enqueue -- reel.mp4 --caption-file caption.txt --title "Turtle ep 3"

# Instagram only, no TikTok draft
npm run enqueue -- reel.mp4 --reel 44 --no-tiktok
```

In Telegram:

| Action | What happens |
| --- | --- |
| ✅ Approve | Publishes to Instagram and sends the TikTok draft, now or at the scheduled time |
| ✏️ Edit caption | Your next message becomes the caption, then it asks for approval again |
| ❌ Reject | Nothing is posted |
| 🔁 Retry | Shown when a publish failed |
| 🔁 Retry TikTok | Shown when the TikTok draft failed. Instagram is not touched |
| `/queue` | Lists recent reels and their status |
| `/cancel` | Leaves caption editing |

## Automatic reels (GitHub Actions)

The nightly reel task writes the episodes and captions and pushes them here. GitHub renders them and sends each one to the Telegram bot, so the first you see of a reel is the approval message.

```
nightly task ──push──▶ content/episodes/rNN.js + content/batches/<date>.json
                         │ .github/workflows/render-reels.yml
                         ▼
          render (Chromium + ffmpeg) ─▶ checks ─▶ enqueue ─▶ Telegram: Approve / Edit / Reject
```

- **Render engine:** `content/engine/` (same files as the series engine in the Project, fonts included). Episodes in `content/episodes/`.
- **Batch file:** `content/batches/<date>.json` lists the reels with their caption, title and optional publish time (`"at": "2026-11-21 19:00"`, Israel time). Format at the top of `scripts/render-batch.py`.
- **Checks before sending:** 1080×1920, 30 fps, audio present, length matches the episode, loudness and no clipping (series bible section 4). A reel that fails is not sent.
- **No exact repeats:** a reel is refused if its episode file is identical to an earlier one (ignoring spacing and the audio seed) or its caption opens with the same line as an earlier caption in `content/batches/`.
- **No double sends:** a sent reel gets `content/sent/<reel>.json`, committed back by the workflow, and is never rendered again. A failed one gets `content/failed/<reel>.json` and is skipped until you run the workflow by hand with **Retry failed** ticked.
- **When something fails** the bot posts a message in your approval chat with a link to the run.
- **Videos** stay downloadable as a run artifact for 14 days.

Repo secrets (Settings → Secrets and variables → Actions): `HOMIE_SOCIAL_URL`, `ADMIN_TOKEN` (same values as `.env`), and for failure alerts `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

Run locally: `npm run render` (add `DRY_RUN=1` in front to render and check without sending).

## Voiceover (ElevenLabs, optional)

An episode gets a Hebrew voiceover by setting `window.VOICE={}` and marking the main titles to read with
`say:true` (format at the top of `content/engine/voice.py`). The voice reads exactly those words, when they
appear; everything else on screen stays unread. `python3 voice.py rNN --estimate` checks the fit for free. On render, `voice.py` makes one clip per
line, places it at its time (speeding it up by at most x1.25 if it runs into the next line, else
the reel fails with the line to shorten), ducks the music under it and sets loudness to -18.5 dB.
Clips are cached in the Actions cache, so a re-render costs no credits.

- Secret `ELEVENLABS_API_KEY`. Optional repo variable `ELEVENLABS_VOICE_ID` (default: premade "Sarah").
- Without the secret, voiced reels are skipped as "waiting" (no marker) and render on the next run after it is added.
- **Licensing (Starter plan since 20.11.2026, `ELEVENLABS_LICENSED=1`):** clips made on the free plan are never reused (the plan is part of the cache key), and a key that is back on the free plan stops voiced renders. Before that: the free ElevenLabs plan has no commercial license, so voiced reels are sent to Telegram as a
  plain preview (no Approve button) and never enter the posting queue. Set the repo variable
  `ELEVENLABS_LICENSED=1` only after moving to a paid plan; from then on voiced reels go to approval like any other.
- Actions > Render reels > Run workflow > "voice_check" prints the plan, characters left and which models list Hebrew.
- "voice_audition": `mine` (your My Voices) or voice ids, comma separated. Sends the same line in each voice to Telegram.
- `window.STRETCH=1.12` plays any reel 12% slower (all times scaled in `render.py`).
- Test reel: 9001 (`content/batches/test-voice-2026-11-20.json`), reel H14 with a voiceover.

## How it behaves

- **Publishing takes a minute or two.** After approval Instagram downloads and processes the video; a job that runs every minute publishes it when ready.
- **No double posts.** Each step is claimed in the database before it runs, so a double tap or overlapping runs cannot post twice.
- **Failures are reported, not retried silently.** If a publish call fails or is interrupted, you get a message with a Retry button. When the message says to check Instagram first, do: the post may have gone through.
- **The Instagram token renews itself** weekly (it lasts 60 days). If renewal fails you get a Telegram message. Setting a new `IG_ACCESS_TOKEN` secret always takes over.
- **TikTok and Instagram are independent.** Each has its own status; a TikTok failure never blocks or repeats the Instagram post, and the other way round.
- **Older reels can go to TikTok too.** In the dashboard's Publishing queue, each reel already published on Instagram has a **Send to TikTok** button. It sends a TikTok draft only and never posts to Instagram again.
- **TikTok holds at most 5 waiting drafts per 24 hours.** With the hourly reels, post or delete drafts as they arrive; a sixth one fails with a message saying so, and Retry TikTok works once you've cleared some.
- **Videos are served from `/media/<random name>.mp4`** so Instagram can fetch them. The names are unguessable, but anyone holding a link can watch that video.


## Dashboard

```bash
npm run dashboard     # opens it and copies the admin key for the sign-in box
```

`https://homie-social.meidan-gilad.workers.dev/dashboard`, signed in with `ADMIN_TOKEN` (lasts 30 days). Every page has a **24h / 7d / 30d / All** switch, and every number has an ⓘ that explains it in one sentence. A glossary sits at the bottom of each page.

| Page | What it answers |
| --- | --- |
| **Overview** | How is it going? A plain-language summary (views, best reel, watch time, followers, posting pace), one card per platform, total views over time for both, and the top reels of the period. |
| **Instagram** / **TikTok** | Which reels beat my usual? Views gained, followers, typical reel, engagement, the latest reels against the typical-reel line, views and followers over time, and a searchable, sortable table with a 48-hour trend per reel. Instagram also has **Where viewers drop off**: the average reel's retention curve split into hook, buildup and payoff, with the weakest link named (see below). |
| **Reel page** (click any Instagram reel) | The story of one reel: how its first day compared, reach vs plays, watch time, engagement, rank, views hour by hour, caption. |
| **System** | Is everything running? Health checks for the scheduler, Instagram stats, the Instagram connection (publishing quota and API budget), TikTok (sign-in, drafts used of 5 per day), Telegram (webhook) and the queue, plus an activity log of approvals, publishes, failures and stats problems. |

**How reels are compared.** Older reels have had more time to collect views, so totals favour them. Each reel is compared by its **first-day views** (views at the last hourly measurement within 24 hours of posting) against your **typical reel**: the median first-day views of your reels from the last 30 days. Reels under a day old show as *new* until their first day ends. The typical reel appears once three reels are a day old.

**Collection.** Hourly, or on demand with **Refresh**. All posts are read (up to 250 Instagram, 200 TikTok). Instagram reels under 2 days old are measured every hour, up to 14 days every 6 hours, older ones daily. That keeps the run well inside Meta's API budget, which the System page shows. Snapshots and the activity log are kept for 90 days. If Instagram rejects a newer metric name, the collector falls back to the core set (views, reach, likes, comments, shares, saves).

**Where viewers drop off (retention).** Instagram's API doesn't share the per-second retention graph (only the app shows it, per reel), so the dashboard estimates the curve of your *average* reel. Inputs per reel: average watch time, skip rate (`reels_skip_rate`, the share of plays gone in the first 3 seconds; empty for low-view reels) and the reel's structure, saved at render time from its episode (`content/engine/beats.py`): **hook** = 0–3 s, **buildup** = 3 s to the first scene change at 4 s or later, **payoff** = from there to the end card, **brand ending** = end card to the end. An episode can set `window.BEATS={payoff:t,outro:t}` (episode time) to say it exactly. The model gives each phase one steady leave rate, shared by all reels, and fits the four rates so every reel's predicted average watch time and 3-second survival match Instagram's numbers (`src/retention.js`). Weakest link: the hook if it loses half the viewers or more; otherwise the phase that loses the largest share of its remaining viewers per second (the brand ending is shown, not judged). Needs 4 reels with watch time and a structure in the selected range; it says "early estimate" under 10. Watch time past a reel's length (replays) is capped. Per-pillar results appear for pillars with 4+ reels. Reels sent before this existed: run the **Render reels** workflow once with **backfill beats** ticked.

**Upgrading an existing database** (once, before deploying this version): `npm run db:migrate:insights`, then `npm run db:migrate:beats` (adds `reels.beats`; run it **before** `npm run deploy`, because the new Worker writes that column). It adds first-day views, a running total of views and the activity log, and backfills first-day views from the snapshots already collected.

## Development

```bash
npm test          # pipeline logic against fake Instagram / Telegram / database
npm run logs      # live logs from the deployed Worker
```

| File | Role |
| --- | --- |
| `src/pipeline.js` | Reel lifecycle, Telegram commands, token renewal. No platform code. |
| `src/instagram.js` | Instagram API calls |
| `src/tiktok.js` | TikTok upload, status, stats calls, sign-in and token renewal |
| `src/tiktok-stats.js` | Hourly TikTok stats collection, views history and first-day views |
| `src/telegram.js` | Telegram API calls |
| `src/store.js` | D1 queries |
| `src/index.js` | Worker: HTTP routes, media hosting, webhook, cron, dashboard auth |
| `src/stats.js` | Hourly Instagram stats collection |
| `src/insights.js` | Typical reel, first-day comparisons, ranges and the plain-language summary |
| `src/retention.js` | Estimated retention curve: hook / buildup / payoff and the weakest link |
| `src/health.js` | System page health checks |
| `src/dashboard.js` | Dashboard pages (server-rendered HTML, no outside scripts) |
| `scripts/enqueue.mjs` | Queue a reel from your Mac (also used by the workflow) |
| `scripts/render-batch.py` | Render, check and enqueue the reels in `content/batches/` |
| `scripts/backfill-beats.py` | Saves the structure of reels sent before it was recorded (workflow: *backfill beats*) |
| `content/engine/beats.py` | Reads a reel's structure (scenes, end card, stretch) at render time |
| `scripts/notify-failures.mjs` | Telegram alert when the workflow could not send a reel |
| `.github/workflows/render-reels.yml` | Runs the above on every pushed batch |
| `schema.sql` | Database tables |
| `migrations/001-tiktok.sql` | Adds the TikTok columns to a database made before TikTok |
| `migrations/002-insights.sql` | Dashboard v2: first-day views, total views, activity log |
| `migrations/003-beats.sql` | Retention insight: each reel's structure |

## Not verified yet

The TikTok calls follow TikTok's Content Posting API docs (upload mode) but have not run against the real API. The first approved reel after connecting is the test.

The Instagram calls follow Meta's documentation but have not run against the real API; the first real reel is the test. The token kind decides the API: an `EAA...` business (system-user) token goes to `graph.facebook.com` with `IG_USER_ID` (already set to homie.il) and never expires; an `IGAA...` Instagram Login token goes to `graph.instagram.com` and is renewed weekly.

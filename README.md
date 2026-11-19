# homie-social

Publishes homie reels to Instagram. Nothing goes live without a tap on **Approve** in Telegram.

```
finished mp4 ──enqueue──▶ Worker ──▶ Telegram: video + caption + [Approve] [Edit caption] [Reject]
                                              │ Approve
                                              ▼
                              Instagram processes the video ──▶ published ──▶ link sent to Telegram
```

Runs on Cloudflare (Worker + D1 database + R2 storage). TikTok and the stats dashboard are not built yet.

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

## Daily use

```bash
# caption taken from captions-log.md by reel number
npm run enqueue -- ~/rent_app/rent-app/homie/video/series-engine/export/reel-44.mp4 --reel 44

# publish at a set time (your Mac's local time) instead of right after approval
npm run enqueue -- reel.mp4 --reel 44 --at "2026-11-21 19:00"

# caption from a file or inline
npm run enqueue -- reel.mp4 --caption-file caption.txt --title "Turtle ep 3"
```

In Telegram:

| Action | What happens |
| --- | --- |
| ✅ Approve | Publishes now, or at the scheduled time |
| ✏️ Edit caption | Your next message becomes the caption, then it asks for approval again |
| ❌ Reject | Nothing is posted |
| 🔁 Retry | Shown when a publish failed |
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
- **No double sends:** a sent reel gets `content/sent/<reel>.json`, committed back by the workflow, and is never rendered again. A failed one gets `content/failed/<reel>.json` and is skipped until you run the workflow by hand with **Retry failed** ticked.
- **When something fails** the bot posts a message in your approval chat with a link to the run.
- **Videos** stay downloadable as a run artifact for 14 days.

Repo secrets (Settings → Secrets and variables → Actions): `HOMIE_SOCIAL_URL`, `ADMIN_TOKEN` (same values as `.env`), and for failure alerts `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

Run locally: `npm run render` (add `DRY_RUN=1` in front to render and check without sending).

## How it behaves

- **Publishing takes a minute or two.** After approval Instagram downloads and processes the video; a job that runs every minute publishes it when ready.
- **No double posts.** Each step is claimed in the database before it runs, so a double tap or overlapping runs cannot post twice.
- **Failures are reported, not retried silently.** If a publish call fails or is interrupted, you get a message with a Retry button. When the message says to check Instagram first, do: the post may have gone through.
- **The Instagram token renews itself** weekly (it lasts 60 days). If renewal fails you get a Telegram message. Setting a new `IG_ACCESS_TOKEN` secret always takes over.
- **Videos are served from `/media/<random name>.mp4`** so Instagram can fetch them. The names are unguessable, but anyone holding a link can watch that video.


## Dashboard

```bash
npm run dashboard     # opens it and copies the admin key for the sign-in box
```

`https://homie-social.meidan-gilad.workers.dev/dashboard` shows followers (with a 7-day change), total and average reel views, engagement rate (interactions ÷ reach), average watch time, views by reel, a 30-day follower trend, a sortable table of every reel on the account (including ones posted by hand), and the publishing queue.

Stats are collected hourly by the cron job, or on demand with **Refresh stats now**. Snapshots are kept for 90 days. Sign-in uses `ADMIN_TOKEN` and lasts 30 days. If Instagram rejects one of the newer metric names, the collector falls back to the core set (views, reach, likes, comments, shares, saves) so the dashboard keeps working.

## Development

```bash
npm test          # pipeline logic against fake Instagram / Telegram / database
npm run logs      # live logs from the deployed Worker
```

| File | Role |
| --- | --- |
| `src/pipeline.js` | Reel lifecycle, Telegram commands, token renewal. No platform code. |
| `src/instagram.js` | Instagram API calls |
| `src/telegram.js` | Telegram API calls |
| `src/store.js` | D1 queries |
| `src/index.js` | Worker: HTTP routes, media hosting, webhook, cron, dashboard auth |
| `src/stats.js` | Hourly stats collection and dashboard numbers |
| `src/dashboard.js` | Dashboard and sign-in pages (server-rendered HTML) |
| `scripts/enqueue.mjs` | Queue a reel from your Mac (also used by the workflow) |
| `scripts/render-batch.py` | Render, check and enqueue the reels in `content/batches/` |
| `scripts/notify-failures.mjs` | Telegram alert when the workflow could not send a reel |
| `.github/workflows/render-reels.yml` | Runs the above on every pushed batch |
| `schema.sql` | Database tables |

## Not verified yet

The Instagram calls follow Meta's documentation but have not run against the real API; the first real reel is the test. The token kind decides the API: an `EAA...` business (system-user) token goes to `graph.facebook.com` with `IG_USER_ID` (already set to homie.il) and never expires; an `IGAA...` Instagram Login token goes to `graph.instagram.com` and is renewed weekly.

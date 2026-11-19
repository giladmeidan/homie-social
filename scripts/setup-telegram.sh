#!/usr/bin/env bash
# One-time setup: creates the admin + webhook secrets, stores the Telegram bot token,
# and points the bot at the Worker. Nothing secret is printed.
#   bash scripts/setup-telegram.sh
set -euo pipefail
cd "$(dirname "$0")/.."

URL="https://homie-social.meidan-gilad.workers.dev"
touch .env

setenv() {  # setenv KEY VALUE  -> writes/replaces KEY=VALUE in .env
  grep -v "^$1=" .env > .env.tmp || true
  printf '%s=%s\n' "$1" "$2" >> .env.tmp
  mv .env.tmp .env
}

read -rsp "Paste the Telegram bot token from @BotFather (hidden): " BOT; echo
[ -n "$BOT" ] || { echo "No token given."; exit 1; }

ADMIN=$(openssl rand -hex 24)
HOOK=$(openssl rand -hex 24)

printf '%s' "$BOT"   | npx wrangler secret put TELEGRAM_BOT_TOKEN
printf '%s' "$ADMIN" | npx wrangler secret put ADMIN_TOKEN
printf '%s' "$HOOK"  | npx wrangler secret put TELEGRAM_WEBHOOK_SECRET

setenv HOMIE_SOCIAL_URL "$URL"
setenv ADMIN_TOKEN "$ADMIN"
setenv TELEGRAM_BOT_TOKEN "$BOT"
setenv TELEGRAM_WEBHOOK_SECRET "$HOOK"
grep -q '^CAPTIONS_LOG=' .env || setenv CAPTIONS_LOG "$HOME/rent_app/rent-app/homie/marketing/captions-log.md"
chmod 600 .env

node scripts/telegram-webhook.mjs
echo
echo "Now open your bot in Telegram, press Start, and send /id."
echo "Then run:  npx wrangler secret put TELEGRAM_CHAT_ID   (paste the number it replied with)"

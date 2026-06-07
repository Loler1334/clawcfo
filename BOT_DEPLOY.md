# Telegram bot — deploy to Railway

The bot **must run 24/7** to answer messages on Telegram. Running it only on your PC (`npm run dev:bot`) means it stops when you close the terminal — that is why `@my_mantle_cfo_bot` does not respond.

## Railway setup (one-time)

1. In Railway → **New Service** → same GitHub repo `clawcfo`
2. Rename service to `clawcfo-bot`
3. **Settings → Build**:
   - Builder: **Dockerfile**
   - Dockerfile path: `Dockerfile.bot`
   - Root directory: `/` (repo root)
4. **Variables**:
   ```
   TELEGRAM_BOT_TOKEN=your_token_from_BotFather
   AGENT_API_URL=https://personal-cfoagent-production.up.railway.app
   TELEGRAM_BOT_USERNAME=my_mantle_cfo_bot
   ```
5. **Deploy** — no public domain needed (bot uses long polling, not HTTP)

## Test

Open Telegram → search `@my_mantle_cfo_bot` → `/start`

You should see the welcome menu with Add Rule / Run Agent buttons.

## Local dev (optional)

```bash
# In .env at repo root:
TELEGRAM_BOT_TOKEN=...
AGENT_API_URL=https://personal-cfoagent-production.up.railway.app

npm run dev:bot
```

Only use local dev for testing — production users need the Railway service.

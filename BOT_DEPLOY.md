# Telegram bot — deploy to Railway

The bot **must run 24/7** to answer messages on Telegram. Running it only on your PC (`npm run dev:bot`) means it stops when you close the terminal — that is why `@my_mantle_cfo_bot` does not respond.

## Where to add a new service in Railway

1. Open **https://railway.app** and log in
2. Click your **project** (the one where `clawcfo-agent` / agent already lives)
3. You land on the **Project canvas** — a dark board with boxes (your existing service)
4. Add a second service using **one** of these:

| Where to click | What to choose |
|----------------|----------------|
| **+ Create** button (top-right corner of the canvas) | **GitHub Repo** → select `clawcfo` |
| **New** button (same place, Railway sometimes renames it) | **GitHub Repo** → select `clawcfo` |
| **Right-click** on empty space on the canvas | **Create** → **Empty Service** or **GitHub Repo** |
| Keyboard: **Ctrl+K** (Windows) or **Cmd+K** (Mac) | Type `new service` → pick **Empty Service** or **GitHub Repo** |

> **Can't find + Create?** Make sure you opened the **project**, not a single service. Click the project name in the top-left breadcrumb (e.g. `personal-cfo` → back to canvas).

5. After the new box appears, click it → **Settings** (gear) → rename to `clawcfo-bot`

## Configure the bot service

**Settings → Source** (if you used Empty Service):
- Connect **GitHub Repo** → `Loler1334/clawcfo` (same repo as agent)
- Branch: `main`

**Settings → Build**:
- Builder: **Dockerfile**
- Dockerfile path: `Dockerfile.bot`
- Root directory: `/` (repo root, NOT `packages/bot`)

**Variables** tab:
```
TELEGRAM_BOT_TOKEN=your_token_from_BotFather
AGENT_API_URL=https://personal-cfoagent-production.up.railway.app
TELEGRAM_BOT_USERNAME=my_mantle_cfo_bot
```

**Deploy** — no public domain needed (bot uses long polling, not HTTP)

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

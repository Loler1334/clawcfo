# ClawCFO - Full Testnet Deployment Guide

Complete checklist: public site, live agent, Mantle Sepolia logs, real Byreal swaps.

---

## Current status

| Item | Status |
|------|--------|
| Mantle Sepolia contract | `0xa1Bc3e7906e99878bBa45941677d803E6eE7cd2c` |
| On-chain logging | Working |
| Demo mode (simulation) | `SIMULATION_MODE=true` |
| Public URL | Not yet - follow steps below |

---

## Part 1 - GitHub (15 min)

```bash
cd C:\Users\Руслан\Projects\personal-cfo-claw
git add .
git commit -m "ClawCFO: autonomous on-chain wealth manager"
```

Create repo at https://github.com/new (name: `clawcfo`), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/clawcfo.git
git branch -M main
git push -u origin main
```

**Never push `.env`** - it is in `.gitignore`.

---

## Part 2 - Agent API on Railway (30 min)

1. Go to https://railway.app - sign up with GitHub
2. **New Project** -> **Deploy from GitHub repo** -> select `clawcfo`
3. Settings -> **Root Directory** leave empty (uses Dockerfile at root)
4. **Variables** tab - add:

```
MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
AGENT_PRIVATE_KEY=your_mantle_private_key
AGENT_CFO_CONTRACT_ADDRESS=0xa1Bc3e7906e99878bBa45941677d803E6eE7cd2c
SIMULATION_MODE=true
TELEGRAM_BOT_TOKEN=your_bot_token
ALLOWED_ORIGINS=https://YOUR-APP.vercel.app
```

5. Deploy -> copy public URL e.g. `https://clawcfo-agent.up.railway.app`
6. Test: open `https://YOUR-URL/health` - should show `{"ok":true}`

### Run Telegram bot (optional, on your PC)

Bot connects to Railway agent. In `.env`:

```
AGENT_API_PORT=3847
```

Change bot `apiBase` to Railway URL, or run bot on Railway as second service.

Simplest: keep bot on your PC pointing to Railway:

Edit `packages/bot/src/index.ts` line with apiBase to use env:

```
AGENT_API_URL=https://clawcfo-agent.up.railway.app
```

---

## Part 3 - Website on Vercel (20 min)

1. Go to https://vercel.com - sign up with GitHub
2. **Add New Project** -> import `clawcfo`
3. **Root Directory:** `packages/web`
4. **Environment Variables:**

```
NEXT_PUBLIC_AGENT_API=https://clawcfo-agent.up.railway.app
NEXT_PUBLIC_CONTRACT_ADDRESS=0xa1Bc3e7906e99878bBa45941677d803E6eE7cd2c
```

5. Deploy -> get URL e.g. `https://clawcfo.vercel.app`
6. Go back to Railway -> update `ALLOWED_ORIGINS` with your Vercel URL -> redeploy

---

## Part 4 - Verify contract on Mantle Sepolia (10 min)

1. Open https://sepolia.mantlescan.xyz/address/0xa1Bc3e7906e99878bBa45941677d803E6eE7cd2c
2. Click **Verify and Publish**
3. Compiler: `0.8.24`, Optimization: Yes, Runs: 200, Via IR: Yes
4. Paste source from `contracts/contracts/PersonalCFORegistry.sol`
5. Submit

---

## Part 5 - Live swaps via Byreal (Level 2)

### Install Byreal CLI on Railway

Add to Dockerfile or run locally first to test:

```bash
npm install -g @byreal-io/byreal-cli-realclaw
byreal-cli --version
```

### Solana wallet (Phantom)

1. Install Phantom: https://phantom.app/
2. Create wallet - copy **public address** (not private key)
3. Fund with small amount of SOL + USDC on Solana mainnet (Byreal is mainnet DEX)

### Enable live mode

On Railway variables:

```
SIMULATION_MODE=false
BYREAL_WALLET_ADDRESS=your_phantom_public_address
BYREAL_CLI_PATH=byreal-cli
```

**Note:** Byreal executes on Solana. Mantle Sepolia still handles audit logs.

---

## Part 6 - Demo video (2+ min)

Record screen showing:

1. Open `https://clawcfo.vercel.app`
2. Connect Phantom + MetaMask
3. Activate a strategy
4. Run Agent Now
5. Show activity log
6. Open Mantlescan - show on-chain transaction
7. (Optional) Telegram bot `/run`

---

## Part 7 - DoraHacks submission

1. https://dorahacks.io/hackathon/mantleturingtesthackathon2026/detail
2. **Submit BUIDL**
3. Fill in:

| Field | Value |
|-------|-------|
| Project name | ClawCFO |
| Tagline | Autonomous on-chain wealth manager |
| GitHub | your repo URL |
| Demo URL | Vercel URL |
| Contract | `0xa1Bc3e7906e99878bBa45941677d803E6eE7cd2c` |
| Track | Agentic Wallets & Economy |
| Video | YouTube/Loom link |

**One-line pitch:**
> AI personal CFO that autonomously manages your crypto portfolio via Byreal Skills, with every decision permanently logged on Mantle.

---

## Quick test locally before deploy

```bash
# Terminal 1
npm run dev:agent

# Terminal 2
npm run dev:web

# Terminal 3
npm run dev:bot
```

Open http://localhost:3000

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Site shows "Agent offline" | Check Railway URL in `NEXT_PUBLIC_AGENT_API` |
| CORS error | Add Vercel URL to `ALLOWED_ORIGINS` on Railway |
| Bot silent | Agent must be reachable at public URL |
| Swaps fail | Keep `SIMULATION_MODE=true` until Phantom funded + CLI installed |

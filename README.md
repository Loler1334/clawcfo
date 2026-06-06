# Personal CFO Agent 🦞

> **One-line pitch:** AI personal CFO that autonomously manages your crypto portfolio via Byreal Skills, with every decision permanently logged on Mantle.

**Hackathon:** [Mantle Turing Test Hackathon 2026](https://dorahacks.io/hackathon/mantleturingtesthackathon2026/detail)  
**Track:** Agentic Wallets & Economy (Byreal / RealClaw)

---

## What it does

1. You set simple financial rules (e.g. "move 20% USDC → mSOL every week")
2. The **CFO Agent** monitors your wallet via **Byreal Agent Skills**
3. When a rule triggers, the agent executes swaps autonomously
4. Every decision is **logged on-chain** on Mantle via `PersonalCFORegistry` smart contract
5. Control via **Telegram bot** or **Web dashboard**

## Architecture

```
User (Telegram / Web)
        │
        ▼
  Agent API (Node.js)
   ├── CFO Engine (rule evaluation)
   ├── Byreal CLI (Solana DeFi execution)
   └── Mantle Logger (on-chain audit trail)
        │
        ▼
  PersonalCFORegistry.sol (Mantle Sepolia)
```

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` — minimum for demo:

```env
SIMULATION_MODE=true
AGENT_API_PORT=3847
```

For full hackathon submission, also set:

```env
AGENT_PRIVATE_KEY=your_mantle_wallet_private_key
AGENT_CFO_CONTRACT_ADDRESS=0x...after_deploy
TELEGRAM_BOT_TOKEN=from_@BotFather
```

### 3. Compile & deploy smart contract (Mantle Sepolia)

Get testnet MNT from [Mantle Sepolia Faucet](https://faucet.testnet.mantle.xyz/).

```bash
cd contracts
npm install
npm run compile
npm run deploy
```

Copy the contract address to `.env`:

```env
AGENT_CFO_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

Verify on explorer:

```bash
npm run verify
```

### 4. Run the agent

```bash
# Terminal 1 — Agent API
npm run dev:agent

# Terminal 2 — Web dashboard
npm run dev:web
# Open http://localhost:3000

# Terminal 3 (optional) — Telegram bot
npm run dev:bot
```

### 5. Demo flow

1. Open http://localhost:3000
2. Click **"+ Добавить"** on "Weekly Rebalance" template
3. Click **"▶ Запустить агента"**
4. See the decision in the log (simulated swap + on-chain log if contract deployed)

## Rule Templates

| Template | What it does |
|----------|-------------|
| `weekly_rebalance` | Move X% of token A → token B when balance > minimum |
| `dip_buy` | Buy token when price drops X% |
| `take_profit` | Sell X% when token gains Y% |

## Hackathon Submission Checklist

- [x] Open-source GitHub repo with README
- [x] Runnable demo (web dashboard + agent API)
- [x] Smart contract on Mantle (`PersonalCFORegistry.sol`)
- [x] AI-powered on-chain trigger (`triggerAgentEvaluation()`)
- [x] Byreal Agent Skills integration (swap execution)
- [x] One-line pitch (see top)
- [ ] Deploy contract to Mantle Sepolia + verify
- [ ] Public frontend URL (Vercel)
- [ ] Demo video (≥ 2 min)
- [ ] Submit BUIDL on DoraHacks
- [ ] Register ERC-8004 agent identity

## Byreal / RealClaw Integration

For live (non-simulation) mode:

```bash
npm install -g @byreal-io/byreal-cli-realclaw
```

```env
SIMULATION_MODE=false
BYREAL_WALLET_ADDRESS=your_solana_address
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/status` | Agent status |
| GET | `/templates` | Rule templates |
| GET | `/rules` | Active rules |
| POST | `/rules` | Create rule `{ "type": "weekly_rebalance" }` |
| POST | `/run` | Trigger evaluation cycle |
| GET | `/decisions` | Decision history |

## Telegram Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome |
| `/status` | Agent status |
| `/templates` | Available rule templates |
| `/addrule` | Add a rule (inline buttons) |
| `/rules` | List your rules |
| `/run` | Run agent now |
| `/history` | Recent decisions |

## Tech Stack

- **Smart Contract:** Solidity 0.8.24 + Hardhat (Mantle Sepolia)
- **Agent:** Node.js + TypeScript + Express
- **DeFi:** Byreal Agent Skills CLI (Solana CLMM)
- **Bot:** Telegraf (Telegram)
- **Frontend:** Next.js 15 + React 19

## License

MIT

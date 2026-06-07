# ClawCFO — чеклист хакатона

**Трек:** Agentic Economy (Byreal / RealClaw)  
**Дедлайн:** 15 июня 2026, 15:59  
**Осталось:** ~8 дней

Подробности деплоя — `DEPLOY.md`, бот — `BOT_DEPLOY.md`.

---

## Уровень 1 — обязательно для сабмита

### Инфраструктура

- [x] **GitHub** — код залит, `.env` не в репо  
  → https://github.com/Loler1334/clawcfo
- [x] **Railway — агент** — работает (`/health` → ok)  
  → https://personal-cfoagent-production.up.railway.app
- [x] **Vercel — сайт** — публично доступен  
  → https://clawcfo-web.vercel.app
- [x] **NEXT_PUBLIC_AGENT_API** — на Vercel указан URL Railway
- [x] **ALLOWED_ORIGINS** — на Railway указан URL Vercel
- [ ] **Сайт показывает Demo, не Offline** — откройте сайт и проверьте Agent Status

### On-chain (Mantle)

- [x] **Контракт задеплоен** на Mantle Sepolia  
  → `0xa1Bc3e7906e99878bBa45941677d803E6eE7cd2c`
- [x] **Контракт верифицирован** на Mantlescan (Exact Match)
- [x] **AI-функция on-chain** — `triggerAgentEvaluation()`, `createRule()`, `logDecision()`
- [x] **On-chain proof на сайте** — транзакции видны в разделе On-Chain Proof

### Продукт

- [x] **Сайт ClawCFO** — английский, Connect Wallet, стратегии, Run Agent
- [x] **Telegram-бот** — `@my_mantle_cfo_bot` отвечает (локально или Railway)
- [ ] **Бот 24/7 на Railway** — отдельный сервис `clawcfo-bot` + `Dockerfile.bot`
- [x] **Byreal / RealClaw** — интеграция в агенте (demo mode + CLI)
- [x] **README** — архитектура, setup, pitch

### Сабмит на DoraHacks

- [ ] **Demo video** ≥ 2 минуты (YouTube / Loom)
- [ ] **Submit BUIDL** на DoraHacks
- [ ] **ERC-8004** — зарегистрировать identity агента на Mantle mainnet *(требование трека Agentic Economy)*

---

## Уровень 2 — опционально (живые свопы, не для демо)

- [x] **Byreal CLI** установлен
- [ ] **Phantom** + SOL/USDC на Solana mainnet
- [ ] Railway: `SIMULATION_MODE=false`
- [ ] Railway: `BYREAL_WALLET_ADDRESS` = ваш Phantom
- [ ] Протестировать реальный swap

> Для прохождения хакатона **не обязательно** — demo mode достаточно.

---

## Уже готово (не трогать)

- [x] Docker + Railway config (агент)
- [x] Dockerfile.bot (для Telegram)
- [x] Настраиваемые стратегии на сайте
- [x] Человекочитаемые подписи On-Chain Proof
- [x] Connect Wallet (Phantom + MetaMask) — UI для демо

---

## Ваши ссылки

| Что | URL |
|-----|-----|
| GitHub | https://github.com/Loler1334/clawcfo |
| Сайт (Vercel) | https://clawcfo-web.vercel.app |
| Агент (Railway) | https://personal-cfoagent-production.up.railway.app |
| Контракт | https://sepolia.mantlescan.xyz/address/0xa1Bc3e7906e99878bBa45941677d803E6eE7cd2c |
| Telegram | https://t.me/my_mantle_cfo_bot |
| Demo video | *(заполнить после записи)* |
| DoraHacks BUIDL | *(заполнить после сабмита)* |

---

## Сценарий для demo video (2–3 мин)

1. Открыть https://clawcfo-web.vercel.app
2. Connect Wallet (Phantom + MetaMask)
3. Strategies → Customize → Activate Strategy
4. Run Agent Now → показать Activity
5. On-Chain Proof → Verify на Mantlescan
6. Telegram → `/start` → Add Rule → Run Agent
7. Одна фраза: *«Every decision logged on Mantle»*

---

## Текст для Submit BUIDL

| Поле | Значение |
|------|----------|
| Project name | ClawCFO |
| Tagline | Autonomous on-chain wealth manager |
| Track | Agentic Economy |
| GitHub | https://github.com/Loler1334/clawcfo |
| Demo URL | https://clawcfo-web.vercel.app |
| Contract | `0xa1Bc3e7906e99878bBa45941677d803E6eE7cd2c` |
| One-line pitch | AI personal CFO that autonomously manages your crypto portfolio via Byreal Skills, with every decision permanently logged on Mantle. |

**Что написать в описании:**
- Используем **Byreal Agent Skills** (swap execution) + **RealClaw** (agent framework)
- **Mantle Sepolia** — audit log (`PersonalCFORegistry`)
- Управление: **Web + Telegram**
- Demo = simulation mode; production roadmap = per-wallet non-custodial

---

## Что осталось сделать (приоритет)

| # | Задача | Время | Критичность |
|---|--------|-------|-------------|
| 1 | Проверить сайт: статус **Demo**, не Offline | 2 мин | 🔴 |
| 2 | Записать **demo video** 2+ мин | 30–60 мин | 🔴 |
| 3 | **Submit BUIDL** на DoraHacks | 20 мин | 🔴 |
| 4 | Задеплоить **бота на Railway** 24/7 | 15 мин | 🟡 |
| 5 | **ERC-8004** identity на Mantle mainnet | 30–60 мин | 🟡 |
| 6 | Живые свопы (Level 2) | — | ⚪ опционально |

**Минимум для успешного сабмита:** пункты 1 + 2 + 3.  
**Для трека Agentic Economy + Deployment Award:** добавить 4 + 5.

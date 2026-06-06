# ClawCFO - ваш чеклист «всё»

Отмечайте по мере выполнения. Подробности в `DEPLOY.md`.

## Уровень 1 - публичный продукт (обязательно)

- [ ] **GitHub** - залить код (без `.env`)
- [ ] **Railway** - задеплоить агент (Dockerfile готов)
- [ ] **Vercel** - задеплоить сайт (`packages/web`)
- [ ] **ALLOWED_ORIGINS** - на Railway указать URL Vercel
- [ ] **NEXT_PUBLIC_AGENT_API** - на Vercel указать URL Railway
- [ ] **Верифицировать контракт** на sepolia.mantlescan.xyz
- [ ] **Demo video** 2+ минуты
- [ ] **Submit BUIDL** на DoraHacks

## Уровень 2 - живые свопы (опционально)

- [x] **Byreal CLI** установлен (`byreal-cli --version`)
- [ ] **Phantom кошелёк** создан
- [ ] **SOL + USDC** на Solana (mainnet, Byreal)
- [ ] На Railway: `SIMULATION_MODE=false`
- [ ] На Railway: `BYREAL_WALLET_ADDRESS=ваш_phantom_адрес`
- [ ] Протестировать Run Agent - реальный swap

## Уже готово

- [x] Контракт Mantle Sepolia
- [x] On-chain логирование
- [x] Сайт ClawCFO (английский)
- [x] Telegram-бот (английский)
- [x] Connect Wallet (Phantom + MetaMask)
- [x] Docker + Railway config
- [x] Vercel config

## Ваши ссылки (заполните)

| Что | URL |
|-----|-----|
| GitHub | |
| Vercel (сайт) | |
| Railway (агент) | |
| Контракт | https://sepolia.mantlescan.xyz/address/0xa1Bc3e7906e99878bBa45941677d803E6eE7cd2c |
| Demo video | |
| Telegram бот | @ваш_бот |

## Дедлайн

**15 июня 2026** - DoraHacks submission

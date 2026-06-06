# Инструкция для вас (без кода)

Проект создан в: `C:\Users\Руслан\Projects\personal-cfo-claw`

## Что уже готово

- ✅ Смарт-контракт для записи решений агента на Mantle
- ✅ AI-агент с 3 шаблонами правил (rebalance, dip buy, take profit)
- ✅ Интеграция с Byreal Skills (режим симуляции работает без кошелька)
- ✅ Web-дашборд (красивый интерфейс для демо)
- ✅ Telegram-бот (опционально)

## Ваши шаги (по порядку)

### Шаг 1. Установить Node.js

Скачайте с https://nodejs.org/ (версия 20 или новее).
Проверьте в терминале: `node --version`

### Шаг 2. Установить зависимости

Откройте терминал в папке проекта и выполните:

```bash
cd C:\Users\Руслан\Projects\personal-cfo-claw
npm install
```

### Шаг 3. Создать кошелёк Mantle (для on-chain логов)

1. Установите MetaMask (расширение для браузера)
2. Добавьте сеть Mantle Sepolia Testnet:
   - RPC: `https://rpc.sepolia.mantle.xyz`
   - Chain ID: `5003`
   - Symbol: MNT
3. Получите тестовые MNT: https://faucet.testnet.mantle.xyz/
4. Скопируйте приватный ключ кошелька (НЕ ДЕЛИТЕСЬ НИ С КЕМ)

### Шаг 4. Настроить .env

```bash
copy .env.example .env
```

Откройте `.env` в блокноте и заполните:

```
AGENT_PRIVATE_KEY=ваш_приватный_ключ_без_0x
SIMULATION_MODE=true
```

### Шаг 5. Задеплоить контракт

```bash
cd contracts
npm install
npm run compile
npm run deploy
```

Скопируйте адрес контракта из вывода в `.env`:

```
AGENT_CFO_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

### Шаг 6. Запустить и протестировать

```bash
cd ..
npm run dev:agent
```

В другом терминале:

```bash
npm run dev:web
```

Откройте http://localhost:3000 → добавьте правило → нажмите «Запустить агента».

### Шаг 7. Telegram-бот (опционально)

1. Напишите @BotFather в Telegram → `/newbot` → получите токен
2. Добавьте в `.env`: `TELEGRAM_BOT_TOKEN=ваш_токен`
3. Запустите: `npm run dev:bot`

### Шаг 8. Зарегистрироваться на хакатоне

1. https://dorahacks.io/hackathon/mantleturingtesthackathon2026/detail
2. Нажмите **Register as Hacker**
3. Позже — **Submit BUIDL** с ссылкой на GitHub и demo

### Шаг 9. Demo video (для Deployment Award)

Запишите экран (2+ минуты):
1. Открываете дашборд
2. Добавляете правило
3. Запускаете агента
4. Показываете решение в логе
5. Показываете транзакцию на https://sepolia.mantlescan.xyz/

### Шаг 10. Выложить на GitHub + Vercel

- Создайте репозиторий на GitHub, залейте код
- Деплой web на Vercel (бесплатно): https://vercel.com/
- Укажите публичный URL в сабмите DoraHacks

## One-line pitch (для сабмита)

> AI personal CFO that autonomously manages your crypto portfolio via Byreal Skills, with every decision permanently logged on Mantle.

## Если что-то не работает

Напишите мне в чат — опишите ошибку, я помогу.

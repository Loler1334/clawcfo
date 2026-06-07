import { Markup } from "telegraf";

export type StrategyType = "weekly_rebalance" | "dip_buy" | "take_profit";

export type TemplateDefaults = Record<string, string | number>;

export interface TemplatesResponse {
  [key: string]: {
    name: string;
    description: string;
    example: string;
    defaults: TemplateDefaults;
  };
}

const TOKENS = ["USDC", "SOL", "mSOL"];
const TRADE_TOKENS = ["SOL", "mSOL"];

const STRATEGY_LABELS: Record<StrategyType, string> = {
  weekly_rebalance: "Weekly Rebalance",
  dip_buy: "Dip Buy",
  take_profit: "Take Profit",
};

const sessions = new Map<number, { type: StrategyType; config: TemplateDefaults }>();

export function getSession(userId: number) {
  return sessions.get(userId);
}

export function startSession(userId: number, type: StrategyType, defaults: TemplateDefaults) {
  sessions.set(userId, { type, config: { ...defaults } });
}

export function clearSession(userId: number) {
  sessions.delete(userId);
}

function cycleToken(current: string, options: string[]) {
  const idx = options.indexOf(current);
  return options[(idx + 1) % options.length];
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function applyConfigAction(
  userId: number,
  action: string
): { changed: boolean; message?: string } {
  const session = sessions.get(userId);
  if (!session) return { changed: false, message: "Session expired. Pick a strategy again." };

  const { type, config } = session;

  if (action === "reset") {
    return { changed: false, message: "reset" };
  }

  if (type === "weekly_rebalance") {
    if (action === "src") config.sourceToken = cycleToken(String(config.sourceToken), TOKENS);
    if (action === "tgt") config.targetToken = cycleToken(String(config.targetToken), TOKENS);
    if (action === "pct+") config.percent = clamp(Number(config.percent) + 5, 1, 100);
    if (action === "pct-") config.percent = clamp(Number(config.percent) - 5, 1, 100);
    if (action === "min+") config.minBalanceUsd = clamp(Number(config.minBalanceUsd) + 100, 0, 10000);
    if (action === "min-") config.minBalanceUsd = clamp(Number(config.minBalanceUsd) - 100, 0, 10000);
  }

  if (type === "dip_buy") {
    if (action === "tok") config.token = cycleToken(String(config.token), TRADE_TOKENS);
    if (action === "drop+") config.dropPercent = clamp(Number(config.dropPercent) + 1, 1, 50);
    if (action === "drop-") config.dropPercent = clamp(Number(config.dropPercent) - 1, 1, 50);
    if (action === "buy+") config.buyAmountUsd = clamp(Number(config.buyAmountUsd) + 10, 1, 1000);
    if (action === "buy-") config.buyAmountUsd = clamp(Number(config.buyAmountUsd) - 10, 1, 1000);
  }

  if (type === "take_profit") {
    if (action === "tok") config.token = cycleToken(String(config.token), TRADE_TOKENS);
    if (action === "gain+") config.gainPercent = clamp(Number(config.gainPercent) + 1, 1, 100);
    if (action === "gain-") config.gainPercent = clamp(Number(config.gainPercent) - 1, 1, 100);
    if (action === "sell+") config.sellPercent = clamp(Number(config.sellPercent) + 5, 1, 100);
    if (action === "sell-") config.sellPercent = clamp(Number(config.sellPercent) - 5, 1, 100);
  }

  sessions.set(userId, session);
  return { changed: true };
}

export function formatConfigScreen(type: StrategyType, config: TemplateDefaults): string {
  const title = STRATEGY_LABELS[type];

  if (type === "weekly_rebalance") {
    return (
      `⚙️ <b>Configure: ${title}</b>\n\n` +
      `From: <b>${config.sourceToken}</b> → To: <b>${config.targetToken}</b>\n` +
      `Rebalance: <b>${config.percent}%</b>\n` +
      `Min balance: <b>$${config.minBalanceUsd}</b>\n\n` +
      `<i>Tap buttons below to adjust, then activate.</i>`
    );
  }

  if (type === "dip_buy") {
    return (
      `⚙️ <b>Configure: ${title}</b>\n\n` +
      `Token: <b>${config.token}</b>\n` +
      `Buy when drop: <b>${config.dropPercent}%</b>\n` +
      `Buy amount: <b>$${config.buyAmountUsd}</b>\n\n` +
      `<i>Tap buttons below to adjust, then activate.</i>`
    );
  }

  return (
    `⚙️ <b>Configure: ${title}</b>\n\n` +
    `Token: <b>${config.token}</b>\n` +
    `Sell when gain: <b>${config.gainPercent}%</b>\n` +
    `Sell amount: <b>${config.sellPercent}%</b>\n\n` +
    `<i>Tap buttons below to adjust, then activate.</i>`
  );
}

export function configKeyboard(type: StrategyType) {
  const prefix = type === "weekly_rebalance" ? "cw" : type === "dip_buy" ? "cd" : "ct";

  if (type === "weekly_rebalance") {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback("From token ↔", `${prefix}:src`),
        Markup.button.callback("To token ↔", `${prefix}:tgt`),
      ],
      [
        Markup.button.callback("Rebalance −", `${prefix}:pct-`),
        Markup.button.callback("Rebalance +", `${prefix}:pct+`),
      ],
      [
        Markup.button.callback("Min $ −", `${prefix}:min-`),
        Markup.button.callback("Min $ +", `${prefix}:min+`),
      ],
      [Markup.button.callback("✅ Activate Strategy", `${prefix}:go`)],
      [Markup.button.callback("« Back", "menu_addrule")],
    ]);
  }

  if (type === "dip_buy") {
    return Markup.inlineKeyboard([
      [Markup.button.callback("Token ↔", `${prefix}:tok`)],
      [
        Markup.button.callback("Drop % −", `${prefix}:drop-`),
        Markup.button.callback("Drop % +", `${prefix}:drop+`),
      ],
      [
        Markup.button.callback("Buy $ −", `${prefix}:buy-`),
        Markup.button.callback("Buy $ +", `${prefix}:buy+`),
      ],
      [Markup.button.callback("✅ Activate Strategy", `${prefix}:go`)],
      [Markup.button.callback("« Back", "menu_addrule")],
    ]);
  }

  return Markup.inlineKeyboard([
    [Markup.button.callback("Token ↔", `${prefix}:tok`)],
    [
      Markup.button.callback("Gain % −", `${prefix}:gain-`),
      Markup.button.callback("Gain % +", `${prefix}:gain+`),
    ],
    [
      Markup.button.callback("Sell % −", `${prefix}:sell-`),
      Markup.button.callback("Sell % +", `${prefix}:sell+`),
    ],
    [Markup.button.callback("✅ Activate Strategy", `${prefix}:go`)],
    [Markup.button.callback("« Back", "menu_addrule")],
  ]);
}

export function buildRulePayload(userId: number): { type: StrategyType; overrides: TemplateDefaults } | null {
  const session = sessions.get(userId);
  if (!session) return null;
  return { type: session.type, overrides: session.config };
}

export function parseConfigCallback(data: string): { prefix: string; action: string } | null {
  const match = data.match(/^(cw|cd|ct):(.+)$/);
  if (!match) return null;
  return { prefix: match[1], action: match[2] };
}

export function typeFromPrefix(prefix: string): StrategyType | null {
  if (prefix === "cw") return "weekly_rebalance";
  if (prefix === "cd") return "dip_buy";
  if (prefix === "ct") return "take_profit";
  return null;
}

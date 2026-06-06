import { randomUUID } from "crypto";
import type { CFOReule, DipBuyRule, TakeProfitRule, WeeklyRebalanceRule } from "./types.js";

export const RULE_TEMPLATES = {
  weekly_rebalance: {
    name: "Weekly Rebalance",
    description: "Every week, move X% of source token into target token if balance exceeds minimum.",
    example: "Move 20% USDC → mSOL when balance > $500",
    defaults: {
      sourceToken: "USDC",
      targetToken: "mSOL",
      percent: 20,
      minBalanceUsd: 500,
    },
  },
  dip_buy: {
    name: "Dip Buy",
    description: "Buy more when token drops by X% (simulated price check).",
    example: "Buy $50 mSOL when it drops 5%",
    defaults: {
      token: "mSOL",
      dropPercent: 5,
      buyAmountUsd: 50,
    },
  },
  take_profit: {
    name: "Take Profit",
    description: "Sell X% of holdings when token gains Y%.",
    example: "Sell 50% mSOL when up 10%",
    defaults: {
      token: "mSOL",
      gainPercent: 10,
      sellPercent: 50,
    },
  },
} as const;

export function createRuleFromTemplate(
  type: keyof typeof RULE_TEMPLATES,
  overrides: Record<string, unknown> = {}
): CFOReule {
  const now = new Date().toISOString();
  const id = randomUUID();

  if (type === "weekly_rebalance") {
    const defaults = RULE_TEMPLATES.weekly_rebalance.defaults;
    return {
      id,
      type,
      active: true,
      createdAt: now,
      sourceToken: String(overrides.sourceToken ?? defaults.sourceToken),
      targetToken: String(overrides.targetToken ?? defaults.targetToken),
      percent: Number(overrides.percent ?? defaults.percent),
      minBalanceUsd: Number(overrides.minBalanceUsd ?? defaults.minBalanceUsd),
    } satisfies WeeklyRebalanceRule;
  }

  if (type === "dip_buy") {
    const defaults = RULE_TEMPLATES.dip_buy.defaults;
    return {
      id,
      type,
      active: true,
      createdAt: now,
      token: String(overrides.token ?? defaults.token),
      dropPercent: Number(overrides.dropPercent ?? defaults.dropPercent),
      buyAmountUsd: Number(overrides.buyAmountUsd ?? defaults.buyAmountUsd),
    } satisfies DipBuyRule;
  }

  const defaults = RULE_TEMPLATES.take_profit.defaults;
  return {
    id,
    type: "take_profit",
    active: true,
    createdAt: now,
    token: String(overrides.token ?? defaults.token),
    gainPercent: Number(overrides.gainPercent ?? defaults.gainPercent),
    sellPercent: Number(overrides.sellPercent ?? defaults.sellPercent),
  } satisfies TakeProfitRule;
}

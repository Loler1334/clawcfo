export type RuleType = "weekly_rebalance" | "dip_buy" | "take_profit";

export interface BaseRule {
  id: string;
  type: RuleType;
  active: boolean;
  createdAt: string;
}

export interface WeeklyRebalanceRule extends BaseRule {
  type: "weekly_rebalance";
  sourceToken: string;
  targetToken: string;
  percent: number;
  minBalanceUsd: number;
}

export interface DipBuyRule extends BaseRule {
  type: "dip_buy";
  token: string;
  dropPercent: number;
  buyAmountUsd: number;
}

export interface TakeProfitRule extends BaseRule {
  type: "take_profit";
  token: string;
  gainPercent: number;
  sellPercent: number;
}

export type CFOReule = WeeklyRebalanceRule | DipBuyRule | TakeProfitRule;

export interface WalletBalance {
  token: string;
  amount: number;
  usdValue: number;
}

export interface AgentDecision {
  id: string;
  action: string;
  reasoning: string;
  inputToken: string;
  outputToken: string;
  inputAmount: number;
  outputAmount: number;
  executed: boolean;
  simulated: boolean;
  timestamp: string;
  onChainTxHash?: string;
}

export interface AgentStatus {
  simulationMode: boolean;
  walletAddress?: string;
  mantleAddress?: string;
  contractAddress?: string;
  activeRules: number;
  totalDecisions: number;
  lastRunAt?: string;
}

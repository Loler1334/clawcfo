import { randomUUID } from "crypto";
import { executeSwap, getWalletBalances } from "./byreal-client.js";
import { config } from "./config.js";
import {
  createRuleOnChain,
  getMantleAddress,
  logDecisionOnChain,
  triggerOnChainEvaluation,
} from "./mantle-logger.js";
import { getDecisions, getRules, saveDecision, saveOnChainTx } from "./storage.js";
import type { AgentDecision, AgentStatus, CFOReule } from "./types.js";
import { formatTxLabel } from "./tx-labels.js";

// Simulated 7-day price history for demo (dip_buy / take_profit)
const priceHistory: Record<string, number[]> = {
  mSOL: [200, 198, 195, 190, 188, 192, 185],
  SOL: [150, 148, 145, 142, 140, 143, 138],
  USDC: [1, 1, 1, 1, 1, 1, 1],
};

function getPriceChangePercent(token: string): number {
  const history = priceHistory[token] ?? [100, 100];
  const oldest = history[0];
  const latest = history[history.length - 1];
  return ((latest - oldest) / oldest) * 100;
}

async function evaluateRule(rule: CFOReule, balances: Awaited<ReturnType<typeof getWalletBalances>>): Promise<AgentDecision | null> {
  if (rule.type === "weekly_rebalance") {
    const source = balances.find((b) => b.token === rule.sourceToken);
    if (!source || source.usdValue < rule.minBalanceUsd) return null;

    const swapAmount = (source.usdValue * rule.percent) / 100;
    const reasoning = `Weekly rebalance: ${rule.percent}% of ${rule.sourceToken} ($${swapAmount.toFixed(2)}) → ${rule.targetToken}. Balance $${source.usdValue.toFixed(2)} exceeds min $${rule.minBalanceUsd}.`;

    const result = await executeSwap(rule.sourceToken, rule.targetToken, swapAmount);

    return {
      id: randomUUID(),
      action: "weekly_rebalance",
      reasoning,
      inputToken: rule.sourceToken,
      outputToken: rule.targetToken,
      inputAmount: swapAmount,
      outputAmount: result.outputAmount,
      executed: result.success,
      simulated: config.simulationMode,
      timestamp: new Date().toISOString(),
      onChainTxHash: result.txHash,
    };
  }

  if (rule.type === "dip_buy") {
    const change = getPriceChangePercent(rule.token);
    if (change > -rule.dropPercent) return null;

    const usdc = balances.find((b) => b.token === "USDC");
    if (!usdc || usdc.usdValue < rule.buyAmountUsd) return null;

    const reasoning = `Dip buy: ${rule.token} dropped ${Math.abs(change).toFixed(1)}% (threshold ${rule.dropPercent}%). Buying $${rule.buyAmountUsd} via Byreal swap.`;

    const result = await executeSwap("USDC", rule.token, rule.buyAmountUsd);

    return {
      id: randomUUID(),
      action: "dip_buy",
      reasoning,
      inputToken: "USDC",
      outputToken: rule.token,
      inputAmount: rule.buyAmountUsd,
      outputAmount: result.outputAmount,
      executed: result.success,
      simulated: config.simulationMode,
      timestamp: new Date().toISOString(),
      onChainTxHash: result.txHash,
    };
  }

  if (rule.type === "take_profit") {
    const change = getPriceChangePercent(rule.token);
    if (change < rule.gainPercent) return null;

    const holding = balances.find((b) => b.token === rule.token);
    if (!holding) return null;

    const sellAmount = (holding.usdValue * rule.sellPercent) / 100;
    const reasoning = `Take profit: ${rule.token} gained ${change.toFixed(1)}% (threshold ${rule.gainPercent}%). Selling ${rule.sellPercent}% ($${sellAmount.toFixed(2)}) → USDC.`;

    const result = await executeSwap(rule.token, "USDC", sellAmount);

    return {
      id: randomUUID(),
      action: "take_profit",
      reasoning,
      inputToken: rule.token,
      outputToken: "USDC",
      inputAmount: sellAmount,
      outputAmount: result.outputAmount,
      executed: result.success,
      simulated: config.simulationMode,
      timestamp: new Date().toISOString(),
      onChainTxHash: result.txHash,
    };
  }

  return null;
}

function resolveOwnerAddress(): string {
  const mantle = getMantleAddress();
  if (config.byrealWallet && /^0x[a-fA-F0-9]{40}$/.test(config.byrealWallet)) {
    return config.byrealWallet;
  }
  return mantle ?? "0x0000000000000000000000000000000000000000";
}

function recordMantleTx(hash: string | null, type: string, label: string) {
  if (!hash) return;
  saveOnChainTx({
    hash,
    type,
    label,
    timestamp: new Date().toISOString(),
  });
}

export async function runEvaluationCycle(): Promise<AgentDecision[]> {
  const triggerTx = await triggerOnChainEvaluation();
  recordMantleTx(triggerTx, "trigger", formatTxLabel("triggerAgentEvaluation"));

  const rules = getRules().filter((r) => r.active);
  const balances = await getWalletBalances();
  const newDecisions: AgentDecision[] = [];

  for (const rule of rules) {
    const decision = await evaluateRule(rule, balances);
    if (!decision) continue;

    const owner = resolveOwnerAddress();
    try {
      const mantleTx = await logDecisionOnChain(owner, decision);
      if (mantleTx) {
        decision.mantleTxHash = mantleTx;
        recordMantleTx(mantleTx, "decision", formatTxLabel(`logDecision: ${decision.action}`));
      }
    } catch (error) {
      console.error("Mantle logDecision failed (decision still saved):", error);
    }

    saveDecision(decision);
    newDecisions.push(decision);
  }

  return newDecisions;
}

export async function addRule(rule: CFOReule): Promise<CFOReule> {
  const { saveRule } = await import("./storage.js");
  saveRule(rule);
  const tx = await createRuleOnChain(rule.type, JSON.stringify(rule));
  recordMantleTx(tx, "rule", formatTxLabel(`createRule: ${rule.type}`));
  return rule;
}

export function getStatus(): AgentStatus {
  const rules = getRules();
  const decisions = getDecisions();
  return {
    simulationMode: config.simulationMode,
    walletAddress: config.byrealWallet,
    mantleAddress: getMantleAddress(),
    contractAddress: config.contractAddress,
    activeRules: rules.filter((r) => r.active).length,
    totalDecisions: decisions.length,
    lastRunAt: decisions[0]?.timestamp,
  };
}

const RULE_LABELS: Record<string, string> = {
  weekly_rebalance: "Create Rule: Weekly Rebalance ✅",
  dip_buy: "Create Rule: Buy the Dip ✅",
  take_profit: "Create Rule: Take Profit ✅",
};

const DECISION_LABELS: Record<string, string> = {
  weekly_rebalance: "Decision Logged: Weekly Rebalance ✅",
  dip_buy: "Decision Logged: Buy the Dip ✅",
  take_profit: "Decision Logged: Take Profit ✅",
};

export function formatTxLabel(raw: string): string {
  const trimmed = raw.trim();

  const createRuleMatch = trimmed.match(/^createRule:\s*(\w+)$/i);
  if (createRuleMatch) {
    return RULE_LABELS[createRuleMatch[1]] ?? `Create Rule: ${createRuleMatch[1]} ✅`;
  }

  if (/^triggerAgentEvaluation$/i.test(trimmed)) {
    return "Portfolio Check Started 🔍";
  }

  const logMatch = trimmed.match(/^logDecision:\s*(\w+)$/i);
  if (logMatch) {
    return DECISION_LABELS[logMatch[1]] ?? "Decision Logged ✅";
  }

  if (/^createRule$/i.test(trimmed)) return "Create Rule ✅";
  if (/^logDecision$/i.test(trimmed)) return "Decision Logged ✅";

  return trimmed;
}

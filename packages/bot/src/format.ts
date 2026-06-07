type WeeklyRule = {
  type: "weekly_rebalance";
  sourceToken: string;
  targetToken: string;
  percent: number;
  minBalanceUsd: number;
  active: boolean;
};

type DipRule = {
  type: "dip_buy";
  token: string;
  dropPercent: number;
  buyAmountUsd: number;
  active: boolean;
};

type ProfitRule = {
  type: "take_profit";
  token: string;
  gainPercent: number;
  sellPercent: number;
  active: boolean;
};

export type Rule = WeeklyRule | DipRule | ProfitRule;

export type Decision = {
  action: string;
  reasoning: string;
  inputToken: string;
  outputToken: string;
  inputAmount: number;
  outputAmount: number;
  executed: boolean;
  simulated: boolean;
  timestamp: string;
};

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function formatRuleSummary(rule: Rule): string {
  if (rule.type === "weekly_rebalance") {
    return (
      `✅ <b>Rule added: Weekly Rebalance</b>\n\n` +
      `📅 Every week, move <b>${rule.percent}%</b> of your <b>${rule.sourceToken}</b> into <b>${rule.targetToken}</b>.\n` +
      `💰 Only when your ${rule.sourceToken} balance is above <b>$${rule.minBalanceUsd}</b>.\n\n` +
      `Status: ${rule.active ? "🟢 Active" : "⏸ Paused"}\n\n` +
      `<i>Next step: tap "▶ Run Agent" below or send /run to check your portfolio now.</i>`
    );
  }

  if (rule.type === "dip_buy") {
    return (
      `✅ <b>Rule added: Dip Buy</b>\n\n` +
      `📉 When <b>${rule.token}</b> drops by <b>${rule.dropPercent}%</b>, the agent buys <b>$${rule.buyAmountUsd}</b> worth.\n` +
      `🔄 Swap: USDC → ${rule.token} via Byreal.\n\n` +
      `Status: ${rule.active ? "🟢 Active" : "⏸ Paused"}\n\n` +
      `<i>Next step: tap "▶ Run Agent" to simulate a portfolio check.</i>`
    );
  }

  return (
    `✅ <b>Rule added: Take Profit</b>\n\n` +
    `📈 When <b>${rule.token}</b> gains <b>${rule.gainPercent}%</b>, sell <b>${rule.sellPercent}%</b> of your holdings.\n` +
    `🔄 Swap: ${rule.token} → USDC via Byreal.\n\n` +
    `Status: ${rule.active ? "🟢 Active" : "⏸ Paused"}\n\n` +
    `<i>Next step: tap "▶ Run Agent" to simulate a portfolio check.</i>`
  );
}

export function formatRuleListItem(rule: Rule, index: number): string {
  const status = rule.active ? "🟢" : "⏸";
  if (rule.type === "weekly_rebalance") {
    return `${index}. ${status} <b>Weekly Rebalance</b> — ${rule.percent}% ${rule.sourceToken} → ${rule.targetToken}`;
  }
  if (rule.type === "dip_buy") {
    return `${index}. ${status} <b>Dip Buy</b> — buy $${rule.buyAmountUsd} ${rule.token} on −${rule.dropPercent}% drop`;
  }
  return `${index}. ${status} <b>Take Profit</b> — sell ${rule.sellPercent}% ${rule.token} at +${rule.gainPercent}%`;
}

export function formatDecision(decision: Decision): string {
  const status = decision.executed ? "✅ Executed" : "⏭ Skipped";
  const mode = decision.simulated ? " (demo mode)" : "";
  const time = new Date(decision.timestamp).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    `🤖 <b>${escapeHtml(decision.action.replace(/_/g, " "))}</b> — ${status}${mode}\n\n` +
    `${escapeHtml(decision.reasoning)}\n\n` +
    `💱 <b>${decision.inputAmount.toFixed(2)} ${decision.inputToken}</b> → ` +
    `<b>${decision.outputAmount.toFixed(4)} ${decision.outputToken}</b>\n` +
    `🕐 ${time}`
  );
}

export const WELCOME_MESSAGE =
  `👋 <b>Welcome to Personal CFO Agent</b>\n\n` +
  `Your AI financial assistant for the <b>Mantle × RealClaw</b> hackathon.\n\n` +
  `<b>What I do:</b>\n` +
  `• Watch your crypto portfolio\n` +
  `• Execute rules automatically (rebalance, buy dips, take profit)\n` +
  `• Log every decision on-chain on Mantle\n\n` +
  `<b>Quick start (3 steps):</b>\n` +
  `1️⃣ Tap <b>"➕ Add Rule"</b> — pick &amp; customize a strategy\n` +
  `2️⃣ Tap <b>"▶ Run Agent"</b> — agent checks if any rule should fire\n` +
  `3️⃣ Tap <b>"📜 History"</b> — see what the agent decided\n\n` +
  `<i>Tip: send /help anytime for the full guide.</i>`;

export const HELP_MESSAGE =
  `📖 <b>How to use Personal CFO Agent</b>\n\n` +
  `<b>Step 1 — Add a rule</b>\n` +
  `Send /addrule or tap "➕ Add Rule".\n` +
  `Choose a template, then customize with the buttons:\n` +
  `• <b>Weekly Rebalance</b> — tokens, %, min balance\n` +
  `• <b>Dip Buy</b> — token, drop %, buy amount\n` +
  `• <b>Take Profit</b> — token, gain %, sell %\n\n` +
  `<b>Step 2 — Run the agent</b>\n` +
  `Send /run or tap "▶ Run Agent".\n` +
  `The agent checks your portfolio and executes matching rules.\n` +
  `Each decision is recorded on Mantle blockchain.\n\n` +
  `<b>Step 3 — Review results</b>\n` +
  `/history — last 5 decisions\n` +
  `/status — agent mode, active rules, Mantle contract\n` +
  `/rules — list all your rules\n\n` +
  `<b>Commands</b>\n` +
  `/start — welcome & quick start\n` +
  `/help — this guide\n` +
  `/addrule — add a new rule\n` +
  `/run — run agent now\n` +
  `/rules — your rules\n` +
  `/history — recent decisions\n` +
  `/status — agent status\n` +
  `/templates — rule templates explained\n\n` +
  `<b>Demo mode</b>\n` +
  `Currently running in simulation — no real money moves.\n` +
  `On-chain logs on Mantle are still real and verifiable.`;

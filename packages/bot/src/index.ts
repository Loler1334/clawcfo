import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Markup, Telegraf, type Context } from "telegraf";
import {
  formatDecision,
  formatRuleButtonLabel,
  formatRuleListItem,
  formatRuleSummary,
  HELP_MESSAGE,
  type Rule,
  WELCOME_MESSAGE,
} from "./format.js";
import {
  applyConfigAction,
  buildRulePayload,
  clearSession,
  configKeyboard,
  formatConfigScreen,
  parseConfigCallback,
  startSession,
  type StrategyType,
  type TemplatesResponse,
} from "./strategy-config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../../.env") });

const token = process.env.TELEGRAM_BOT_TOKEN;
const apiBase =
  process.env.AGENT_API_URL ?? `http://127.0.0.1:${process.env.AGENT_API_PORT ?? 3847}`;
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME ?? "my_mantle_cfo_bot";
const OFFLINE_MESSAGE =
  `⚠️ <b>Agent is offline</b>\n\n` +
  `The ClawCFO agent API is not reachable right now. Try again in a few minutes, or use the web dashboard:\n` +
  `https://clawcfo-web.vercel.app`;

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is required. Get one from @BotFather on Telegram.");
  process.exit(1);
}

const bot = new Telegraf(token);

const mainMenu = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("➕ Add Rule", "menu_addrule"),
      Markup.button.callback("▶ Run Agent", "menu_run"),
    ],
    [
      Markup.button.callback("📋 My Rules", "menu_rules"),
      Markup.button.callback("📜 History", "menu_history"),
    ],
    [Markup.button.callback("🗑 Remove Strategy", "menu_remove")],
    [Markup.button.callback("📊 Status", "menu_status"), Markup.button.callback("❓ Help", "menu_help")],
  ]);

const clearAllConfirmMenu = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("✅ Yes, clear all", "reset_confirm"),
      Markup.button.callback("✖ Cancel", "menu_remove"),
    ],
  ]);

function removeOneConfirmMenu(ruleId: string) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("✅ Yes, remove", `remove_one:${ruleId}`),
      Markup.button.callback("✖ Cancel", "menu_remove"),
    ],
  ]);
}

const ruleMenu = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback("📅 Weekly Rebalance", "rule_weekly_rebalance")],
    [Markup.button.callback("📉 Dip Buy", "rule_dip_buy")],
    [Markup.button.callback("📈 Take Profit", "rule_take_profit")],
    [Markup.button.callback("« Back to menu", "menu_start")],
  ]);

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, init);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

async function safeReply(ctx: Context, text: string, extra?: object) {
  try {
    await ctx.reply(text, { parse_mode: "HTML", ...extra });
  } catch (error) {
    console.error("Reply failed:", error);
    await ctx.reply(text.replace(/<[^>]+>/g, ""));
  }
}

bot.telegram.setMyCommands([
  { command: "start", description: "Welcome & quick start" },
  { command: "help", description: "Full user guide" },
  { command: "addrule", description: "Add a financial rule" },
  { command: "run", description: "Run agent now" },
  { command: "rules", description: "List your rules" },
  { command: "history", description: "Recent agent decisions" },
  { command: "status", description: "Agent & contract status" },
  { command: "remove", description: "Remove a strategy" },
  { command: "reset", description: "Clear all strategies" },
  { command: "templates", description: "Explain rule templates" },
]);

bot.start(async (ctx) => {
  await safeReply(ctx, WELCOME_MESSAGE, mainMenu());
});

bot.command("help", async (ctx) => {
  await safeReply(ctx, HELP_MESSAGE, mainMenu());
});

bot.action("menu_start", async (ctx) => {
  await ctx.answerCbQuery();
  await safeReply(ctx, WELCOME_MESSAGE, mainMenu());
});

bot.action("menu_help", async (ctx) => {
  await ctx.answerCbQuery();
  await safeReply(ctx, HELP_MESSAGE, mainMenu());
});

bot.command("status", async (ctx) => {
  await handleStatus(ctx);
});

bot.action("menu_status", async (ctx) => {
  await ctx.answerCbQuery();
  await handleStatus(ctx);
});

async function handleStatus(ctx: Context) {
  try {
    const status = await api<{
      simulationMode: boolean;
      activeRules: number;
      totalDecisions: number;
      contractAddress?: string;
      mantleAddress?: string;
      lastRunAt?: string;
    }>("/status");

    const lastRun = status.lastRunAt
      ? new Date(status.lastRunAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
      : "Never";

    const contract = status.contractAddress
      ? `<a href="https://sepolia.mantlescan.xyz/address/${status.contractAddress}">${status.contractAddress.slice(0, 10)}…</a>`
      : "Not deployed";

    await safeReply(
      ctx,
      `📊 <b>Agent Status</b>\n\n` +
        `Mode: ${status.simulationMode ? "🧪 Demo (simulation)" : "🔴 Live trading"}\n` +
        `Active rules: <b>${status.activeRules}</b>\n` +
        `Total decisions: <b>${status.totalDecisions}</b>\n` +
        `Last run: <b>${lastRun}</b>\n` +
        `Mantle contract: ${contract}\n\n` +
        `<i>Every agent decision is logged on Mantle for full transparency.</i>`,
      mainMenu()
    );
  } catch {
    await safeReply(ctx, OFFLINE_MESSAGE, mainMenu());
  }
}

bot.command("templates", async (ctx) => {
  await handleTemplates(ctx);
});

async function handleTemplates(ctx: Context) {
  try {
    const templates = await api<Record<string, { name: string; description: string; example: string }>>("/templates");
    const lines = Object.values(templates).map(
      (t) =>
        `• <b>${t.name}</b>\n  ${t.description}\n  <i>Example: ${t.example}</i>`
    );

    await safeReply(
      ctx,
      `📑 <b>Rule Templates</b>\n\n${lines.join("\n\n")}\n\n<i>Tap "➕ Add Rule" to activate one.</i>`,
      mainMenu()
    );
  } catch {
    await safeReply(ctx, `⚠️ Could not load templates.\n\n${OFFLINE_MESSAGE}`, mainMenu());
  }
}

bot.command("addrule", async (ctx) => {
  await handleAddRule(ctx);
});

bot.action("menu_addrule", async (ctx) => {
  await ctx.answerCbQuery();
  await handleAddRule(ctx);
});

async function handleAddRule(ctx: Context) {
  await safeReply(
    ctx,
    `➕ <b>Add a Rule</b>\n\n` +
      `Pick a strategy, customize the settings, then activate.\n\n` +
      `• <b>Weekly Rebalance</b> — move % between tokens\n` +
      `• <b>Dip Buy</b> — buy on price drop\n` +
      `• <b>Take Profit</b> — sell on price rise`,
    ruleMenu()
  );
}

async function openStrategyConfig(ctx: Context, type: StrategyType) {
  const userId = ctx.from?.id;
  if (!userId) return;

  try {
    const templates = await api<TemplatesResponse>("/templates");
    const template = templates[type];
    if (!template) {
      await safeReply(ctx, `⚠️ Unknown strategy type.`, ruleMenu());
      return;
    }

    startSession(userId, type, template.defaults);
    const text = formatConfigScreen(type, template.defaults);
    const keyboard = configKeyboard(type);

    if (ctx.callbackQuery && "message" in ctx.callbackQuery && ctx.callbackQuery.message) {
      await ctx.editMessageText(text, { parse_mode: "HTML", ...keyboard });
    } else {
      await safeReply(ctx, text, keyboard);
    }
  } catch {
    await safeReply(ctx, `⚠️ Could not load strategy settings.\n\n${OFFLINE_MESSAGE}`, mainMenu());
  }
}

async function refreshConfigScreen(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const payload = buildRulePayload(userId);
  if (!payload) {
    await ctx.answerCbQuery("Session expired");
    return;
  }

  const text = formatConfigScreen(payload.type, payload.overrides);
  const keyboard = configKeyboard(payload.type);
  await ctx.editMessageText(text, { parse_mode: "HTML", ...keyboard });
}

async function activateConfiguredRule(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const payload = buildRulePayload(userId);
  if (!payload) {
    await safeReply(ctx, `⚠️ Session expired. Pick a strategy again.`, ruleMenu());
    return;
  }

  try {
    const rule = await api<Rule>("/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: payload.type, ...payload.overrides }),
    });

    clearSession(userId);
    await safeReply(ctx, formatRuleSummary(rule), mainMenu());
  } catch {
    await safeReply(ctx, `⚠️ <b>Could not add rule</b>\n\n${OFFLINE_MESSAGE}`, mainMenu());
  }
}

bot.action(/^rule_(weekly_rebalance|dip_buy|take_profit)$/, async (ctx) => {
  const type = ctx.match[1] as StrategyType;
  await ctx.answerCbQuery("Customize settings…");
  await openStrategyConfig(ctx, type);
});

bot.action(/^(cw|cd|ct):(.+)$/, async (ctx) => {
  const parsed = parseConfigCallback(ctx.match[0]);
  if (!parsed) return;

  const userId = ctx.from?.id;
  if (!userId) return;

  if (parsed.action === "go") {
    await ctx.answerCbQuery("Activating…");
    await activateConfiguredRule(ctx);
    return;
  }

  const result = applyConfigAction(userId, parsed.action);
  if (!result.changed) {
    await ctx.answerCbQuery(result.message ?? "No change");
    return;
  }

  await ctx.answerCbQuery();
  await refreshConfigScreen(ctx);
});

bot.command("rules", async (ctx) => {
  await handleRules(ctx);
});

bot.action("menu_rules", async (ctx) => {
  await ctx.answerCbQuery();
  await handleRules(ctx);
});

async function handleRules(ctx: Context) {
  try {
    const rules = await api<Rule[]>("/rules");
    if (!rules.length) {
      await safeReply(
        ctx,
        `📋 <b>No rules yet</b>\n\nTap "➕ Add Rule" to create your first strategy.`,
        ruleMenu()
      );
      return;
    }

    const text = rules.map((r, i) => formatRuleListItem(r, i + 1)).join("\n");
    await safeReply(
      ctx,
      `📋 <b>Your Rules (${rules.length})</b>\n\n${text}\n\n<i>Send /run to check if any rule should fire now.</i>`,
      mainMenu()
    );
  } catch {
    await safeReply(ctx, `⚠️ Could not load rules.\n\n${OFFLINE_MESSAGE}`, mainMenu());
  }
}

bot.command("remove", async (ctx) => {
  await handleRemoveMenu(ctx);
});

bot.command("reset", async (ctx) => {
  await handleClearAllPrompt(ctx);
});

bot.action("menu_remove", async (ctx) => {
  await ctx.answerCbQuery();
  await handleRemoveMenu(ctx);
});

bot.action(/^remove_pick:(.+)$/, async (ctx) => {
  const ruleId = ctx.match[1];
  await ctx.answerCbQuery();
  await handleRemoveOnePrompt(ctx, ruleId);
});

bot.action(/^remove_one:(.+)$/, async (ctx) => {
  const ruleId = ctx.match[1];
  await ctx.answerCbQuery("Removing…");
  await handleRemoveOneConfirm(ctx, ruleId);
});

bot.action("reset_confirm", async (ctx) => {
  await ctx.answerCbQuery("Clearing…");
  await handleClearAllConfirm(ctx);
});

async function handleRemoveMenu(ctx: Context) {
  try {
    const rules = await api<Rule[]>("/rules");
    if (!rules.length) {
      await safeReply(
        ctx,
        `🗑 <b>No strategies yet</b>\n\nAdd one with "➕ Add Rule" first.`,
        mainMenu()
      );
      return;
    }

    const rows = rules.map((rule) => [
      Markup.button.callback(formatRuleButtonLabel(rule), `remove_pick:${rule.id}`),
    ]);
    rows.push([Markup.button.callback("🗑 Clear all strategies", "menu_clear_all")]);
    rows.push([Markup.button.callback("« Back to menu", "menu_start")]);

    await safeReply(
      ctx,
      `🗑 <b>Remove Strategy</b>\n\nPick which strategy to remove:`,
      Markup.inlineKeyboard(rows)
    );
  } catch {
    await safeReply(ctx, `⚠️ <b>Could not load strategies</b>\n\n${OFFLINE_MESSAGE}`, mainMenu());
  }
}

async function handleRemoveOnePrompt(ctx: Context, ruleId: string) {
  try {
    const rules = await api<Rule[]>("/rules");
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) {
      await safeReply(ctx, `⚠️ Strategy not found. It may have been removed already.`, mainMenu());
      return;
    }

    const index = rules.findIndex((r) => r.id === ruleId) + 1;
    await safeReply(
      ctx,
      `🗑 <b>Remove this strategy?</b>\n\n${formatRuleListItem(rule, index)}`,
      removeOneConfirmMenu(ruleId)
    );
  } catch {
    await safeReply(ctx, OFFLINE_MESSAGE, mainMenu());
  }
}

async function handleRemoveOneConfirm(ctx: Context, ruleId: string) {
  try {
    await api<{ ok: boolean; deleted: string }>(`/rules/${ruleId}`, { method: "DELETE" });
    await safeReply(ctx, `✅ <b>Strategy removed.</b>`, mainMenu());
  } catch {
    await safeReply(ctx, `⚠️ <b>Could not remove strategy</b>\n\n${OFFLINE_MESSAGE}`, mainMenu());
  }
}

bot.action("menu_clear_all", async (ctx) => {
  await ctx.answerCbQuery();
  await handleClearAllPrompt(ctx);
});

async function handleClearAllPrompt(ctx: Context) {
  await safeReply(
    ctx,
    `🗑 <b>Clear all strategies?</b>\n\n` +
      `This removes every active strategy. You can add new ones anytime with "➕ Add Rule".`,
    clearAllConfirmMenu()
  );
}

async function handleClearAllConfirm(ctx: Context) {
  try {
    await api<{ ok: boolean; cleared: boolean }>("/rules", { method: "DELETE" });
    await safeReply(
      ctx,
      `✅ <b>All strategies cleared.</b>\n\nPick new ones with "➕ Add Rule".`,
      mainMenu()
    );
  } catch {
    await safeReply(ctx, `⚠️ <b>Could not clear strategies</b>\n\n${OFFLINE_MESSAGE}`, mainMenu());
  }
}

bot.command("run", async (ctx) => {
  await handleRun(ctx);
});

bot.action("menu_run", async (ctx) => {
  await ctx.answerCbQuery();
  await handleRun(ctx);
});

async function handleRun(ctx: Context) {
  await safeReply(ctx, `⏳ <b>Running agent…</b>\n\nChecking portfolio against your rules. This may take ~15 seconds (on-chain logging).`);

  try {
    const result = await api<{ count: number; decisions: Array<Parameters<typeof formatDecision>[0]> }>("/run", {
      method: "POST",
    });

    if (!result.count) {
      await safeReply(
        ctx,
        `✅ <b>Check complete</b>\n\nNo rules triggered right now — your portfolio looks fine.\n\n<i>Add more rules with "➕ Add Rule" or check /status.</i>`,
        mainMenu()
      );
      return;
    }

    await safeReply(ctx, `✅ <b>${result.count} action${result.count > 1 ? "s" : ""} taken</b>\n\nHere's what the agent did:`);

    for (const d of result.decisions) {
      await safeReply(ctx, formatDecision(d));
    }

    await safeReply(ctx, `<i>All decisions logged on Mantle. View /history for the full log.</i>`, mainMenu());
  } catch {
    await safeReply(ctx, OFFLINE_MESSAGE, mainMenu());
  }
}

bot.command("history", async (ctx) => {
  await handleHistory(ctx);
});

bot.action("menu_history", async (ctx) => {
  await ctx.answerCbQuery();
  await handleHistory(ctx);
});

async function handleHistory(ctx: Context) {
  try {
    const decisions = await api<Array<Parameters<typeof formatDecision>[0]>>("/decisions");

    if (!decisions.length) {
      await safeReply(
        ctx,
        `📜 <b>No history yet</b>\n\nAdd a rule, then tap "▶ Run Agent" to see decisions here.`,
        mainMenu()
      );
      return;
    }

    await safeReply(ctx, `📜 <b>Recent Decisions</b> (last ${Math.min(decisions.length, 5)})`);

    for (const d of decisions.slice(0, 5)) {
      await safeReply(ctx, formatDecision(d));
    }

    await safeReply(ctx, `<i>Every decision is permanently recorded on Mantle blockchain.</i>`, mainMenu());
  } catch {
    await safeReply(ctx, `⚠️ Could not load history.\n\n${OFFLINE_MESSAGE}`, mainMenu());
  }
}

bot.catch((err, ctx) => {
  console.error("Bot error:", err);
  safeReply(ctx, `⚠️ Something went wrong. Try /start or /help.`).catch(console.error);
});

bot.launch();
console.log(`Telegram bot @${BOT_USERNAME} started`);

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

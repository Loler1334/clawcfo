import cors from "cors";
import express from "express";
import cron from "node-cron";
import { addRule, getStatus, runEvaluationCycle } from "./cfo-engine.js";
import { config } from "./config.js";
import { createRuleFromTemplate, RULE_TEMPLATES } from "./rule-templates.js";
import { getDecisions, getRules, toggleRule } from "./storage.js";
import type { RuleType } from "./types.js";

const app = express();
app.use(
  cors({
    origin: config.allowedOrigins.includes("*") ? true : config.allowedOrigins,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "personal-cfo-agent" });
});

app.get("/", (_req, res) => {
  res.status(200).json({ ok: true, service: "personal-cfo-agent", health: "/health" });
});

app.get("/status", (_req, res) => {
  res.json(getStatus());
});

app.get("/templates", (_req, res) => {
  res.json(RULE_TEMPLATES);
});

app.get("/rules", (_req, res) => {
  res.json(getRules());
});

app.post("/rules", async (req, res) => {
  try {
    const { type, ...overrides } = req.body as { type: RuleType } & Record<string, unknown>;
    if (!RULE_TEMPLATES[type]) {
      res.status(400).json({ error: "Unknown rule type" });
      return;
    }
    const rule = await addRule(createRuleFromTemplate(type, overrides));
    res.json(rule);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch("/rules/:id", (req, res) => {
  try {
    const { active } = req.body as { active: boolean };
    toggleRule(req.params.id, active);
    res.json({ ok: true });
  } catch (error) {
    res.status(404).json({ error: String(error) });
  }
});

app.get("/decisions", (_req, res) => {
  res.json(getDecisions());
});

app.post("/run", async (_req, res) => {
  try {
    const decisions = await runEvaluationCycle();
    res.json({ decisions, count: decisions.length });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Auto-run every Friday at 09:00 UTC (weekly rebalance demo)
cron.schedule("0 9 * * 5", () => {
  console.log("[cron] Running weekly CFO evaluation...");
  runEvaluationCycle().catch(console.error);
});

const port = config.port;
const host = "0.0.0.0";

app.listen(port, host, () => {
  console.log(`ClawCFO Agent listening on ${host}:${port}`);
  console.log(`Simulation mode: ${config.simulationMode}`);
  if (config.contractAddress) console.log(`Mantle contract: ${config.contractAddress}`);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

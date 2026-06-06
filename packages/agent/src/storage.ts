import fs from "fs";
import path from "path";
import { config } from "./config.js";
import type { AgentDecision, CFOReule } from "./types.js";

const rulesFile = path.join(config.dataDir, "rules.json");
const decisionsFile = path.join(config.dataDir, "decisions.json");

function ensureDataDir() {
  fs.mkdirSync(config.dataDir, { recursive: true });
}

function readJson<T>(file: string, fallback: T): T {
  ensureDataDir();
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function writeJson<T>(file: string, data: T) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function getRules(): CFOReule[] {
  return readJson<CFOReule[]>(rulesFile, []);
}

export function saveRule(rule: CFOReule) {
  const rules = getRules();
  const idx = rules.findIndex((r) => r.id === rule.id);
  if (idx >= 0) rules[idx] = rule;
  else rules.push(rule);
  writeJson(rulesFile, rules);
}

export function toggleRule(id: string, active: boolean) {
  const rules = getRules();
  const rule = rules.find((r) => r.id === id);
  if (!rule) throw new Error(`Rule ${id} not found`);
  rule.active = active;
  writeJson(rulesFile, rules);
}

export function getDecisions(): AgentDecision[] {
  return readJson<AgentDecision[]>(decisionsFile, []);
}

export function saveDecision(decision: AgentDecision) {
  const decisions = getDecisions();
  decisions.unshift(decision);
  writeJson(decisionsFile, decisions.slice(0, 100));
}

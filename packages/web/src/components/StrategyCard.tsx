"use client";

import { useState } from "react";

type StrategyKey = "weekly_rebalance" | "dip_buy" | "take_profit";

interface Template {
  name: string;
  description: string;
  example: string;
  defaults: Record<string, string | number>;
}

interface FieldDef {
  key: string;
  label: string;
  type: "select" | "number";
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

const TOKENS = ["USDC", "SOL", "mSOL"];

const FIELDS: Record<StrategyKey, FieldDef[]> = {
  weekly_rebalance: [
    { key: "sourceToken", label: "From", type: "select", options: TOKENS },
    { key: "targetToken", label: "To", type: "select", options: TOKENS },
    { key: "percent", label: "Rebalance amount", type: "number", min: 1, max: 100, suffix: "%" },
    { key: "minBalanceUsd", label: "Only when balance exceeds", type: "number", min: 0, suffix: "USD" },
  ],
  dip_buy: [
    { key: "token", label: "Token to buy", type: "select", options: TOKENS.filter((t) => t !== "USDC") },
    { key: "dropPercent", label: "Buy when price drops", type: "number", min: 1, max: 50, suffix: "%" },
    { key: "buyAmountUsd", label: "Buy amount", type: "number", min: 1, suffix: "USD" },
  ],
  take_profit: [
    { key: "token", label: "Token to sell", type: "select", options: TOKENS.filter((t) => t !== "USDC") },
    { key: "gainPercent", label: "Sell when price rises", type: "number", min: 1, max: 100, suffix: "%" },
    { key: "sellPercent", label: "Amount to sell", type: "number", min: 1, max: 100, suffix: "%" },
  ],
};

interface Props {
  strategyKey: StrategyKey;
  template: Template;
  icon: string;
  color: string;
  loading: boolean;
  online: boolean;
  onActivate: (type: StrategyKey, config: Record<string, string | number>) => void;
}

export function StrategyCard({ strategyKey, template, icon, color, loading, online, onActivate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [config, setConfig] = useState<Record<string, string | number>>({ ...template.defaults });

  function updateField(key: string, value: string | number) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="rule-card">
      <div className={`rule-icon ${color}`}>{icon}</div>
      <h3>{template.name}</h3>
      <p>{template.description}</p>

      <button
        type="button"
        className="rule-config-toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {expanded ? "Hide settings" : "Customize settings"}
        <span className="rule-config-chevron">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="rule-config">
          {FIELDS[strategyKey].map((field) => (
            <label key={field.key} className="rule-field">
              <span className="rule-field-label">{field.label}</span>
              <div className="rule-field-input-wrap">
                {field.type === "select" ? (
                  <select
                    className="rule-field-input"
                    value={String(config[field.key] ?? "")}
                    onChange={(e) => updateField(field.key, e.target.value)}
                  >
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="rule-field-input"
                    type="number"
                    min={field.min}
                    max={field.max}
                    value={Number(config[field.key] ?? 0)}
                    onChange={(e) => updateField(field.key, Number(e.target.value))}
                  />
                )}
                {field.suffix && <span className="rule-field-suffix">{field.suffix}</span>}
              </div>
            </label>
          ))}
        </div>
      )}

      <button
        className="btn btn-primary btn-sm"
        onClick={() => onActivate(strategyKey, config)}
        disabled={loading || !online}
        style={{ alignSelf: "flex-start" }}
      >
        Activate Strategy
      </button>
    </div>
  );
}

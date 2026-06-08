"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { GettingStarted } from "../components/GettingStarted";
import { HeroScene } from "../components/HeroScene";
import { StrategyCard } from "../components/StrategyCard";
import { WalletButton } from "../components/WalletButton";
import { formatTxLabel, shortenHash } from "../lib/tx-labels";

const API = process.env.NEXT_PUBLIC_AGENT_API ?? "http://127.0.0.1:3847";
const EXPLORER = "https://sepolia.mantlescan.xyz/address";

interface Status {
  simulationMode: boolean;
  activeRules: number;
  totalDecisions: number;
  contractAddress?: string;
  mantleAddress?: string;
  lastRunAt?: string;
}

interface Template {
  name: string;
  description: string;
  example: string;
  defaults: Record<string, string | number>;
}

interface Decision {
  action: string;
  reasoning: string;
  inputToken: string;
  outputToken: string;
  inputAmount: number;
  outputAmount: number;
  executed: boolean;
  simulated: boolean;
  timestamp: string;
  mantleTxHash?: string;
}

interface OnChainProof {
  network: string;
  chainId: number;
  contractAddress: string | null;
  contractUrl: string | null;
  agentAddress: string | null;
  transactions: Array<{
    hash: string;
    type: string;
    label: string;
    timestamp: string;
    explorerUrl: string;
  }>;
  source: string;
}

const RULE_ICONS: Record<string, { icon: string; color: string }> = {
  weekly_rebalance: { icon: "📅", color: "green" },
  dip_buy: { icon: "📉", color: "blue" },
  take_profit: { icon: "📈", color: "purple" },
};

function formatAction(action: string) {
  return action.replace(/_/g, " ");
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Home() {
  const [status, setStatus] = useState<Status | null>(null);
  const [templates, setTemplates] = useState<Record<string, Template>>({});
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [online, setOnline] = useState(true);
  const [proof, setProof] = useState<OnChainProof | null>(null);

  const refresh = useCallback(async () => {
    const [s, t, d, p] = await Promise.all([
      fetch(`${API}/status`).then((r) => r.json()),
      fetch(`${API}/templates`).then((r) => r.json()),
      fetch(`${API}/decisions`).then((r) => r.json()),
      fetch(`${API}/onchain-proof`).then((r) => r.json()),
    ]);
    setStatus(s);
    setTemplates(t);
    setDecisions(d);
    setProof(p);
    setOnline(true);
    setError(false);
  }, []);

  useEffect(() => {
    refresh().catch(() => {
      setOnline(false);
      setMessage("");
      setError(true);
    });
  }, [refresh]);

  async function addRule(type: string, config: Record<string, string | number> = {}) {
    setLoading(true);
    setMessage("");
    setError(false);
    try {
      await fetch(`${API}/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...config }),
      });
      setMessage(`Strategy "${RULE_ICONS[type] ? templates[type]?.name : type}" activated successfully.`);
      await refresh();
    } catch {
      setMessage("Failed to add strategy. Please try again.");
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function runAgent() {
    setLoading(true);
    setMessage("Agent is analyzing your portfolio…");
    setError(false);
    try {
      const res = await fetch(`${API}/run`, { method: "POST" });
      const data = await res.json();
      setMessage(
        data.count
          ? `${data.count} action${data.count > 1 ? "s" : ""} executed - logged on-chain.`
          : "Portfolio check complete. No rules triggered - you're all set."
      );
      await refresh();
    } catch {
      setOnline(false);
      setMessage("");
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const contractShort = status?.contractAddress
    ? `${status.contractAddress.slice(0, 6)}…${status.contractAddress.slice(-4)}`
    : null;

  return (
    <div className="page">
      {/* ── Navigation ── */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="#" className="logo" aria-label="ClawCFO home">
            <Image
              src="/clawcfo-logo.png"
              alt="ClawCFO"
              width={132}
              height={132}
              className="logo-img"
              priority
            />
          </a>
          <div className="nav-links">
            <a href="#dashboard">Dashboard</a>
            <a href="#strategies">Strategies</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#onchain-proof">On-Chain Proof</a>
            <a href="#activity">Activity</a>
          </div>
          <div className="nav-actions">
            <WalletButton />
            <a href="#dashboard" className="btn btn-primary btn-sm">
              Open Dashboard
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-layout">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              Holographic DeFi · Mantle Network
            </div>
            <h1 className="hero-title">
              <span className="hero-line">Your portfolio,</span>
              <span className="hero-line hero-line-accent">managed on-chain</span>
            </h1>
            <p className="hero-sub">
              Set rules once. ClawCFO monitors your assets, rebalances, buys dips, and takes profit —
              with every decision permanently verified on Mantle.
            </p>
            <div className="hero-cta">
              <a href="#dashboard" className="btn btn-primary">
                Get Started
              </a>
              <a href="#how-it-works" className="btn btn-ghost">
                See How it Works
              </a>
            </div>
          </div>
          <HeroScene />
        </div>

        <div className="hero-visual glass-panel" id="dashboard">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Agent Status</div>
              <div className="stat-value">
                {!online ? (
                  "Offline"
                ) : (
                  <>
                    <span className={`dot ${status?.simulationMode ? "demo" : "live"}`} />
                    {status?.simulationMode ? "Demo" : "Live"}
                  </>
                )}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active Strategies</div>
              <div className="stat-value">{status?.activeRules ?? "-"}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Decisions Made</div>
              <div className="stat-value">{status?.totalDecisions ?? "-"}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">On-Chain Registry</div>
              <div className="stat-value sm">
                {contractShort ? (
                  <a
                    href={`${EXPLORER}/${status!.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--accent)" }}
                  >
                    {contractShort} ↗
                  </a>
                ) : (
                  "Connecting…"
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dashboard Panel ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Agent Control Center</span>
            <div className="panel-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => refresh()} disabled={loading}>
                Refresh
              </button>
              <button className="btn btn-primary btn-sm" onClick={runAgent} disabled={loading || !online}>
                {loading ? "Running…" : "Run Agent Now"}
              </button>
            </div>
          </div>
          <div className="panel-body">
            {message && <div className={`toast ${error ? "error" : ""}`}>{message}</div>}
            <GettingStarted offline={!online} />
          </div>
        </div>
      </section>

      {/* ── On-Chain Proof ── */}
      <section className="section" id="onchain-proof" style={{ paddingTop: 0 }}>
        <div className="proof-panel">
          <div className="proof-header">
            <div>
              <div className="proof-badge">
                <span className="hero-eyebrow-dot" />
                Mantle Sepolia Testnet
              </div>
              <h2 className="section-title" style={{ marginTop: "0.75rem", marginBottom: "0.35rem" }}>
                On-Chain Proof
              </h2>
              <p className="section-desc" style={{ marginBottom: 0 }}>
                Every agent action is permanently recorded on Mantle. Verify any transaction on the explorer.
              </p>
            </div>
            {proof?.contractUrl && (
              <a href={proof.contractUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                View Contract ↗
              </a>
            )}
          </div>

          <div className="proof-meta">
            <span>
              <strong>Network:</strong> {proof?.network ?? "Mantle Sepolia Testnet"}
            </span>
            {proof?.agentAddress && (
              <span>
                <strong>Agent:</strong> {proof.agentAddress.slice(0, 6)}…{proof.agentAddress.slice(-4)}
              </span>
            )}
          </div>

          <div className="proof-tx-list">
            {!proof?.transactions?.length && (
              <div className="empty-state" style={{ padding: "2rem 1rem" }}>
                <div className="empty-state-icon">⛓</div>
                <p>No on-chain transactions yet.</p>
                <p style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
                  Activate a strategy and run the agent to generate verifiable Mantle Sepolia transactions.
                </p>
              </div>
            )}
            {proof?.transactions?.map((tx) => (
              <div key={tx.hash} className="proof-tx-item">
                <div>
                  <div className="proof-tx-label">{formatTxLabel(tx.label)}</div>
                  <div className="proof-tx-hash">{shortenHash(tx.hash)}</div>
                  <div className="proof-tx-time">{formatTime(tx.timestamp)}</div>
                </div>
                <a
                  href={tx.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="proof-tx-link"
                >
                  Verify ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Strategies ── */}
      <section className="section" id="strategies">
        <div className="section-header">
          <div className="section-label">Strategies</div>
          <h2 className="section-title">Pre-built rules, zero complexity</h2>
          <p className="section-desc">
            Choose a strategy template and activate it in one click. ClawCFO handles execution,
            slippage, and on-chain logging automatically.
          </p>
        </div>

        <div className="rules-grid">
          {Object.entries(templates).map(([key, t]) => {
            const meta = RULE_ICONS[key] ?? { icon: "⚡", color: "green" };
            return (
              <StrategyCard
                key={key}
                strategyKey={key as "weekly_rebalance" | "dip_buy" | "take_profit"}
                template={t}
                icon={meta.icon}
                color={meta.color}
                loading={loading}
                online={online}
                onActivate={addRule}
              />
            );
          })}
          {!Object.keys(templates).length && (
            <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
              <div className="empty-state-icon">⏳</div>
              <p>Loading strategies…</p>
            </div>
          )}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="section" id="how-it-works">
        <div className="section-header center">
          <div className="section-label">How it Works</div>
          <h2 className="section-title">Three steps to autonomous finance</h2>
          <p className="section-desc">
            No trading expertise required. Connect, configure, and let your agent handle the rest.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <h3>Set your rules</h3>
            <p>
              Pick a strategy - weekly rebalance, dip buying, or take profit. Define thresholds
              in plain language. No code, no complex DeFi interfaces.
            </p>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <h3>Agent monitors 24/7</h3>
            <p>
              ClawCFO watches your portfolio around the clock. When conditions match your rules,
              it prepares and executes swaps through on-chain liquidity.
            </p>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <h3>Verified on-chain</h3>
            <p>
              Every decision is permanently logged on-chain. Full audit trail, zero black boxes -
              you always know exactly what your agent did and why.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section">
        <div className="section-header center">
          <div className="section-label">Why ClawCFO</div>
          <h2 className="section-title">Built for trust</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <h3>🔒 Non-custodial by design</h3>
            <p>
              Your keys stay in your wallet. The agent prepares transactions - you stay in control
              of every signature.
            </p>
          </div>
          <div className="feature-card">
            <h3>📜 Immutable audit log</h3>
            <p>
              Every agent decision is written to an on-chain registry. Transparent, verifiable,
              and permanent.
            </p>
          </div>
          <div className="feature-card">
            <h3>🤖 Truly autonomous</h3>
            <p>
              Set rules once and walk away. Rebalancing, dip buys, and profit-taking happen
              automatically - no manual intervention.
            </p>
          </div>
          <div className="feature-card">
            <h3>💬 Telegram + Web</h3>
            <p>
              Manage strategies from the dashboard or your phone. Same agent, same rules,
              wherever you are.
            </p>
          </div>
          <div className="feature-card">
            <h3>⚡ Best execution</h3>
            <p>
              Swaps routed through concentrated liquidity markets with slippage protection
              and pre-trade previews.
            </p>
          </div>
          <div className="feature-card">
            <h3>🧪 Risk-free demo</h3>
            <p>
              Try every feature in demo mode with simulated portfolios before going live.
            </p>
          </div>
        </div>
      </section>

      {/* ── Activity ── */}
      <section className="section" id="activity">
        <div className="section-header">
          <div className="section-label">Activity</div>
          <h2 className="section-title">Decision log</h2>
          <p className="section-desc">
            A complete history of every action your agent has taken, with on-chain verification.
          </p>
        </div>

        <div className="activity-list">
          {decisions.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>No activity yet.</p>
              <p style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
                Activate a strategy and run the agent to see decisions here.
              </p>
            </div>
          )}
          {decisions.map((d, i) => (
            <div key={i} className="activity-item">
              <div className="activity-icon">{d.executed ? "✓" : "-"}</div>
              <div>
                <div className="activity-action">
                  {formatAction(d.action)}
                  <span className={`activity-badge ${d.executed ? "ok" : "demo"}`}>
                    {d.executed ? "Executed" : "Skipped"}
                  </span>
                  {d.simulated && <span className="activity-badge demo">Demo</span>}
                </div>
                <p className="activity-reason">{d.reasoning}</p>
                <p className="activity-swap">
                  {d.inputAmount.toFixed(2)} {d.inputToken} → {d.outputAmount.toFixed(4)} {d.outputToken}
                  {d.mantleTxHash && (
                    <>
                      {" · "}
                      <a
                        href={`https://sepolia.mantlescan.xyz/tx/${d.mantleTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--accent)" }}
                      >
                        Mantle tx ↗
                      </a>
                    </>
                  )}
                </p>
              </div>
              <span className="activity-time">{formatTime(d.timestamp)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <strong>ClawCFO</strong> - Autonomous on-chain wealth management
          </div>
          <div className="footer-links">
            <a href="#dashboard">Dashboard</a>
            <a href="#strategies">Strategies</a>
            <a href="#how-it-works">How it Works</a>
            {status?.contractAddress && (
              <a href={`${EXPLORER}/${status.contractAddress}`} target="_blank" rel="noopener noreferrer">
                On-Chain Registry ↗
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

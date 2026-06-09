"use client";

import { useCallback, useEffect, useState } from "react";

interface WalletState {
  solana?: string;
  mantle?: string;
}

type PhantomSolana = {
  isPhantom?: boolean;
  isConnected?: boolean;
  publicKey?: { toString(): string };
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
};

function getPhantomProvider(): PhantomSolana | undefined {
  if (typeof window === "undefined") return undefined;

  const w = window as Window & {
    phantom?: { solana?: PhantomSolana };
    solana?: PhantomSolana;
  };

  if (w.phantom?.solana?.isPhantom) return w.phantom.solana;
  if (w.solana?.isPhantom) return w.solana;
  return w.phantom?.solana ?? w.solana;
}

async function waitForPhantom(timeoutMs = 3000): Promise<PhantomSolana | undefined> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const provider = getPhantomProvider();
    if (provider?.isPhantom) return provider;
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  return getPhantomProvider();
}

function phantomErrorMessage(err: unknown): string {
  const code = (err as { code?: number })?.code;
  const message = String((err as { message?: string })?.message ?? "");

  if (code === 4001 || /user rejected|user declined/i.test(message)) {
    return "You cancelled in Phantom. Click Phantom again and press Connect.";
  }
  if (/locked/i.test(message)) {
    return "Unlock Phantom (enter password), then try again.";
  }
  return "Phantom failed to connect. Open the Phantom extension, unlock it, refresh this page, and try again.";
}

export function WalletButton() {
  const [wallets, setWallets] = useState<WalletState>({});
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState<"phantom" | "metamask" | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("clawcfo_wallets");
    if (saved) setWallets(JSON.parse(saved) as WalletState);
  }, []);

  const save = useCallback((updater: WalletState | ((prev: WalletState) => WalletState)) => {
    setWallets((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem("clawcfo_wallets", JSON.stringify(next));
      return next;
    });
  }, []);

  async function connectPhantom() {
    setError("");
    setConnecting("phantom");

    try {
      const provider = await waitForPhantom();
      if (!provider?.isPhantom) {
        setError("Phantom extension not found. Install it, then refresh this page.");
        window.open("https://phantom.app/download", "_blank");
        return;
      }

      if (provider.isConnected && provider.publicKey) {
        save((prev) => ({ ...prev, solana: provider.publicKey!.toString() }));
        setOpen(false);
        return;
      }

      const res = await provider.connect({ onlyIfTrusted: false });
      save((prev) => ({ ...prev, solana: res.publicKey.toString() }));
      setOpen(false);
    } catch (err) {
      console.error("Phantom connect error:", err);
      setError(phantomErrorMessage(err));
    } finally {
      setConnecting(null);
    }
  }

  async function connectMetaMask() {
    setError("");
    setConnecting("metamask");

    const eth = (window as Window & { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<string[]> } }).ethereum;
    if (!eth) {
      setError("MetaMask extension not found. Install it, then refresh this page.");
      window.open("https://metamask.io/download/", "_blank");
      setConnecting(null);
      return;
    }

    try {
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      await eth
        .request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x138b",
              chainName: "Mantle Sepolia",
              rpcUrls: ["https://rpc.sepolia.mantle.xyz"],
              nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
              blockExplorerUrls: ["https://sepolia.mantlescan.xyz"],
            },
          ],
        })
        .catch(() => {});
      save((prev) => ({ ...prev, mantle: accounts[0] }));
      setOpen(false);
    } catch (err) {
      console.error("MetaMask connect error:", err);
      const code = (err as { code?: number })?.code;
      setError(
        code === 4001
          ? "You cancelled in MetaMask. Click MetaMask again and approve."
          : "MetaMask connection failed. Unlock MetaMask and try again."
      );
    } finally {
      setConnecting(null);
    }
  }

  function disconnect() {
    save({});
    setOpen(false);
    setError("");
  }

  const connected = Boolean(wallets.solana || wallets.mantle);
  const label = connected
    ? `${(wallets.solana ?? wallets.mantle)!.slice(0, 4)}…${(wallets.solana ?? wallets.mantle)!.slice(-4)}`
    : "Connect Wallet";

  return (
    <div style={{ position: "relative" }}>
      <button
        className={`btn ${connected ? "btn-ghost" : "btn-primary"} btn-sm`}
        type="button"
        onClick={() => setOpen(!open)}
      >
        {label}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            minWidth: 260,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-strong)",
            borderRadius: 12,
            padding: "0.75rem",
            zIndex: 200,
            boxShadow: "var(--shadow)",
          }}
        >
          {!wallets.solana && (
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={connectPhantom}
              disabled={connecting !== null}
              style={{ width: "100%", marginBottom: wallets.mantle ? "0.5rem" : 0 }}
            >
              {connecting === "phantom" ? "Connecting Phantom…" : "Phantom"}
            </button>
          )}
          {!wallets.mantle && (
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={connectMetaMask}
              disabled={connecting !== null}
              style={{ width: "100%", marginBottom: connected ? "0.5rem" : 0 }}
            >
              {connecting === "metamask" ? "Connecting MetaMask…" : "MetaMask"}
            </button>
          )}
          {wallets.solana && (
            <p style={{ fontSize: "0.78rem", marginBottom: "0.4rem", wordBreak: "break-all" }}>
              <strong>Solana:</strong> {wallets.solana}
            </p>
          )}
          {wallets.mantle && (
            <p style={{ fontSize: "0.78rem", marginBottom: connected ? "0.75rem" : 0, wordBreak: "break-all" }}>
              <strong>Mantle:</strong> {wallets.mantle}
            </p>
          )}
          {connected && (
            <button className="btn btn-ghost btn-sm" type="button" onClick={disconnect} style={{ width: "100%" }}>
              Disconnect
            </button>
          )}
          {error && (
            <p style={{ fontSize: "0.75rem", color: "var(--warning)", marginTop: "0.5rem", lineHeight: 1.45 }}>
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

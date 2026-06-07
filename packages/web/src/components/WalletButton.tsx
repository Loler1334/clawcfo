"use client";

import { useCallback, useEffect, useState } from "react";

interface WalletState {
  solana?: string;
  mantle?: string;
}

export function WalletButton() {
  const [wallets, setWallets] = useState<WalletState>({});
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("clawcfo_wallets");
    if (saved) setWallets(JSON.parse(saved) as WalletState);
  }, []);

  const save = useCallback((next: WalletState) => {
    setWallets(next);
    localStorage.setItem("clawcfo_wallets", JSON.stringify(next));
  }, []);

  async function connectPhantom() {
    setError("");
    const provider = (window as Window & { phantom?: { solana?: { connect: () => Promise<{ publicKey: { toString: () => string } }> } } }).phantom?.solana;
    if (!provider) {
      setError("Install Phantom wallet extension first.");
      window.open("https://phantom.app/", "_blank");
      return;
    }
    try {
      const res = await provider.connect();
      save({ ...wallets, solana: res.publicKey.toString() });
      setOpen(false);
    } catch {
      setError("Phantom connection was cancelled or failed.");
    }
  }

  async function connectMetaMask() {
    setError("");
    const eth = (window as Window & { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<string[]> } }).ethereum;
    if (!eth) {
      setError("Install MetaMask extension first.");
      window.open("https://metamask.io/", "_blank");
      return;
    }
    try {
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      await eth.request({
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
      }).catch(() => {});
      save({ ...wallets, mantle: accounts[0] });
      setOpen(false);
    } catch {
      setError("MetaMask connection was cancelled or failed.");
    }
  }

  function disconnect() {
    save({});
    setOpen(false);
  }

  const connected = wallets.solana || wallets.mantle;
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
          {!connected ? (
            <>
              <button className="btn btn-ghost btn-sm" type="button" onClick={connectPhantom} style={{ width: "100%", marginBottom: "0.5rem" }}>
                Phantom
              </button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={connectMetaMask} style={{ width: "100%" }}>
                MetaMask
              </button>
            </>
          ) : (
            <>
              {wallets.solana && (
                <p style={{ fontSize: "0.78rem", marginBottom: "0.4rem", wordBreak: "break-all" }}>
                  <strong>Solana:</strong> {wallets.solana}
                </p>
              )}
              {wallets.mantle && (
                <p style={{ fontSize: "0.78rem", marginBottom: "0.75rem", wordBreak: "break-all" }}>
                  <strong>Mantle:</strong> {wallets.mantle}
                </p>
              )}
              <button className="btn btn-ghost btn-sm" type="button" onClick={disconnect} style={{ width: "100%" }}>
                Disconnect
              </button>
            </>
          )}
          {error && (
            <p style={{ fontSize: "0.75rem", color: "var(--warning)", marginTop: "0.5rem" }}>{error}</p>
          )}
        </div>
      )}
    </div>
  );
}

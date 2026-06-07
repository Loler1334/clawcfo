type Props = {
  offline?: boolean;
};

export function GettingStarted({ offline = false }: Props) {
  return (
    <div className="getting-started">
      {offline && (
        <div className="getting-started-banner">
          <span>⏳</span>
          <p>
            The agent service is temporarily unavailable. Click <strong>Refresh</strong> in a moment.
            No setup is required on your side.
          </p>
        </div>
      )}

      <h3>How to use your Personal CFO</h3>
      <p className="getting-started-intro">
        ClawCFO is your autonomous finance helper. Connect your wallet, set a simple rule, and the
        agent handles the rest. Every decision is recorded on Mantle for full transparency.
      </p>

      <div className="getting-started-steps">
        <div className="getting-started-step">
          <span className="step-num">1</span>
          <div>
            <strong>Connect your wallet</strong>
            <p>
              Click <strong>Connect Wallet</strong> in the top right. Use Phantom for swaps and
              MetaMask for Mantle. Your keys never leave your device.
            </p>
          </div>
        </div>

        <div className="getting-started-step">
          <span className="step-num">2</span>
          <div>
            <strong>Pick a strategy</strong>
            <p>
              Scroll to <strong>Strategies</strong> and click <strong>Activate Strategy</strong> on
              any template — weekly rebalance, dip buy, or take profit.
            </p>
          </div>
        </div>

        <div className="getting-started-step">
          <span className="step-num">3</span>
          <div>
            <strong>Run your agent</strong>
            <p>
              Press <strong>Run Agent Now</strong>. The agent checks your portfolio against your
              rules and acts automatically when conditions are met.
            </p>
          </div>
        </div>

        <div className="getting-started-step">
          <span className="step-num">4</span>
          <div>
            <strong>Verify on-chain</strong>
            <p>
              Open <strong>On-Chain Proof</strong> to see every action on Mantle Sepolia. Click
              <strong> Verify ↗</strong> to view the transaction on the public explorer.
            </p>
          </div>
        </div>
      </div>

      <p className="getting-started-footer">
        You can also manage your agent from our Telegram bot — same rules, same on-chain logs.
      </p>
    </div>
  );
}

const TELEGRAM_BOT = "https://t.me/my_mantle_cfo_bot";

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
          </p>
        </div>
      )}

      <h3>How to use your Personal CFO</h3>
      <p className="getting-started-intro">
        Connect your wallet, pick a strategy, and run the agent. Every decision is recorded on Mantle.
      </p>

      <div className="getting-started-steps">
        <div className="getting-started-step">
          <span className="step-num">1</span>
          <strong>Connect your wallet</strong>
        </div>
        <div className="getting-started-step">
          <span className="step-num">2</span>
          <strong>Pick &amp; configure a strategy</strong>
        </div>
        <div className="getting-started-step">
          <span className="step-num">3</span>
          <strong>Run your agent</strong>
        </div>
      </div>

      <p className="getting-started-footer">
        You can also manage your agent from our Telegram bot — same rules, same on-chain logs.{" "}
        <a href={TELEGRAM_BOT} target="_blank" rel="noopener noreferrer" className="telegram-link">
          @my_mantle_cfo_bot
        </a>
      </p>
    </div>
  );
}

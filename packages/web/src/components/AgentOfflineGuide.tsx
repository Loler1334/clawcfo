"use client";

const API = process.env.NEXT_PUBLIC_AGENT_API ?? "http://127.0.0.1:3847";
const HEALTH_URL = `${API}/health`;

export function AgentOfflineGuide() {
  return (
    <div className="offline-guide">
      <div className="offline-guide-header">
        <span className="offline-guide-icon">⚡</span>
        <div>
          <h3>Agent is offline</h3>
          <p>
            The dashboard cannot reach the ClawCFO agent right now. Follow the steps below to bring it back online.
          </p>
        </div>
      </div>

      <div className="offline-guide-section">
        <h4>Step 1 — Check the agent server (Railway)</h4>
        <ol>
          <li>
            Open your <strong>Railway</strong> project and make sure the agent service status is{" "}
            <strong>Active / Deployed</strong>.
          </li>
          <li>
            Copy the public URL from <strong>Settings → Networking → Domain</strong>.
          </li>
          <li>
            Test it in a new browser tab:{" "}
            <a href={HEALTH_URL} target="_blank" rel="noopener noreferrer">
              {HEALTH_URL}
            </a>
          </li>
          <li>
            You should see: <code>{"{\"ok\":true,\"service\":\"personal-cfo-agent\"}"}</code>
          </li>
        </ol>
      </div>

      <div className="offline-guide-section">
        <h4>Step 2 — Connect the website (Vercel)</h4>
        <ol>
          <li>
            Open <strong>Vercel → clawcfo-web → Settings → Environment Variables</strong>.
          </li>
          <li>
            Set <code>NEXT_PUBLIC_AGENT_API</code> to your Railway URL (no <code>/health</code> at the end).
          </li>
          <li>
            Example: <code>https://personal-cfoagent-production.up.railway.app</code>
          </li>
          <li>
            Click <strong>Redeploy</strong> on Vercel after saving.
          </li>
        </ol>
      </div>

      <div className="offline-guide-section">
        <h4>Step 3 — Allow the website to talk to the agent</h4>
        <ol>
          <li>
            In <strong>Railway → Variables</strong>, set <code>ALLOWED_ORIGINS</code> to your Vercel URL.
          </li>
          <li>
            Example: <code>https://clawcfo-web.vercel.app</code>
          </li>
          <li>Save and wait for Railway to redeploy (about 1–2 minutes).</li>
        </ol>
      </div>

      <div className="offline-guide-section">
        <h4>Step 4 — Refresh this page</h4>
        <p>
          Click the <strong>Refresh</strong> button above. When everything is connected, Agent Status will change
          from <strong>Offline</strong> to <strong>Demo</strong> or <strong>Live</strong>.
        </p>
      </div>

      <div className="offline-guide-note">
        <strong>Running locally?</strong> Open two terminals in the project folder:{" "}
        <code>npm run dev:agent</code> then <code>npm run dev:web</code>, and visit{" "}
        <code>http://localhost:3000</code>.
      </div>
    </div>
  );
}

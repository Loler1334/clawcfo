import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../../.env") });

export const config = {
  port: Number(process.env.PORT ?? process.env.AGENT_API_PORT ?? 3847),
  host: process.env.AGENT_API_HOST ?? "0.0.0.0",
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",").map((s) => s.trim()) ?? ["*"],
  simulationMode: process.env.SIMULATION_MODE !== "false",
  byrealWallet: /^0x[a-fA-F0-9]{40}$/.test(process.env.BYREAL_WALLET_ADDRESS ?? "")
    ? process.env.BYREAL_WALLET_ADDRESS
    : undefined,
  byrealCliPath: process.env.BYREAL_CLI_PATH ?? "byreal-cli",
  mantleRpc: process.env.MANTLE_RPC_URL ?? "https://rpc.sepolia.mantle.xyz",
  mantlePrivateKey: process.env.AGENT_PRIVATE_KEY,
  contractAddress: process.env.AGENT_CFO_CONTRACT_ADDRESS,
  openAiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  dataDir: process.env.DATA_DIR ?? path.join(__dirname, "../../../data"),
};

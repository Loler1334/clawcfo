import { execFile } from "child_process";
import { promisify } from "util";
import { config } from "./config.js";
import type { WalletBalance } from "./types.js";

const execFileAsync = promisify(execFile);

async function runCli(args: string[]): Promise<unknown> {
  if (config.simulationMode) {
    return null;
  }

  const fullArgs = [...args, "--json"];
  if (config.byrealWallet) {
    fullArgs.push("--wallet-address", config.byrealWallet);
  }

  const { stdout } = await execFileAsync(config.byrealCliPath, fullArgs, {
    timeout: 30_000,
    maxBuffer: 2 * 1024 * 1024,
  });

  const trimmed = stdout.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed);
}

export async function getWalletBalances(): Promise<WalletBalance[]> {
  if (config.simulationMode) {
    return [
      { token: "USDC", amount: 1200, usdValue: 1200 },
      { token: "SOL", amount: 5.2, usdValue: 780 },
      { token: "mSOL", amount: 2.1, usdValue: 420 },
    ];
  }

  const result = (await runCli(["wallet", "balance"])) as {
    balances?: Array<{ symbol: string; amount: string; usdValue?: string }>;
  } | null;

  if (!result?.balances) return [];

  return result.balances.map((b) => ({
    token: b.symbol,
    amount: Number(b.amount),
    usdValue: Number(b.usdValue ?? b.amount),
  }));
}

export async function previewSwap(
  inputToken: string,
  outputToken: string,
  amount: number
): Promise<{ outputAmount: number; priceImpact: number }> {
  if (config.simulationMode) {
    const rate = inputToken === "USDC" ? 0.004 : 250;
    return {
      outputAmount: amount * rate,
      priceImpact: 0.12,
    };
  }

  const result = (await runCli([
    "swap",
    "execute",
    "--input",
    inputToken,
    "--output",
    outputToken,
    "--amount",
    String(amount),
    "--dry-run",
  ])) as { outputAmount?: string; priceImpact?: string } | null;

  return {
    outputAmount: Number(result?.outputAmount ?? 0),
    priceImpact: Number(result?.priceImpact ?? 0),
  };
}

export async function executeSwap(
  inputToken: string,
  outputToken: string,
  amount: number
): Promise<{ success: boolean; txHash?: string; outputAmount: number }> {
  const preview = await previewSwap(inputToken, outputToken, amount);

  if (config.simulationMode) {
    return {
      success: true,
      txHash: `sim-${Date.now()}`,
      outputAmount: preview.outputAmount,
    };
  }

  const result = (await runCli([
    "swap",
    "execute",
    "--input",
    inputToken,
    "--output",
    outputToken,
    "--amount",
    String(amount),
    "--execute",
  ])) as { txHash?: string; outputAmount?: string; success?: boolean } | null;

  return {
    success: Boolean(result?.success ?? true),
    txHash: result?.txHash,
    outputAmount: Number(result?.outputAmount ?? preview.outputAmount),
  };
}

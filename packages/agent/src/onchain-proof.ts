import { config } from "./config.js";
import { getOnChainTxs } from "./storage.js";
import { formatTxLabel } from "./tx-labels.js";

const EXPLORER_TX = "https://sepolia.mantlescan.xyz/tx";
const EXPLORER_CONTRACT = "https://sepolia.mantlescan.xyz/address";

export interface OnChainProofTx {
  hash: string;
  type: string;
  label: string;
  timestamp: string;
  explorerUrl: string;
}

export interface OnChainProof {
  network: string;
  chainId: number;
  contractAddress: string | null;
  contractUrl: string | null;
  agentAddress: string | null;
  transactions: OnChainProofTx[];
  source: "local" | "explorer" | "none";
}

function labelForMethod(input: string): string {
  if (input.startsWith("0x")) return "On-chain action ✅";
  return formatTxLabel(input);
}

async function fetchFromExplorer(contractAddress: string, limit = 6): Promise<OnChainProofTx[]> {
  const url =
    `https://api-sepolia.mantlescan.xyz/api?module=account&action=txlist` +
    `&address=${contractAddress}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc`;

  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    result?: Array<{ hash: string; timeStamp: string; functionName?: string; methodId?: string }>;
  };

  if (data.status !== "1" || !Array.isArray(data.result)) return [];

  return data.result.map((tx) => ({
    hash: tx.hash,
    type: "explorer",
    label: formatTxLabel(tx.functionName?.split("(")[0] || labelForMethod(tx.methodId ?? "")),
    timestamp: new Date(Number(tx.timeStamp) * 1000).toISOString(),
    explorerUrl: `${EXPLORER_TX}/${tx.hash}`,
  }));
}

export async function getOnChainProof(agentAddress?: string): Promise<OnChainProof> {
  const contractAddress = config.contractAddress ?? null;
  const local = getOnChainTxs();

  let transactions: OnChainProofTx[] = local.map((tx) => ({
    hash: tx.hash,
    type: tx.type,
    label: formatTxLabel(tx.label),
    timestamp: tx.timestamp,
    explorerUrl: `${EXPLORER_TX}/${tx.hash}`,
  }));

  let source: OnChainProof["source"] = local.length ? "local" : "none";

  if (contractAddress) {
    const explorerTxs = await fetchFromExplorer(contractAddress);
    if (explorerTxs.length) {
      const seen = new Set(transactions.map((t) => t.hash));
      for (const tx of explorerTxs) {
        if (!seen.has(tx.hash)) transactions.push(tx);
      }
      transactions = transactions
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);
      source = local.length ? "local" : "explorer";
    }
  }

  return {
    network: "Mantle Sepolia Testnet",
    chainId: 5003,
    contractAddress,
    contractUrl: contractAddress ? `${EXPLORER_CONTRACT}/${contractAddress}` : null,
    agentAddress: agentAddress ?? null,
    transactions,
    source,
  };
}

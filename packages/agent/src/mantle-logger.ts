import { ethers } from "ethers";
import { config } from "./config.js";
import type { AgentDecision } from "./types.js";

const ABI = [
  "function triggerAgentEvaluation() external returns (uint256)",
  "function logDecision(address agentOwner, string action, string reasoning, string inputToken, string outputToken, uint256 inputAmount, uint256 outputAmount, bool executed, bytes32 txHash) external returns (uint256)",
  "function createRule(string ruleType, string paramsJson) external returns (uint256)",
  "function getOwnerDecisions(address agentOwner) external view returns (uint256[])",
  "event DecisionLogged(uint256 indexed decisionId, address indexed agentOwner, string action, bool executed)",
];

let provider: ethers.JsonRpcProvider | null = null;
let wallet: ethers.Wallet | null = null;
let contract: ethers.Contract | null = null;

function getContract(): ethers.Contract | null {
  if (!config.contractAddress || !config.mantlePrivateKey) return null;

  if (!contract) {
    provider = new ethers.JsonRpcProvider(config.mantleRpc);
    wallet = new ethers.Wallet(
      config.mantlePrivateKey.startsWith("0x")
        ? config.mantlePrivateKey
        : `0x${config.mantlePrivateKey}`,
      provider
    );
    contract = new ethers.Contract(config.contractAddress, ABI, wallet);
  }

  return contract;
}

export async function triggerOnChainEvaluation(): Promise<string | null> {
  const c = getContract();
  if (!c) return null;
  const tx = await c.triggerAgentEvaluation();
  const receipt = await tx.wait();
  return receipt.hash as string;
}

export async function logDecisionOnChain(
  ownerAddress: string,
  decision: AgentDecision
): Promise<string | null> {
  const c = getContract();
  if (!c) return null;

  const txHashBytes = decision.onChainTxHash
    ? ethers.id(decision.onChainTxHash)
    : ethers.ZeroHash;

  const tx = await c.logDecision(
    ownerAddress,
    decision.action,
    decision.reasoning,
    decision.inputToken,
    decision.outputToken,
    ethers.parseUnits(decision.inputAmount.toFixed(6), 6),
    ethers.parseUnits(decision.outputAmount.toFixed(6), 6),
    decision.executed,
    txHashBytes
  );

  const receipt = await tx.wait();
  return receipt.hash as string;
}

export async function createRuleOnChain(
  ruleType: string,
  paramsJson: string
): Promise<string | null> {
  const c = getContract();
  if (!c) return null;
  const tx = await c.createRule(ruleType, paramsJson);
  const receipt = await tx.wait();
  return receipt.hash as string;
}

export function getMantleAddress(): string | undefined {
  return wallet?.address;
}

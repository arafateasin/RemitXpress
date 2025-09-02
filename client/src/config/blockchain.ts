import { createPublicClient, createWalletClient, http } from "viem";
import { sepolia } from "viem/chains";

// Alchemy configuration for Ethereum Sepolia
const ALCHEMY_API_KEY = "7C_t_X6KMYfZ8UDJkPE3o";
const RPC_URL = `https://eth-sepolia.g.alchemy.com/v2/7C_t_X6KMYfZ8UDJkPE3o`;

// Create public client for reading blockchain data
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

// Blockchain configuration
export const blockchainConfig = {
  chainId: sepolia.id,
  chainName: sepolia.name,
  rpcUrl: RPC_URL,
  explorerUrl: "https://sepolia.etherscan.io",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
};

// Transaction types for RemitXpress
export interface BlockchainTransaction {
  hash: string;
  blockNumber: bigint;
  blockHash: string;
  from: string;
  to: string;
  value: bigint;
  gasUsed: bigint;
  gasPrice: bigint;
  status: "success" | "failed";
  timestamp: number;
}

// Smart contract addresses (to be deployed)
export const REMITXPRESS_CONTRACTS = {
  // These will be populated after contract deployment
  REMITTANCE: "0x0000000000000000000000000000000000000000", // Placeholder
  USDT: "0x0000000000000000000000000000000000000000", // Sepolia USDT (if available)
  USDC: "0x0000000000000000000000000000000000000000", // Sepolia USDC (if available)
};

// Gas settings for Sepolia testnet
export const GAS_SETTINGS = {
  gasLimit: 100000n,
  maxFeePerGas: 20000000000n, // 20 gwei
  maxPriorityFeePerGas: 2000000000n, // 2 gwei
};

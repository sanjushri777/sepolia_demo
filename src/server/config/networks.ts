/* eslint-disable @typescript-eslint/no-explicit-any */
import { BITNET_ABI_BLOCKDAG, BITNET_ABI_SEPOLIA } from "../bitnet_abi";

// Prefer .env values for contract addresses and RPC URLs
export const NETWORKS = {
  blockdag: {
    chainId: 1043,
    rpcUrl: process.env.BLOCKDAG_RPC_URL || "",
    contractAddress: process.env.BLOCKDAG_CONTRACT_ADDRESS || "",
    abi: BITNET_ABI_BLOCKDAG,
    name: "BlockDAG",
  },
  sepolia: {
    chainId: 11155111,
    rpcUrl: process.env.SEPOLIA_RPC_URL || "",
    contractAddress: process.env.SEPOLIA_CONTRACT_ADDRESS || "",
    abi: BITNET_ABI_SEPOLIA,
    name: "Sepolia",
  },
};

// For chainId-based lookup
export const CONTRACT_ADDRESSES: Record<string, string> = {
  "1043": process.env.BLOCKDAG_CONTRACT_ADDRESS || "",
  "11155111": process.env.SEPOLIA_CONTRACT_ADDRESS || "",
};

// For ABI lookup by chainId
export const ABI_BY_CHAIN: Record<string, any> = {
  "1043": BITNET_ABI_BLOCKDAG,
  "11155111": BITNET_ABI_SEPOLIA,
};

export const NETWORK_BY_CHAINID: Record<string, typeof NETWORKS.blockdag> = {
  "1043": NETWORKS.blockdag,
  "11155111": NETWORKS.sepolia,
};
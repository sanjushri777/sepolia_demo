import { BITNET_ABI_BLOCKDAG } from "../bitnet_abi";

// Prefer .env values for contract addresses and RPC URLs
export const NETWORKS = {
  
  blockdag: {
    chainId: 1043,
    rpcUrl: process.env.BLOCKDAG_RPC_URL || "",
    contractAddress: process.env.BLOCKDAG_CONTRACT_ADDRESS || "",
    abi: BITNET_ABI_BLOCKDAG,
    name: "BlockDAG",
  },
};

// For chainId-based lookup
export const CONTRACT_ADDRESSES: Record<string, string> = {
  
  "1043": process.env.BLOCKDAG_CONTRACT_ADDRESS || "",   // BlockDAG
};

// For ABI lookup by chainId
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ABI_BY_CHAIN: Record<string, any> = {
  
  "1043": BITNET_ABI_BLOCKDAG,
};

// For display or config, get all network info by chainIdw
export const NETWORK_BY_CHAINID: Record<string, typeof NETWORKS.blockdag> = {
  
  "1043": NETWORKS.blockdag,
};
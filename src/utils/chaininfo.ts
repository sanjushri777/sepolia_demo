import { BITNET_ABI_BLOCKDAG, BITNET_ABI_SEPOLIA } from "@/constants/abi";
import { blockdagPrimordial, sepolia } from "@/chains";
/* eslint-disable @typescript-eslint/no-explicit-any */
export const CHAIN_INFO: Record<number, {
  name: string;
  rpcUrl: string;
  explorer: string;
  symbol: string;
  contractAddress?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abi?: any;
}> = {
  1043: {
    name: blockdagPrimordial.name,
    rpcUrl: blockdagPrimordial.rpcUrls.default.http[0],
    explorer: "https://primordial.bdagscan.com/",
    symbol: "BDAG",
    contractAddress: process.env.NEXT_PUBLIC_BLOCKDAG_CONTRACT_ADDRESS,
    abi: BITNET_ABI_BLOCKDAG
  },
  11155111: {
    name: sepolia.name,
    rpcUrl: sepolia.rpcUrls.default.http[0],
    explorer: "https://sepolia.etherscan.io/",
    symbol: "ETH",
    contractAddress: process.env.NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS,
    abi: BITNET_ABI_SEPOLIA
  }
};
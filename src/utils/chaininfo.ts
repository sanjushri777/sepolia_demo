import { blockdagPrimordial } from "@/chains";

export const CHAIN_INFO: Record<number, {
  name: string;
  rpcUrl: string;
  explorer: string;
  symbol: string;
}> = {
  1043: {
    name: blockdagPrimordial.name,
    rpcUrl: blockdagPrimordial.rpcUrls.default.http[0],
    explorer: "https://primordial.bdagscan.com/",
    symbol:"BDAG"
  },
  
};
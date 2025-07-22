/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { ethers, formatUnits } from "ethers";
import { BITNET_ABI_BLOCKDAG } from "@/constants/abi";
import { useChainId } from "wagmi";
import { CHAIN_INFO } from "@/utils/chaininfo"; // <-- import your mapping!

export type BitnetEvent = {
  type: "donate" | "request" | "unlock" | "burn";
  wallet: string;
  requester?: string;
  amount: string;
  description: string;
  tx: string;
  timestamp: number | string; // will be replaced with ISO string!
};

export function useBitnetHistory() {
  const [events, setEvents] = useState<BitnetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const chainId = useChainId();
  const chain = CHAIN_INFO[chainId];

  useEffect(() => {
    if (!chain) return; // Don't fetch if unknown chain

    let isMounted = true;
    async function fetchEvents() {
      setLoading(true);
      try {
        // Use window.ethereum if available, otherwise fallback to chain-specific RPC
        const provider = typeof window !== "undefined" && (window as any).ethereum
          ? new ethers.BrowserProvider((window as any).ethereum)
          : new ethers.JsonRpcProvider(chain.rpcUrl);

        const contract = new ethers.Contract(
          // If you have per-chain contracts, use a mapping here!
          "0x031f2b19ec717371d3765a091ca4e7bde2fff1f3",
          BITNET_ABI_BLOCKDAG,
          provider
        );

        // Fetch all event types
        const [donateEvents, requestEvents, unlockEvents, burnEvents] = await Promise.all([
          contract.queryFilter(contract.filters.DataDonated(), 0, "latest"),
          contract.queryFilter(contract.filters.DataRequested(), 0, "latest"),
          contract.queryFilter(contract.filters.TokensUnlocked(), 0, "latest"),
          contract.queryFilter(contract.filters.TokensBurned(), 0, "latest"),
        ]);

        function formatEvent(type: BitnetEvent["type"], e: any): BitnetEvent {
          let amount = "";

          if (type === "donate") {
            // If totalAmount is tokens (in Wei), convert to MB
            const tokens = Number(e.args?.totalAmount || 0) / 1e18;
            const mb = Math.floor(tokens / 10);
            amount = `${mb} MB`;
          } else if (type === "request") {
            // tokenAmount is tokens (in Wei), convert to MB
            const tokens = Number(e.args?.tokenAmount || 0) / 1e18;
            const mb = Math.floor(tokens / 10);
            amount = `${mb} MB`;
          } 
          else if (type === "unlock" || type === "burn") {
  const raw = e.args?.amount?.toString() || "";
  amount = raw
    ? `${formatUnits(raw, 18).replace(/\.0$/, "")} BITNET`
    : "-";
}



          return {
            type,
            wallet: e.args?.donor?.toString() || e.args?.wallet?.toString() || "",
            requester: e.args?.requester?.toString() || "",
            amount,
            description: e.args?.description?.toString() || type,
            tx: e.transactionHash || "",
            timestamp: e.blockNumber || "",
          };
        }

        let allEvents: BitnetEvent[] = [
          ...donateEvents.map((e: any) => formatEvent("donate", e)),
          ...requestEvents.map((e: any) => formatEvent("request", e)),
          ...unlockEvents.map((e: any) => formatEvent("unlock", e)),
          ...burnEvents.map((e: any) => formatEvent("burn", e)),
        ].filter(Boolean);

        // Sort by block number DESC
        allEvents = allEvents.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

        // Fetch all unique block numbers
        const blockNumbers = Array.from(new Set(allEvents.map(ev => Number(ev.timestamp))));
        const blockTimestamps: Record<number, string> = {};

        // Fetch block timestamps in parallel
        await Promise.all(
          blockNumbers.map(async (bn) => {
            const block = await provider.getBlock(bn);
            if (block) blockTimestamps[bn] = new Date(Number(block.timestamp) * 1000).toISOString();
          })
        );

        // Replace block number with ISO date string
        const withDates = allEvents.map(ev => ({
          ...ev,
          timestamp: blockTimestamps[Number(ev.timestamp)] || ev.timestamp
        }));

        if (isMounted) setEvents(withDates);
      } catch (e) {
        console.error("Failed to fetch Bitnet history:", e);
        if (isMounted) setEvents([]);
      }
      if (isMounted) setLoading(false);
    }
    fetchEvents();
    return () => { isMounted = false; };
  }, [chainId, chain]); // refetch on chain change!

  return { events, loading };
}
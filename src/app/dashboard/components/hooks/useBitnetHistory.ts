import { useEffect, useState } from "react";
import { ethers, formatUnits } from "ethers";
import { useChainId } from "wagmi";
import { CHAIN_INFO } from "@/utils/chaininfo";

export type BitnetEvent = {
  type: "donate" | "request" | "unlock" | "burn";
  wallet: string;
  requester?: string;
  amount: string;
  description: string;
  tx: string;
  timestamp: number | string;
};

export function useBitnetHistory() {
  const [events, setEvents] = useState<BitnetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chainId = useChainId();
  const chain = CHAIN_INFO[chainId];

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Debug: What chain are we on?
    console.log("BitnetHistory: Using chainId", chainId, chain);

    if (!chain) {
      setError("Chain not found");
      setLoading(false);
      setEvents([]);
      return;
    }
    if (!chain.contractAddress) {
      setError("Contract address not found for chain: " + chainId);
      setLoading(false);
      setEvents([]);
      return;
    }
    if (!chain.abi) {
      setError("ABI not found for chain: " + chainId);
      setLoading(false);
      setEvents([]);
      return;
    }

    let isMounted = true;
    async function fetchEvents() {
      try {
        // Debug: Log contract address, ABI, provider
        console.log("Contract address:", chain.contractAddress);
        console.log("ABI sample:", typeof chain.abi === "object" ? chain.abi[0] : chain.abi);
        console.log("Provider URL:", chain.rpcUrl);

        const provider = typeof window !== "undefined" && (window as any).ethereum
          ? new ethers.BrowserProvider((window as any).ethereum)
          : new ethers.JsonRpcProvider(chain.rpcUrl);

        const contract = new ethers.Contract(
          chain.contractAddress as string,
          chain.abi,
          provider
        );

        let donateEvents = [], requestEvents = [], unlockEvents = [], burnEvents = [];
        try {
          [donateEvents, requestEvents, unlockEvents, burnEvents] = await Promise.all([
            contract.queryFilter(contract.filters.DataDonated(), 0, "latest"),
            contract.queryFilter(contract.filters.DataRequested(), 0, "latest"),
            contract.queryFilter(contract.filters.TokensUnlocked(), 0, "latest"),
            contract.queryFilter(contract.filters.TokensBurned(), 0, "latest"),
          ]);
        } catch (eventError) {
          setError("Failed to fetch one or more event types (possibly bad ABI or contract).");
          console.error("Event filter error:", eventError);
          setEvents([]);
          setLoading(false);
          return;
        }

        // Debug output!
        console.log("donateEvents", donateEvents);
        console.log("requestEvents", requestEvents);
        console.log("unlockEvents", unlockEvents);
        console.log("burnEvents", burnEvents);

        function formatEvent(type: BitnetEvent["type"], e: any): BitnetEvent {
          let amount = "";
          if (type === "donate") {
            const tokens = Number(e.args?.totalAmount || 0) / 1e18;
            const mb = Math.floor(tokens / 10);
            amount = `${mb} MB`;
          } else if (type === "request") {
            const tokens = Number(e.args?.tokenAmount || 0) / 1e18;
            const mb = Math.floor(tokens / 10);
            amount = `${mb} MB`;
          } else if (type === "unlock" || type === "burn") {
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

        console.log("Formatted events:", allEvents);

        allEvents = allEvents.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

        const blockNumbers = Array.from(new Set(allEvents.map(ev => Number(ev.timestamp))));
        const blockTimestamps: Record<number, string> = {};

        await Promise.all(
          blockNumbers.map(async (bn) => {
            const block = await provider.getBlock(bn);
            if (block) blockTimestamps[bn] = new Date(Number(block.timestamp) * 1000).toISOString();
          })
        );

        const withDates = allEvents.map(ev => ({
          ...ev,
          timestamp: blockTimestamps[Number(ev.timestamp)] || ev.timestamp
        }));

        if (isMounted) {
          setEvents(withDates);
          setLoading(false);
        }
      } catch (e: any) {
        console.error("Bitnet fetch error:", e);
        if (isMounted) {
          setError(e?.message || "Unknown error");
          setEvents([]);
          setLoading(false);
        }
      }
    }
    fetchEvents();
    return () => { isMounted = false; };
  }, [chainId, chain]);

  return { events, loading, error };
}
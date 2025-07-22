import React from "react";
import HistoryRow from "./HistoryRow";
import type { HistoryEvent } from "./types";
import { useChainId } from "wagmi";
import { CHAIN_INFO } from "@/utils/chaininfo";

export default function HistoryTable({ events }: { events: HistoryEvent[] }) {
  const chainId = useChainId();
  const chain = CHAIN_INFO[chainId];

  // This will always be correct for the current network!
  const explorerLink = (tx: string) => chain ? `${chain.explorer}/tx/${tx}` : "#";

  if (!events.length)
    return (
      <div className="text-center py-12 text-lg text-white/70 flex flex-col items-center">
        <span className="text-5xl mb-4"></span>
        No history found for this filter
      </div>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-white text-sm border-collapse">
        <thead>
          <tr className="bg-black/30">
            <th className="py-2 px-3">Type</th>
            <th className="py-2 px-3">Description</th>
            <th className="py-2 px-3">Amount</th>
            <th className="py-2 px-3">Wallet / TX</th>
            <th className="py-2 px-3">Date</th>
            <th className="py-2 px-3">Status</th>
            <th className="py-2 px-3"></th> {/* "View" link */}
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <HistoryRow
              event={event}
              key={event.id}
              explorerLink={explorerLink}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
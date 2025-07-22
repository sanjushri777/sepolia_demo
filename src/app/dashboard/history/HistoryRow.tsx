import React from "react";
import type { HistoryEvent } from "./types";

type Props = {
  event: HistoryEvent;
  explorerLink: (tx: string) => string;
};

export default function HistoryRow({ event, explorerLink }: Props) {
  return (
    <tr>
      <td>{event.icon}</td>
      <td>{event.description}</td>
      <td>{event.amount}</td>
      <td>
        {event.wallet !== "-" ? `${event.wallet.slice(0, 6)}...${event.wallet.slice(-4)}` : "-"}
        <br />
        <span className="text-xs text-gray-400">
          {event.tx !== "-" ? `${event.tx.slice(0, 6)}...${event.tx.slice(-4)}` : "-"}
        </span>
      </td>
      <td>
        {event.date !== "-" ? new Date(event.date).toLocaleString() : "-"}
      </td>
      <td>
        {event.status}
      </td>
      <td>
        <a href={explorerLink(event.tx)} target="_blank" rel="noopener noreferrer">
          View
        </a>
      </td>
    </tr>
  );
}

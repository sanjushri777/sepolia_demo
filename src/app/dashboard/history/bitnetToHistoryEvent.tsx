import { FaLock, FaFire, FaRocket, FaGift } from "react-icons/fa";
import type { BitnetEvent } from "../components/hooks/useBitnetHistory";
import type { HistoryEvent } from "./types";

export function bitnetToHistoryEvent(event: BitnetEvent, idx: number): HistoryEvent {
  let icon = null;
  let status: "success" | "burned" | "pending" = "success";
  let statusTooltip = "";

  switch (event.type) {
    case "donate":
      icon = <FaGift className="text-[#ff3c18]" />;
      status = "success";
      statusTooltip = "User donated bandwidth";
      break;
    case "request":
      icon = <FaRocket className="text-[#00ffc8]" />;
      status = "pending";
      statusTooltip = "User requested bandwidth";
      break;
    case "unlock":
      icon = <FaLock className="text-yellow-400" />;
      status = "success";
      statusTooltip = "Tokens unlocked";
      break;
    case "burn":
      icon = <FaFire className="text-red-500" />;
      status = "burned";
      statusTooltip = "Tokens burned";
      break;
    default:
      icon = null;
      status = "pending";
      statusTooltip = "";
  }

  return {
    id: idx, // or change to `${event.tx}_${idx}` and update type
    icon,
    date:
      typeof event.timestamp === "number"
        ? new Date(event.timestamp * 1000).toISOString()
        : event.timestamp || "-",
    status,
    statusTooltip,
    type: event.type || "-",
    description: event.description || event.type || "-",
    amount: event.amount || "-",
    wallet: event.wallet || "-",
    tx: event.tx || "-",
  };
}

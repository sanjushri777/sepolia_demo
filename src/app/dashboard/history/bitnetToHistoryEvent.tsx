import { FaLock, FaFire, FaRocket, FaGift } from "react-icons/fa";
import type { BitnetEvent } from "../components/hooks/useBitnetHistory";
import type { HistoryEvent } from "./types";

export function bitnetToHistoryEvent(event: BitnetEvent, idx: number): HistoryEvent {
  let icon = null, status = "success", statusTooltip = "";
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
    id: `${event.tx}_${idx}`,
    icon,
    date: event.timestamp || "-", // <-- this should be an ISO string now!
    status,
    statusTooltip,
    type: event.type || "-",
    description: event.description || event.type || "-",
    amount: event.amount || "-",
    wallet: event.wallet || "-",
    tx: event.tx || "-",
  };
}
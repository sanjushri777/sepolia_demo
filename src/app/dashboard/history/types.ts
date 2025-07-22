export type HistoryEvent = {
  id: number;
  type: "donate" | "request" | "burn" | "unlock";
  icon: string;
  description: string;
  amount: string;
  wallet: string;
  tx: string;
  date: string; // ISO string
  status: "success" | "burned" | "pending";
  statusTooltip: string;
};
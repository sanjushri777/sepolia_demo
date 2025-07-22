import { ReactNode } from "react";

export type HistoryEvent = {
  id: string;
  icon: ReactNode;
  date: string; // ISO string or Date-compatible string
  status: "success" | "burned" | "pending";
  statusTooltip: string;
  type: string;
  description: string;
  amount: string;
  wallet: string;
  tx: string;
};
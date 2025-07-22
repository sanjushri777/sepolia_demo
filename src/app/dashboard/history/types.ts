import { ReactNode } from "react";

export type HistoryEvent = {
  id: number;
  icon: ReactNode;
  date: string; // ISO string
  status: "success" | "burned" | "pending";
  statusTooltip: string;
  type: string;
  description: string;
  amount: string;
  wallet: string;
  tx: string;
};
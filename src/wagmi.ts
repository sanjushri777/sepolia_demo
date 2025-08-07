"use client";

import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { createStorage, cookieStorage } from "wagmi";
import { blockdagPrimordial, sepolia } from "./chains"; 

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) throw new Error("WalletConnect projectId missing");

export const config = defaultWagmiConfig({
  chains: [blockdagPrimordial, sepolia], // Support both!
  projectId,
  metadata: {
    name: "BITNET DApp",
    description: "Donate/request bandwidth on multiple chains",
    url: "https://yourapp.com",
    icons: ["https://yourapp.com/logo.png"],
  },
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
});
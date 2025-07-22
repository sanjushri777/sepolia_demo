"use client";

import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { createStorage, cookieStorage } from "wagmi";
import { blockdagPrimordial } from "./chains"; 

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) throw new Error("WalletConnect projectId missing");

export const config = defaultWagmiConfig({
  chains: [blockdagPrimordial],
  projectId,
  metadata: {
    name: "BlockDAG DApp",
    description: "Your DApp on BlockDAG",
    url: "https://yourapp.com",
    icons: ["https://yourapp.com/logo.png"],
  },
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
});

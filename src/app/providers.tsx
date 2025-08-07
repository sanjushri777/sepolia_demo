'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { blockdagPrimordial, sepolia } from '../chains'; // STEP 1

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';

const metadata = {
  name: 'BlockDAG & Sepolia Starter Kit', // Optional: update name
  description: 'BlockDAG Starter Kit Web3 App',
  url: 'https://blockdag.network', 
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [blockdagPrimordial, sepolia] as const; // STEP 2

const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

createWeb3Modal({ wagmiConfig: config, projectId });

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
import { Chain } from 'wagmi/chains';

export const blockdagPrimordial: Chain = {
  id: 1043,
  name: 'BlockDAG Primordial',
  nativeCurrency: {
    name: 'BDAG',
    symbol: 'BDAG',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://test-rpc.primordial.bdagscan.com/'] },
    public: { http: ['https://test-rpc.primordial.bdagscan.com/'] },
  },
  blockExplorers: {
    default: { name: 'BlockDAG Explorer', url: 'https://explorer.blockdag.network' },
  },
  testnet: false,
};

export const sepolia: Chain = {
  id: 11155111,
  name: 'Sepolia',
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://sepolia.infura.io/v3/879cd25412484c7f92d9e2754f5770fa'] },
    public: { http: ['https://sepolia.infura.io/v3/879cd25412484c7f92d9e2754f5770fa'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
  },
  testnet: true,
};
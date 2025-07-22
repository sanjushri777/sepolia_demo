import { Chain } from 'wagmi/chains';

export const blockdagPrimordial: Chain = {
  id: 1043, // replace with the correct Chain ID for BlockDAG Primordial
  name: 'BlockDAG Primordial',
  //network: 'blockdag',
  nativeCurrency: {
    name: 'BDAG',
    symbol: 'BDAG',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://test-rpc.primordial.bdagscan.com/'],
    },
    public: {
      http: ['https://test-rpc.primordial.bdagscan.com/'],
    },
  },
  blockExplorers: {
    default: { name: 'BlockDAG Explorer', url: 'https://explorer.blockdag.network' },
  },
  testnet: false,
};

import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from '@web3modal/wagmi/react';

export default function ConnectButton({ showDisconnect = false }: { showDisconnect?: boolean }) {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();

  if (!isConnected)
    return (
      <button
        onClick={() => open()}
        className="px-7 py-3 rounded-full bg-gradient-to-r from-[#ff3c18] to-[#ff5a2c] text-black font-bold text-lg shadow-lg hover:from-[#ff5a2c] hover:to-[#ff3c18] focus:from-[#ff5a2c] focus:to-[#ff3c18] transition-all uppercase"
      >
        Connect Wallet
      </button>
    );

  // Show label, address, and disconnect if requested
  if (showDisconnect)
    return (
      <div className="flex items-center gap-3">
        <span className="text-[#bfc9d1] font-semibold text-base select-none">
          Connected Address:
        </span>
        <span className="px-5 py-2 rounded-full bg-gradient-to-r from-[#ff3c18] to-[#ff5a2c] text-black font-bold text-base select-none">
          {address ? address.slice(0, 6) + "..." + address.slice(-4) : ""}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 rounded-full bg-[#1a1a1a] text-[#ff3c18] font-bold text-base border border-[#ff3c18] hover:bg-[#ff3c18] hover:text-black transition-all"
        >
          Disconnect
        </button>
      </div>
    );

  // If you *don't* want disconnect on landing, just show address
  return (
    <span className="px-5 py-2 rounded-full bg-gradient-to-r from-[#ff3c18] to-[#ff5a2c] text-black font-bold text-base select-none">
      {address ? address.slice(0, 6) + "..." + address.slice(-4) : ""}
    </span>
  );
}
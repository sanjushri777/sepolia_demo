"use client";
import ConnectButton from "@/components/ConnectButton";
import { useEffect, useState } from "react";

export default function TopBar() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-[#232323] bg-black/80 sticky top-0 z-20">
      <div className="pl-20 flex-1 flex items-center">
        {/* Left: App Name */}
        <span className="text-2xl font-bold tracking-wider text-white select-none">
          BITNET
        </span>
      </div>
      {/* Right: Connect Button */}
      {isMounted && <ConnectButton showDisconnect={true} />}
    </header>
  );
}
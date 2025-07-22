"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import ConnectButton from "@/components/ConnectButton";

export default function Home() {
  const [showHero, setShowHero] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();
  const router = useRouter();

  // Redirect to dashboard if connected
  useEffect(() => {
    if (isConnected && mounted) {
      router.push("/dashboard");
    }
  }, [isConnected, mounted, router]);

  // Show hero animation on mount
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setShowHero(true), 80);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null; // Prevent hydration error

  // Glassmorphism card base styles
  const glassCard =
    "glass-card flex-1 flex flex-col items-center p-6 rounded-xl border border-[#232323] shadow-lg text-center transition-all bg-black/60 backdrop-blur-md hover:border-[#ff3c18] hover:-translate-y-1 hover:shadow-[0_0_32px_0_#ff3c18]";

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-black font-['Montserrat',_sans-serif] overflow-x-hidden">
      <section
        className={`relative z-10 flex flex-col items-center justify-center w-full pt-24 pb-12 px-4 transition-all duration-700
        ${showHero ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
        `}
      >
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight text-center mb-6 leading-tight">
          <span>BITNET</span>
          <br />
          <span className="bg-gradient-to-r from-[#ff3c18] via-white to-[#ff3c18] bg-clip-text text-transparent">
            Donate Data, Then Request
          </span>
        </h1>
        <p className="max-w-2xl text-center text-lg md:text-2xl text-[#bfc9d1] mb-8 font-medium">
          Connect your wallet and donate your excess data bandwidth.  
          <br />
          Only after donating can you request data from the BITNET community.
        </p>
        <div className="mb-12 flex flex-col items-center gap-4">
          <ConnectButton />
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#ff3c18] animate-ping"></span>
            <span className="text-sm text-[#bfc9d1]">
              Step 1: Connect wallet
            </span>
          </div>
        </div>

        {/* Process Steps */}
        <div className="mt-20 w-full max-w-5xl">
          <h2 className="text-3xl font-bold text-white text-center mb-10">
            How BITNET Works
          </h2>
          <div className="flex flex-col md:flex-row justify-center gap-8">
            {/* Card 1: Connect */}
            <div className={glassCard}>
              <div className="w-12 h-12 mb-3 border-2 border-[#ff3c18] rounded-full flex items-center justify-center text-2xl text-[#ff3c18] bg-black/40">
                🔗
              </div>
              <h4 className="font-semibold text-lg text-white mb-1 uppercase tracking-widest">Connect</h4>
              <p className="text-[#bfc9d1] text-base">
                Securely link your wallet to access BITNET.
              </p>
            </div>
            {/* Card 2: Donate Data */}
            <div className={glassCard}>
              <div className="w-12 h-12 mb-3 border-2 border-[#ff3c18] rounded-full flex items-center justify-center text-2xl text-[#ff3c18] bg-black/40">
                📤
              </div>
              <h4 className="font-semibold text-lg text-white mb-1 uppercase tracking-widest">Donate Data</h4>
              <p className="text-[#bfc9d1] text-base">
                Share your excess bandwidth and unlock the ability to request.
              </p>
            </div>
            {/* Card 3: Request Data */}
            <div className={glassCard}>
              <div className="w-12 h-12 mb-3 border-2 border-[#ff3c18] rounded-full flex items-center justify-center text-2xl text-[#ff3c18] bg-black/40">
                📡
              </div>
              <h4 className="font-semibold text-lg text-white mb-1 uppercase tracking-widest">Request Data</h4>
              <p className="text-[#bfc9d1] text-base">
                Access the network’s bandwidth after contributing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
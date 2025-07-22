"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { isConnected } = useAccount();
  const router = useRouter();

  // Redirect if disconnected
  useEffect(() => {
    if (!isConnected) {
      router.replace("/");
    }
  }, [isConnected, router]);

  return (
    <>
      {/* Hamburger Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-6 left-6 z-50 bg-black/60 text-white rounded-full p-2 shadow-lg backdrop-blur-md hover:bg-[#ff3c18] transition"
        aria-label="Toggle sidebar"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <rect y="5" width="24" height="2" rx="1" fill="currentColor" />
          <rect y="11" width="24" height="2" rx="1" fill="currentColor" />
          <rect y="17" width="24" height="2" rx="1" fill="currentColor" />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 w-full md:w-64 h-80 md:h-screen z-40
          transition-transform transition-opacity duration-500 ease-in-out
          ${open ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}
          bg-black/40 border-b-4 md:border-b-0 md:border-r-4 border-[#838996]
          backdrop-blur-2xl shadow-2xl
          flex flex-col items-center pt-16 md:pt-24 px-8
        `}
        style={{
          boxShadow: "0 8px 32px 0 #838996",
          borderRadius: "0 0 32px 32px",
        }}
      >
        <span className="text-3xl font-mon text-white tracking-widest mb-8 select-none">
          BITNET
        </span>

        {/* Nav links */}
        <nav className="w-full flex flex-col gap-3">
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white font-mon hover:bg-[#ff3c18] transition-all"
          >
            Dashboard
          </a>
          <a
            href="/dashboard/history"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white font-mon hover:bg-[#ff3c18] transition-all"
          >
            History
          </a>
          {/*<a
            href="/dashboard/leaderboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white font-mon hover:bg-[#ff3c18] transition-all"
          >
           Leaderboard
          </a>*/}
          <a
            href="/dashboard/stats"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white font-mon hover:bg-[#ff3c18] transition-all"
          >
            Network Stats
          </a>
        </nav>
      </div>
    </>
  );
}

"use client";
import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import HistoryTable from "./HistoryTable";
import { useBitnetHistory } from "../components/hooks/useBitnetHistory";
import { bitnetToHistoryEvent } from "./bitnetToHistoryEvent"; // Adjust path if needed

const FILTER_TYPES = [
  { label: "All", value: "all" },
  { label: "Donations", value: "donate" },
  { label: "Requests", value: "request" },
  { label: "Unlocks", value: "unlock" },
  { label: "Burns", value: "burn" },
];

const PAGE_SIZE = 6;

export default function HistoryPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [historyMode, setHistoryMode] = useState<"all" | "my">("all");
  
  const { address} = useAccount();
  console.log("Connected address:", address);
 

  const { events, loading: eventsLoading } = useBitnetHistory();

  // 1. Map BitnetEvent → HistoryEvent
  const mappedEvents = useMemo(
    () => events.map((ev, idx) => bitnetToHistoryEvent(ev, idx)),
    [events]
  );

  // 2. Filtering, search, history mode (works on mappedEvents)
  const filteredEvents = useMemo(() => {
    let result = mappedEvents;

    if (historyMode === "my" && address) {
      result = result.filter(
        
        (ev) =>
          ev.wallet?.toLowerCase() === address.toLowerCase() ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (ev as any).requester?.toLowerCase?.() === address.toLowerCase()
          
      );
    }
    if (filter !== "all") result = result.filter((ev) => ev.type === filter);

    if (search)
      result = result.filter(
        (ev) =>
          ev.type.toLowerCase().includes(search.toLowerCase()) ||
          ev.description.toLowerCase().includes(search.toLowerCase()) ||
          ev.wallet.toLowerCase().includes(search.toLowerCase()) ||
          ev.tx.toLowerCase().includes(search.toLowerCase()) ||
          (ev.amount + "").toLowerCase().includes(search.toLowerCase())
      );
    return result;
  }, [mappedEvents, filter, search, address, historyMode]);

  // 3. Pagination
  const pagedEvents = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredEvents.slice(start, start + PAGE_SIZE);
  }, [filteredEvents, page]);

  // Simulate loading on filter/search change
  function handleFilterChange(val: string) {
    setLoading(true);
    setTimeout(() => {
      setFilter(val);
      setPage(1);
      setLoading(false);
    }, 400);
  }
  function handleSearchChange(val: string) {
    setLoading(true);
    setTimeout(() => {
      setSearch(val);
      setPage(1);
      setLoading(false);
    }, 400);
  }

  function handleHistoryModeChange(mode: "all" | "my") {
    setHistoryMode(mode);
    setPage(1);
  }

  return (
    <>
      <Sidebar />
      <main className="min-h-screen flex flex-col bg-black font-['Montserrat',_sans-serif] overflow-x-hidden">
        <TopBar />
        <section className="flex-1 w-full max-w-5xl flex flex-col items-center mx-auto pt-12">
          <h1 className="text-4xl font-bold text-white mb-10">History</h1>
          {/* History Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition
                ${historyMode === "all"
                  ? "bg-[#ff3c18] text-white border-[#ff3c18]"
                  : "bg-transparent text-white border-gray-600"}`}
              onClick={() => handleHistoryModeChange("all")}
            >
              Network History
          </button>
            <button
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition
                ${historyMode === "my"
                  ? "bg-[#ff3c18] text-white border-[#ff3c18]"
                  : "bg-transparent text-white border-gray-600"}`}
              onClick={() => handleHistoryModeChange("my")}
            >
              My Wallet History
            </button>


             




          </div>
          {/* Search & Filter */}
          <div className="w-full max-w-3xl flex flex-col md:flex-row gap-4 mb-8 items-center">
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="rounded px-4 py-2 bg-black/70 text-white border border-[#ff3c18] shadow focus:ring-2 focus:ring-[#ff3c18] outline-none"
            >
              {FILTER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by wallet, amount, type..."
              className="flex-1 rounded px-4 py-2 bg-black/70 text-white border border-[#ff3c18] shadow focus:ring-2 focus:ring-[#ff3c18] outline-none"
            />
          </div>
          {/* Table or Loading */}
          <div
            className="w-full max-w-4xl bg-black/40 backdrop-blur-lg border border-[#ff3c18]/10 rounded-2xl shadow-lg px-8 py-6 mb-8"
            style={{ boxShadow: "0 8px 40px 0 #ffffffaa" }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 tracking-wide flex items-center gap-2">
              <span className="text-[#ff3c18]">●</span>
              Activity History {historyMode === "my" && "(My Wallet)"}
            </h2>
            {loading || eventsLoading ? (
              <div className="animate-pulse text-center text-[#ff3c18] py-12">Loading...</div>
            ) : (
              <HistoryTable events={pagedEvents} />
            )}
            {/* Pagination */}
            {!loading && filteredEvents.length > PAGE_SIZE && (
              <div className="flex justify-center mt-4 gap-2">
                <button
                  className="px-3 py-1 rounded bg-[#222] text-[#ff3c18] font-bold disabled:opacity-30"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  Prev
                </button>
                <span className="px-3 py-1 text-white">
                  Page {page} of {Math.ceil(filteredEvents.length / PAGE_SIZE)}
                </span>
                <button
                  className="px-3 py-1 rounded bg-[#222] text-[#ff3c18] font-bold disabled:opacity-30"
                  disabled={page >= Math.ceil(filteredEvents.length / PAGE_SIZE)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
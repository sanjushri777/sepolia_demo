"use client";
import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { FaLock, FaFire, FaChartLine, FaRocket } from "react-icons/fa";
import { MdDataUsage } from "react-icons/md";
import { useChainId } from "wagmi";
import { EventLog } from "ethers";
import { ethers } from "ethers";
import { getBitnetContract } from "@/utils/bitnetContract";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";

// ---- TooltipCard ----
function TooltipCard({ children, tooltip }: { children: React.ReactNode; tooltip: string }) {
  return (
    <div className="relative group">
      {children}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 mt-2 z-50 opacity-0 group-hover:opacity-100 transition bg-[#232324] text-white text-xs px-3 py-1 rounded shadow-lg border border-[#ff3c18] w-max max-w-xs whitespace-pre-line">
        {tooltip}
      </div>
    </div>
  );
}

// ---- StatCard ----
const CARD_OUTER =
  "flex flex-col items-center justify-center rounded-2xl border-2 border-[#838996] shadow-lg p-1 min-w-[140px] h-full flex-1 md:max-w-[220px] transition-all hover:-translate-y-1 hover:shadow-[0_0_32px_0_#838996,0_0_16px_0_#fff3] group bg-[#1f2124]";

const CARD_INNER =
  "w-full flex flex-col items-center py-7 px-5 rounded-xl bg-[#080808] shadow-inner min-h-[185px]";

function useCountUp(target: number, duration = 900) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / Math.max(15, Math.floor(duration / 30));
    const interval = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.round(start));
      }
    }, 16);
    return () => clearInterval(interval);
  }, [target, duration]);
  return count;
}

function StatCard({
  icon,
  label,
  value,
  glowColor = "#ff3c18",
  tooltip,
  animate = false,
  unit = "MB",
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  glowColor?: string;
  tooltip?: string;
  animate?: boolean;
  unit?: string;
}) {
  const countUp = useCountUp(typeof value === "number" ? Number(value) : 0);

  let displayValue = value;
  if (typeof value === "number") {
    displayValue =
      value % 1 === 0
        ? value.toLocaleString()
        : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  let display;
  if (typeof value === "string") {
    display = (
      <span className="flex items-baseline justify-center min-h-[46px]">
        <span
          className="text-3xl md:text-4xl font-extrabold text-white truncate max-w-full overflow-hidden"
          style={{ textShadow: `0 0 12px ${glowColor}99`, letterSpacing: "1px" }}
        >
          {value}
        </span>
      </span>
    );
  } else if (label === "Active Locks") {
    display = (
      <span className="flex items-baseline justify-center min-h-[46px]">
        <span
          className="text-3xl md:text-4xl font-extrabold text-white truncate max-w-full overflow-hidden"
          style={{ textShadow: `0 0 12px ${glowColor}99`, letterSpacing: "1px" }}
        >
          {animate ? countUp : displayValue}
        </span>
        <span className="ml-1 text-base text-gray-400 font-semibold">Locks</span>
      </span>
    );
  } else {
    display = (
      <span className="flex items-baseline justify-center min-h-[46px]">
        <span
          className="text-3xl md:text-4xl font-extrabold text-white truncate max-w-full overflow-hidden"
          style={{ textShadow: `0 0 12px ${glowColor}99`, letterSpacing: "1px" }}
        >
          {animate ? countUp : displayValue}
        </span>
        <span className="ml-1 text-base text-gray-400 font-semibold">{unit}</span>
      </span>
    );
  }

  return (
    <TooltipCard tooltip={tooltip || ""}>
      <div className={CARD_OUTER}>
        <div className={CARD_INNER}>
          <div
            className="w-12 h-12 flex items-center justify-center rounded-full mb-4 text-2xl"
            style={{ boxShadow: `0 0 18px 0 ${glowColor}66`, color: glowColor, background: "#000000ff" }}
          >
            {icon}
          </div>
          <div className="uppercase text-xs text-[#ff3c18] font-semibold mb-2 tracking-wider">
            {label}
          </div>
          <div className="flex flex-col items-center justify-center w-full">{display}</div>
        </div>
      </div>
    </TooltipCard>
  );
}

// ---- Card Tooltips ----
const CARD_TOOLTIPS: Record<string, string> = {
  "Total Donated": "Total bandwidth (in MB) donated by all users in the system. If a user donated 50 MB, this card increases by 50.",
  "Total Requested": "Total bandwidth (in MB) requested by all users in the system. If a user requested 50 MB, this card increases by 50.",
  "Active Locks": "Number of currently active donation locks system-wide.",
  "Burned Tokens": "Total BITNET tokens actually burned by users, permanently removed from supply.",
};

// ---- Chart toggle ----
function ChartModeToggle({
  mode,
  setMode,
}: {
  mode: "daily" | "cumulative";
  setMode: (mode: "daily" | "cumulative") => void;
}) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition
          ${mode === "daily"
            ? "bg-[#ff3c18] text-white border-[#ff3c18]"
            : "bg-transparent text-white border-gray-600"}`}
        onClick={() => setMode("daily")}
      >
        Daily
      </button>
      <button
        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition
          ${mode === "cumulative"
            ? "bg-[#ff3c18] text-white border-[#ff3c18]"
            : "bg-transparent text-white border-gray-600"}`}
        onClick={() => setMode("cumulative")}
      >
        Cumulative
      </button>
    </div>
  );
}

// ---- Chart Data Aggregation ----
type ChartDataItem = { name: string; Donated: number; Requested: number };

// Helper: find block number by timestamp for time range queries
async function getBlockNumberByTimestamp(provider: ethers.BrowserProvider, targetTimestamp: number): Promise<number> {
  const latestBlock = await provider.getBlock("latest");

  if (!latestBlock) {
    throw new Error("Failed to fetch latest block");
  }

  let low = 1;
  let high = latestBlock.number;
  let closest = low;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const block = await provider.getBlock(mid);
    if (!block) break;
    if (block.timestamp < targetTimestamp) {
      low = mid + 1;
    } else {
      closest = mid;
      high = mid - 1;
    }
  }

  return closest;
}


async function fetchUsageChartData(chainId: number, chartRange: "7" | "30" | "all"): Promise<ChartDataItem[]> {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = getBitnetContract(provider, chainId);

  let days = 7;
  if (chartRange === "30") days = 30;
  if (chartRange === "all") days = 90;

  function getStartOfDaysAgo(days: number) {
    const nowDate = new Date();
    nowDate.setHours(0, 0, 0, 0);
    return Math.floor(nowDate.getTime() / 1000) - days * 86400;
  }
  function formatDate(ts: number) {
    const d = new Date(ts * 1000);
    return d.toISOString().slice(0, 10);
  }
  // Use TOKENS_PER_MB to convert tokens to MB
  const TOKENS_PER_MB = 10;

  let fromBlock = 0;
  if (chartRange !== "all") {
    const startTimestamp = getStartOfDaysAgo(days);
    fromBlock = await getBlockNumberByTimestamp(provider, startTimestamp);
  }

  // Fetch events (by block for 7/30 days, all blocks for 'all')
  const donatedEvents = (await contract.queryFilter(
    contract.filters.DataDonated(),
    fromBlock
  )).filter((log): log is EventLog => "args" in log);

  const requestedEvents = (await contract.queryFilter(
    contract.filters.DataRequested(),
    fromBlock
  )).filter((log): log is EventLog => "args" in log);

  // Get block timestamps for all events
  async function getBlockTimestamp(blockNumber: number): Promise<number> {
    const block = await provider.getBlock(blockNumber);
    return block?.timestamp ?? blockNumber;
  }

  // Aggregate daily values
  const dailyAgg: Record<string, { Donated: number; Requested: number }> = {};

  for (const event of donatedEvents) {
    const ts = await getBlockTimestamp(event.blockNumber);
    const day = formatDate(ts);
    // Convert tokens to MB
    const donatedMb = Number(event.args.totalAmount) / 1e18 / TOKENS_PER_MB;
    if (!dailyAgg[day]) dailyAgg[day] = { Donated: 0, Requested: 0 };
    dailyAgg[day].Donated += donatedMb;
  }

  for (const event of requestedEvents) {
    const ts = await getBlockTimestamp(event.blockNumber);
    const day = formatDate(ts);
    // Convert tokens to MB
    const requestedMb = Number(event.args.tokenAmount) / 1e18 / TOKENS_PER_MB;
    if (!dailyAgg[day]) dailyAgg[day] = { Donated: 0, Requested: 0 };
    dailyAgg[day].Requested += requestedMb;
  }

  // Build array of days, fill missing days with 0
  const daysArr: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    daysArr.push(d);
  }
  return daysArr.map(day => ({
    name: day,
    Donated: dailyAgg[day]?.Donated ?? 0,
    Requested: dailyAgg[day]?.Requested ?? 0,
  }));
}

// ---- Burned BITNET Calculation ----
async function fetchBurnedBitnet(chainId: number) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = getBitnetContract(provider, chainId);

  // Use the correct event name!
  const burnedEvents = (await contract.queryFilter(contract.filters.TokensBurned()))
    .filter((log): log is EventLog => "args" in log);

  let burnedTotalBITNET = 0;
  for (const event of burnedEvents) {
    burnedTotalBITNET += Number(event.args.amount) / 1e18; // BITNET tokens (assuming 18 decimals)
  }

  return parseFloat(burnedTotalBITNET.toFixed(2));
}

// ---- Network Stats Aggregation ----
async function fetchNetworkStats(chainId: number) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = getBitnetContract(provider, chainId);

  // Use TOKENS_PER_MB to convert tokens to MB
  const TOKENS_PER_MB = 10;

  // Sum all DataDonated events for total donations (system-wide, in MB)
  let totalDonatedMB = 0;
  const donatedEvents = (await contract.queryFilter(contract.filters.DataDonated()))
    .filter((log): log is EventLog => "args" in log);

  for (const event of donatedEvents) {
    totalDonatedMB += Number(event.args.totalAmount) / 1e18 / TOKENS_PER_MB;
  }

  // System-wide total requested (sum all DataRequested events, in MB)
  let totalRequestedMB = 0;
  const requestedEvents = (await contract.queryFilter(contract.filters.DataRequested()))
    .filter((log): log is EventLog => "args" in log);

  for (const event of requestedEvents) {
    totalRequestedMB += Number(event.args.tokenAmount) / 1e18 / TOKENS_PER_MB;
  }

  // Active locks
  let activeLocks = 0;
  const allDonors = await contract.getAllDonors();
  const now = Math.floor(Date.now() / 1000);
  for (const donor of allDonors) {
    const lockCount = await contract.getLockCount(donor);
    for (let i = 0; i < lockCount; i++) {
      const [lockedAmount, unlocked, , expiryTimestamp] = await contract.getLockInfo(donor, i);
      const isActive = !unlocked && Number(lockedAmount) > 0 && Number(expiryTimestamp) > now;
      if (isActive) activeLocks++;
    }
  }

  // Burned tokens: BITNET, not MB
  const burnedBitnet = await fetchBurnedBitnet(chainId);

  return {
    totalDonated: parseFloat(totalDonatedMB.toFixed(2)),
    totalRequested: parseFloat(totalRequestedMB.toFixed(2)),
    activeLocks,
    burnedBitnet,
  };
}

// ---- Chart Ranges ----
type ChartRange = "7" | "30" | "all";
const CHART_RANGES = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "All-time", value: "all" },
];

// ---- Main Chart Component ----
function NetworkUsageChart({
  usageData,
  chartMode,
  setChartMode,
}: {
  usageData: ChartDataItem[];
  chartMode: "daily" | "cumulative";
  setChartMode: (mode: "daily" | "cumulative") => void;
}) {
  // Compute cumulative data
  const cumulativeData = useMemo(() => {
    let donated = 0, requested = 0;
    return usageData.map(d => {
      donated += d.Donated;
      requested += d.Requested;
      return {
        name: d.name,
        Donated: donated,
        Requested: requested,
      };
    });
  }, [usageData]);

  const chartData = chartMode === "daily" ? usageData : cumulativeData;

  return (
    <div className="w-full max-w-4xl bg-[#080808] border-2 border-[#838996] rounded-2xl shadow-lg p-7 mb-5 hover:shadow-[0_0_36px_0_#838996,0_0_24px_0_#fff3] transition-all">
      <h3 className="text-white text-lg font-semibold mb-5 flex items-center gap-2" style={{ letterSpacing: "0.5px" }}>
        <FaChartLine className="text-[#ff3c18]" /> Network Usage
      </h3>
      <ChartModeToggle mode={chartMode} setMode={setChartMode} />
      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#1f1f1fff" strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fill: "#fff", fontSize: 13 }} />
          <YAxis tick={{ fill: "#fff", fontSize: 13 }} />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: "#000000ff",
              borderColor: "#ff3c18",
              color: "#fff",
              fontSize: "14px",
            }}
            labelStyle={{ color: "#ff3c18", fontWeight: 600 }}
            formatter={(value: number, name: string) => [`${value.toFixed(2)} MB`, name]}
          />
          <Line
            type="monotone"
            dataKey="Donated"
            stroke="#8b0000ff"
            strokeWidth={3}
            dot={{ r: 4, fill: "#ff3c18", opacity: 0.7 }}
            activeDot={{ r: 7, stroke: "#fff", strokeWidth: 2, opacity: 0.8 }}
            name="Donated"
          />
          <Line
            type="monotone"
            dataKey="Requested"
            stroke="#156a1eff"
            strokeWidth={3}
            dot={{ r: 4, fill: "#00ffc8", opacity: 0.7 }}
            activeDot={{ r: 7, stroke: "#fff", strokeWidth: 2, opacity: 0.8 }}
            name="Requested"
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-7 mt-6 justify-center text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-1.5 rounded bg-[#8b0000ff] inline-block" />
          <span className="text-white font-medium">Donated</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1.5 rounded bg-[#156a1eff] inline-block" />
          <span className="text-white font-medium">Requested</span>
        </div>
      </div>
    </div>
  );
}

// ---- Main Page ----
export default function NetworkStatusPage() {
  const [networkStats, setNetworkStats] = useState<{
    totalDonated: number;
    totalRequested: number;
    activeLocks: number;
    burnedBitnet: number;
  }>({
    totalDonated: 0,
    totalRequested: 0,
    activeLocks: 0,
    burnedBitnet: 0,
  });
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState<ChartRange>("7");
  const [usageData, setUsageData] = useState<ChartDataItem[]>([]);
  const [chartMode, setChartMode] = useState<"daily" | "cumulative">("daily");
  const chainId = useChainId();

  useEffect(() => {
    if (!chainId) return;
    setLoading(true);
    fetchNetworkStats(chainId)
      .then((stats) => {
        setNetworkStats(stats);
        setLastUpdated(new Date().toLocaleString("en-US", { hour12: false }));
      })
      .finally(() => setLoading(false));
  }, [chainId]);

  useEffect(() => {
    if (!chainId) return;
    fetchUsageChartData(chainId, chartRange)
      .then(data => {
        setUsageData(data);
      });
  }, [chainId, chartRange]);

  return (
    <main className="min-h-screen flex flex-col bg-black font-['Inter',_Montserrat,_sans-serif] overflow-x-hidden">
      <Sidebar />
      <div className="pl-20">
        <TopBar />
      </div>
      <section className="flex-1 w-full max-w-6xl flex flex-col items-center justify-center mx-auto pt-12 px-3 md:px-0">
        <h1 className="text-4xl font-bold text-white mb-1" style={{ letterSpacing: "1px" }}>Network Status</h1>
        <div className="text-sm text-gray-400 mb-10">
          Last Updated At: <span className="text-[#ff3c18]">{lastUpdated}</span>
        </div>
        {/* --- Stats Cards Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-7 w-full mb-12">
          <StatCard
            icon={<MdDataUsage />}
            label="Total Donated"
            value={loading ? 0 : networkStats.totalDonated}
            unit="MB"
            glowColor="#ff3c18"
            tooltip={CARD_TOOLTIPS["Total Donated"]}
            animate
          />
          <StatCard
            icon={<FaRocket />}
            label="Total Requested"
            value={loading ? 0 : networkStats.totalRequested}
            unit="MB"
            glowColor="#00ffc8"
            tooltip={CARD_TOOLTIPS["Total Requested"]}
            animate
          />
          <StatCard
            icon={<FaLock />}
            label="Active Locks"
            value={loading ? 0 : networkStats.activeLocks}
            glowColor="#ff3c18"
            tooltip={CARD_TOOLTIPS["Active Locks"]}
            animate
            unit="Locks"
          />
          <StatCard
            icon={<FaFire />}
            label="Burned Tokens"
            value={loading ? 0 : networkStats.burnedBitnet}
            glowColor="#ff3c18"
            unit="BITNET"
            tooltip={CARD_TOOLTIPS["Burned Tokens"]}
            animate
          />
        </div>
        {/* --- Chart Range Toggle --- */}
        <div className="flex items-center gap-2 mb-4">
          {CHART_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setChartRange(r.value as ChartRange)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border 
                ${chartRange === r.value
                  ? "bg-[#ff3c18] text-white border-[#ff3c18]"
                  : "bg-transparent text-white border-gray-600"}
                transition`}
              style={{ letterSpacing: "1px" }}
            >
              {r.label}
            </button>
          ))}
        </div>
        {/* --- Usage Chart --- */}
        <NetworkUsageChart usageData={usageData} chartMode={chartMode} setChartMode={setChartMode} />
      </section>
    </main>
  );
}
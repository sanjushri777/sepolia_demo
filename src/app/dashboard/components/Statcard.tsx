import React from "react";

// --- Animated Counter Hook ---
function useCountUp(target: number, duration = 900) {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const increment = target / Math.max(15, Math.floor(duration / 30));
    const interval = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.round(start * 100) / 100); // 2 decimals for animation
      }
    }, 16);
    return () => clearInterval(interval);
  }, [target, duration]);
  return count;
}

const CARD_OUTER =
  "flex flex-col items-center justify-center rounded-2xl border-2 border-[#838996] shadow-lg p-1 min-w-[140px] h-full flex-1 md:max-w-[220px] transition-all hover:-translate-y-1 hover:shadow-[0_0_32px_0_#838996,0_0_16px_0_#fff3] group bg-[#1f2124]";

const CARD_INNER =
  "w-full flex flex-col items-center py-7 px-5 rounded-xl bg-[#080808] shadow-inner min-h-[185px]";

function StatCard({
  icon,
  label,
  value,
  glowColor = "#ff3c18",
  tooltip,
  animate = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  glowColor?: string;
  tooltip?: string;
  animate?: boolean;
}) {
  const countUp = useCountUp(typeof value === "number" ? Number(value) : 0);

  // Guarantee always formatted number, even for animation
  function formatNumber(val: number) {
    return val % 1 === 0
      ? val.toLocaleString()
      : val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  let display;
  if (typeof value === "string") {
    display = (
      <span className="flex items-baseline justify-center min-h-[46px]">
        <span
          className="text-3xl md:text-4xl font-extrabold text-white"
          style={{
            textShadow: `0 0 12px ${glowColor}99`,
            letterSpacing: "1px",
          }}
        >
          {value}
        </span>
      </span>
    );
  } else if (label === "Active Locks") {
    display = (
      <span className="flex items-baseline justify-center min-h-[46px]">
        <span
          className="text-3xl md:text-4xl font-extrabold text-white"
          style={{
            textShadow: `0 0 12px ${glowColor}99`,
            letterSpacing: "1px",
          }}
        >
          {animate ? formatNumber(countUp) : formatNumber(value)}
        </span>
        <span className="ml-1 text-base text-gray-400 font-semibold">Locks</span>
      </span>
    );
  } else {
    display = (
      <span className="flex items-baseline justify-center min-h-[46px]">
        <span
          className="text-3xl md:text-4xl font-extrabold text-white"
          style={{
            textShadow: `0 0 12px ${glowColor}99`,
            letterSpacing: "1px",
          }}
        >
          {animate ? formatNumber(countUp) : formatNumber(value)}
        </span>
        <span className="ml-1 text-base text-gray-400 font-semibold">BITNET</span>
      </span>
    );
  }

  return (
    <div className="relative group">
      <div className={CARD_OUTER}>
        <div className={CARD_INNER}>
          <div
            className="w-12 h-12 flex items-center justify-center rounded-full mb-4 text-2xl"
            style={{
              boxShadow: `0 0 18px 0 ${glowColor}66`,
              color: glowColor,
              background: "#000000ff",
            }}
          >
            {icon}
          </div>
          <div className="uppercase text-xs text-[#ff3c18] font-semibold mb-2 tracking-wider">
            {label}
          </div>
          <div className="flex flex-col items-center justify-center w-full">
            {display}
          </div>
        </div>
      </div>
      {tooltip && (
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 mt-2 z-50 opacity-0 group-hover:opacity-100 transition bg-[#232324] text-white text-xs px-3 py-1 rounded shadow-lg border border-[#ff3c18] w-max max-w-xs whitespace-pre-line">
          {tooltip}
        </div>
      )}
    </div>
  );
}

export default StatCard;
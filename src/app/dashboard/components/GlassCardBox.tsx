import React from "react";

export default function GlassCardBox({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-black/60 backdrop-blur-lg rounded-xl border border-[#ff3c18]/40 shadow-2xl p-5 my-3 glass-card transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

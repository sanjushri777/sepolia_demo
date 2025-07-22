import React from "react";

export default function GlassCard({ children, ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <div
      tabIndex={0}
      className="
        glass-card group flex flex-col items-center p-8 rounded-2xl
        border border-[#ff3c18]
        shadow-lg
        bg-black/60
        backdrop-blur-md
        transition-all
        hover:-translate-y-2
        hover:shadow-[0_0_32px_0_#ff3c18,0_0_64px_8px_#ff3c18]
        hover:border-[#ff5a2c]
        focus-visible:ring-4 focus-visible:ring-[#ff3c18]
        outline-none
        cursor-pointer
      "
      {...props}
    >
      {children}
    </div>
  );
}
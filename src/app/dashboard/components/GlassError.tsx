import React from "react";

export default function GlassError({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  if (!message) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-black/80 border-2 border-[#ff3c18] neon-glow rounded-xl p-6 shadow-2xl max-w-xs w-full relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-2xl text-[#ff3c18] font-bold focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
        <div className="text-white text-base text-center font-semibold mb-1">
          Error
        </div>
        <div className="text-[#ff3c18] text-center font-mono">{message}</div>
      </div>
      <style jsx>{`
        .neon-glow {
          box-shadow: 0 0 16px #ff3c18, 0 0 32px #ff3c18aa;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95);}
          to   { opacity: 1; transform: scale(1);}
        }
      `}</style>
    </div>
  );
}
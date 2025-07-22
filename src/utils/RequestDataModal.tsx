import React from "react";

export default function RequestDataModal({
  open,
  onClose,
  txHash,
  donorAddress,
  requestedMb,
  donorAmount,
  feeAmount,
  platformAmount,
  telecomAmount,
}: {
  open: boolean;
  onClose: () => void;
  txHash: string | null;
  donorAddress: string;
  requestedMb: number;
  donorAmount: number;
  feeAmount: number;
  platformAmount: number;
  telecomAmount: number;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-black/80 border border-[#ff3c18]/30 rounded-2xl shadow-2xl p-8 max-w-sm w-full glass-card relative">
        <div className="absolute top-3 right-3 cursor-pointer text-[#ff3c18] text-2xl font-bold" onClick={onClose}>
          ×
        </div>
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 flex items-center justify-center rounded-full border-4 border-[#ff3c18] text-4xl mb-4 bg-black/30">📡</div>
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Request Success</h2>
          <p className="text-[#bfc9d1] text-base text-center mb-2">Data request sent!</p>
          <div className="text-xs text-[#bfc9d1] mb-2 text-center">
            <div>Donor: <span className="text-[#ff3c18] break-all">{donorAddress}</span></div>
            <div>Requested MB: <span className="text-[#ff3c18]">{requestedMb} MB</span></div>
            <div>Fee (2%): <span className="text-[#ff3c18]">{feeAmount} BITNET</span></div>
            <div>Donor Receives: <span className="text-[#ff3c18]">{donorAmount} BITNET</span></div>
            <div>Platform: <span className="text-[#ff3c18]">{platformAmount} BITNET</span></div>
            <div>Telecom: <span className="text-[#ff3c18]">{telecomAmount} BITNET</span></div>
          </div>
          {txHash && (
            <a
              href={`https://primordial.bdagscan.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff3c18] underline text-xs mb-3 break-all"
            >
              View Transaction
            </a>
          )}
          <button
            className="mt-2 px-6 py-2 rounded-full bg-gradient-to-r from-[#ff3c18] to-[#ff5a2c] text-black font-bold text-lg shadow-lg"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
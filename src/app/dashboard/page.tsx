/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect, useCallback } from "react";
import { useAccount, useChainId } from "wagmi";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import { validateMbAmount, getBitnetContract } from "@/utils/bitnetContract";
import { ethers } from "ethers";
import RequestDataModal from "../../utils/RequestDataModal";
//port DonateButton from "./components/DonateButton";
import { getContractAddress } from "@/utils/bitnetContract";
import { getUserFriendlyError } from "@/utils/UserFriendlyError";
import { persistActionState, getLastActionState, clearLastActionState } from "@/utils/persistentState";
import GlassError from "./components/GlassError";

type Lock = {
  donor: string;
  index: number;
  lockedAmount: number;
  unlocked: boolean;
  lockTimestamp: number;
  expiryTimestamp: number;
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

function InfoBanner({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-900 text-white p-3 flex items-center justify-between shadow-lg">
      <span>{message}</span>
      <button onClick={onClose} className="ml-3 px-3 py-1 rounded bg-blue-700 hover:bg-blue-600">Dismiss</button>
    </div>
  );
}

// Helper to match locks FIFO for a given requested MB
function getLocksForRequest(
  allLocks: Lock[],
  requestedMb: number,
  requester: string
): { matches: { donor: string; lockIndex: number; mb: number }[]; totalMatchedMb: number } {
  let remainingMb = requestedMb;
  const matches: { donor: string; lockIndex: number; mb: number }[] = [];
  const now = Math.floor(Date.now() / 1000);

  const eligibleLocks = allLocks
    .filter(
      (lock) =>
        !lock.unlocked &&
        lock.lockedAmount > 0 &&
        lock.expiryTimestamp > now &&
        lock.donor.toLowerCase() !== requester?.toLowerCase()
    )
    .sort((a, b) => a.lockTimestamp - b.lockTimestamp);

  for (const lock of eligibleLocks) {
    if (remainingMb <= 0) break;
    const availableMb = Math.floor(lock.lockedAmount / 9);
    if (availableMb <= 0) continue;
    const useMb = Math.min(availableMb, remainingMb);
    matches.push({ donor: lock.donor, lockIndex: lock.index, mb: useMb });
    remainingMb -= useMb;
  }
  return {
    matches,
    totalMatchedMb: requestedMb - remainingMb,
  };
}

function SuccessModal({
  open,
  onClose,
  address,
  txHash,
  donatedMb,
}: {
  open: boolean;
  onClose: () => void;
  address: string | null;
  txHash: string | null;
  donatedMb: number | null;
}) {
  if (!open) return null;
  const tokenPerMb = 10;
  const totalTokens = donatedMb ? donatedMb * tokenPerMb : 0;
  const immediateTokens = totalTokens * 0.1;
  const lockedTokens = totalTokens * 0.9;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-black/80 border border-[#ff3c18]/30 rounded-2xl shadow-2xl p-8 max-w-sm w-full glass-card relative">
        <div className="absolute top-3 right-3 cursor-pointer text-[#ff3c18] text-2xl font-bold" onClick={onClose}>
          ×
        </div>
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 flex items-center justify-center rounded-full border-4 border-[#ff3c18] text-4xl mb-4 bg-black/30">
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Donation Success</h2>
          <p className="text-[#bfc9d1] text-base text-center mb-2">
            Thank you for your donation!
          </p>
          {address && (
            <p className="text-xs text-[#ff3c18] break-all mb-2">
              Donated Address: <br />
              {address}
            </p>
          )}
          {donatedMb && (
            <div className="text-xs text-[#bfc9d1] mb-2 text-center">
              <div>You Donated: <span className="text-[#ff3c18]">{donatedMb} MB</span></div>
              <div>Tokens Minted: <span className="text-[#ff3c18]">{totalTokens} BITNET</span></div>
              <div>Immediately Available (10%): <span className="text-[#ff3c18]">{immediateTokens} BITNET</span></div>
              <div>Locked (90%): <span className="text-[#ff3c18]">{lockedTokens} BITNET</span></div>
            </div>
          )}
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

function ConfirmRequestModal({
  open,
  onClose,
  onConfirm,
  donorsUsed,
  requestedMb,
  requestedBitnet,
  donorAmount,
  platformAmount,
  telecomAmount,
  bitnetBalance,
  feeAmount,
  totalAmount,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  donorsUsed: { donor: string; lockIndex: number; mb: number }[];
  requestedMb: number;
  requestedBitnet: number;
  donorAmount: number;
  platformAmount: number;
  telecomAmount: number;
  bitnetBalance: string;
  feeAmount: number;
  totalAmount: number;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-black/80 border border-[#ff3c18]/30 rounded-2xl p-8 shadow-2xl max-w-md w-full glass-card">
        <h2 className="text-xl font-bold text-white mb-3 text-center">Confirm Request</h2>
        <div className="text-[#bfc9d1] text-sm mb-3">
          <div>
            Requesting <span className="text-[#ff3c18]">{requestedMb} MB / {requestedBitnet} BITNET</span>
          </div>
          <div>
            <strong>Matched Donors:</strong>
            <ul className="list-disc ml-6">
              {donorsUsed.length === 0 && <li>No eligible donor found.</li>}
              {donorsUsed.map((item, i) => (
                <li key={i}>
                  <span className="text-[#ff3c18]">{item.mb} MB</span> from <span className="text-[#ff3c18] break-all">{item.donor}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-2">
            <strong>Breakdown:</strong>
            <br />Donor: <span className="text-[#ff3c18]">{donorAmount} BITNET</span>
            <br />Platform: <span className="text-[#ff3c18]">{platformAmount} BITNET</span>
            <br />Telecom: <span className="text-[#ff3c18]">{telecomAmount} BITNET</span>
            <br />Fee (2%): <span className="text-[#ff3c18]">{feeAmount} BITNET</span>
            <br />Total cost: <span className="text-[#ff3c18] font-bold">{totalAmount} BITNET</span>
          </div>
        </div>
        <div className="mb-3 text-xs text-[#bfc9d1]">
          Your balance: <span className="text-[#ff3c18]">{bitnetBalance}</span>
        </div>
        <div className="flex gap-4 justify-center">
          <button onClick={onConfirm} className="px-6 py-2 rounded-full bg-gradient-to-r from-[#ff3c18] to-[#ff5a2c] text-black font-bold text-lg shadow-lg">Confirm</button>
          <button onClick={onClose} className="px-6 py-2 rounded-full bg-gray-700 text-white font-bold text-lg shadow-lg">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const router = useRouter();
  const [activeCard, setActiveCard] = useState<"donate" | "request" | null>(null);

  // --- Donate State ---
  const [donateMb, setDonateMb] = useState(100);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [donatedAddress, setDonatedAddress] = useState<string | null>(null);
  const [donatedMbState, setDonatedMbState] = useState<number | null>(null);

  // --- Locks Table ---
  const [locks, setLocks] = useState<Lock[]>([]);
  const [allLocks, setAllLocks] = useState<Lock[]>([]);
  const [initialLockedMap, setInitialLockedMap] = useState<Record<string, number>>({});

  // --- Request Data State ---
  const [requestedMb, setRequestedMb] = useState<number>(100);
  const [donorsUsed, setDonorsUsed] = useState<{ donor: string; lockIndex: number; mb: number }[]>([]);
  const [autoDonorLock, setAutoDonorLock] = useState<Lock | null>(null);
  const [reqLoading, setReqLoading] = useState(false);
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqTxHash, setReqTxHash] = useState<string | null>(null);

  // --- Confirm Modal State ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // --- BITNET balance for requester ---
  const [bitnetBalance, setBitnetBalance] = useState<string>("0");
  const [simulatedBalance, setSimulatedBalance] = useState<string>("0");

  // --- Burn Expired Locks State ---
  const [burningLockIndex, setBurningLockIndex] = useState<number | null>(null);
  const [burnAllLoading, setBurnAllLoading] = useState<boolean>(false);

  // --- Last Request Breakdown for Modal ---
  const [lastRequestBreakdown, setLastRequestBreakdown] = useState<{
    requestedMb: number;
    donorAmount: number;
    feeAmount: number;
    platformAmount: number;
    telecomAmount: number;
    donorAddress: string;
  } | null>(null);

  // --- InfoBanner state for last action restore ---
  const [infoBannerMsg, setInfoBannerMsg] = useState<string>("");

  // --- GlassError for all errors ---
  const [popupError, setPopupError] = useState<string>("");

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  useEffect(() => {
    const last = getLastActionState();
    if (last) {
      setInfoBannerMsg(
        last.action === "donate"
          ? "Your last donation was interrupted. Please check your wallet/transactions and re-try if needed."
          : last.action === "request"
          ? "Your last request was interrupted. Please check your wallet/transactions and re-try if needed."
          : "You have an interrupted action. Please check your wallet/transactions."
      );
    }
  }, []);

  // --- Fetch All Locks (user and network) ---
  const fetchAllLocks = useCallback(async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = getBitnetContract(provider, chainId);

      const donorAddresses: string[] = await contract.getAllDonors();
      const allLocksArr: Lock[] = [];
      const initialMap: Record<string, number> = {};
      for (const donor of donorAddresses) {
        const count = await contract.getLockCount(donor);
        for (let i = 0; i < count; i++) {
          const lockInfo = await contract.getLockInfo(donor, i);
          initialMap[`${donor}-${i}`] = Number(ethers.formatUnits(lockInfo[4] ?? lockInfo[0], 18));
          allLocksArr.push({
            donor,
            index: i,
            lockedAmount: Number(ethers.formatUnits(lockInfo[0], 18)),
            unlocked: lockInfo[1],
            lockTimestamp: Number(lockInfo[2]),
            expiryTimestamp: Number(lockInfo[3]),
          });
        }
      }
      setAllLocks(allLocksArr);
      setInitialLockedMap(initialMap);
      if (address) {
        setLocks(allLocksArr.filter(
          lock => lock.donor.toLowerCase() === address.toLowerCase()
        ));
      } else {
        setLocks([]);
      }
    } catch (e) {
      setLocks([]);
      setAllLocks([]);
      setInitialLockedMap({});
      setPopupError(getUserFriendlyError(e));
    }
  }, [address, chainId]);

  useEffect(() => {
    if (address) {
      fetchAllLocks();
    } else {
      setLocks([]);
      setAllLocks([]);
      setInitialLockedMap({});
    }
  }, [address, fetchAllLocks]);

  useEffect(() => {
    async function fetchBalance() {
      try {
        if (!address) return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const token = getBitnetContract(provider, chainId);
        const bal = await token.balanceOf(address);
        setBitnetBalance(ethers.formatUnits(bal, 18));
      } catch (err) {
        setBitnetBalance("0");
        setPopupError(getUserFriendlyError(err));
      }
    }
    fetchBalance();
  }, [address, showReqModal, showSuccessModal, chainId]);

  useEffect(() => {
    const currentBalance = Number(bitnetBalance);
    const requestedBitnet = requestedMb * 10;
    const feeAmount = Math.ceil(requestedBitnet * 2 / 100);
    const totalAmount = requestedBitnet + feeAmount;
    setSimulatedBalance(String(currentBalance - totalAmount >= 0 ? currentBalance - totalAmount : currentBalance));
  }, [bitnetBalance, requestedMb]);

  // --- Donate with robust error and persist state ---
  const handleDonate = async () => {
    const error = validateMbAmount(donateMb);
    if (error) {
      setPopupError(error);
      return;
    }
    persistActionState("donate", { donateMb });

    try {
      const verifyRes = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: address,
          mb: donateMb,
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setPopupError(verifyData.error || "Telecom check failed.");
        return;
      }
    } catch (err) {
      setPopupError("Telecom verification failed. Please try again.");
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(23, 58, 59, 0);
      const expirySeconds = Math.ceil((midnight.getTime() - now.getTime()) / 1000);

      const contract = getBitnetContract(signer, chainId);
      const totalTokens = donateMb * 10;
      const tx = await contract.donateAndMint(userAddress, ethers.parseUnits(totalTokens.toString(), 18), expirySeconds);
      await tx.wait();

      setDonatedAddress(userAddress);
      setDonatedMbState(donateMb);
      setTxHash(tx.hash ?? null);
      setShowSuccessModal(true);
      setDonateMb(100);

      await fetchAllLocks();
      
      clearLastActionState();

    } catch (err: unknown) {
      setPopupError(getUserFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  // --- FIFO lock matching for request: update donorsUsed whenever allLocks or requestedMb changes
  useEffect(() => {
    if (!address || requestedMb <= 0) {
      setDonorsUsed([]);
      setAutoDonorLock(null);
      return;
    }
    const { matches, totalMatchedMb } = getLocksForRequest(allLocks, requestedMb, address);
    setDonorsUsed(matches);
    if (matches.length > 0) {
      setAutoDonorLock(allLocks.find(lock =>
        lock.donor === matches[0].donor && lock.index === matches[0].lockIndex
      ) || null);
      if (totalMatchedMb < requestedMb) setPopupError("Not enough donor data available to fulfill request.");
    } else {
      setAutoDonorLock(null);
      setPopupError("No eligible donor found.");
    }
  }, [requestedMb, allLocks, address]);

  const hasDonated = locks.length > 0;
  const requestedBitnet = requestedMb * 10;
  const rawFee = requestedBitnet * 2 / 100;
  let feeAmount = Math.ceil(rawFee);
  if (feeAmount % 2 !== 0) feeAmount += 1;
  const platformAmount = feeAmount / 2;
  const telecomAmount = feeAmount / 2;
  const totalAmount = requestedBitnet + feeAmount;
  const donorAmount = requestedBitnet;
  const isEnoughBalance = Number(bitnetBalance) >= totalAmount;

  const handleRequestClick = () => {
    setShowConfirmModal(true);
  };
  

  // --- Request flow with confirmation modal and robust error handling ---
  const handleConfirmRequest = async () => {
    setShowConfirmModal(false);
    persistActionState("request", { requestedMb });

    if (requestedMb < 50) {
      setPopupError("Minimum request amount is 50 MB.");
      return;
    }
    if (!hasDonated) {
      setPopupError("You must donate at least once before you can request data.");
      return;
    }
    if (!donorsUsed || donorsUsed.length === 0) {
      setPopupError("No eligible donor found.");
      return;
    }
    if (requestedMb <= 0) {
      setPopupError("Enter a positive MB amount.");
      return;
    }
    if (!isEnoughBalance) {
      setPopupError("You do not have enough BITNET tokens to make this request.");
      return;
    }
    try {
      setReqLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = getBitnetContract(signer, chainId);
      const tokenAmount = ethers.parseUnits(requestedBitnet.toString(), 18);
      const tx = await contract.requestData(donorsUsed[0].donor, tokenAmount);
      await tx.wait();
      setReqTxHash(tx.hash ?? null);

      setLastRequestBreakdown({
        requestedMb,
        donorAmount,
        feeAmount,
        platformAmount,
        telecomAmount,
        donorAddress: donorsUsed[0].donor,
      });

      setShowReqModal(true);
      setRequestedMb(100);
      await fetchAllLocks();
      clearLastActionState();

    } catch (err: unknown) {
      setPopupError(getUserFriendlyError(err));
    } finally {
      setReqLoading(false);
    }
  };

  // --- Burn Expired Locks Functions ---
  const burnExpiredLock = async (lockIndex: number) => {
    setBurningLockIndex(lockIndex);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = getBitnetContract(signer, chainId);
      const tx = await contract.burnExpiredLock(address, lockIndex);
      await tx.wait();
      await fetchAllLocks();
    } catch (err: any) {
      setPopupError(getUserFriendlyError(err));
    }
    setBurningLockIndex(null);
  };

  const handleBurnAll = async () => {
    setBurnAllLoading(true);
    try {
      const now = Math.floor(Date.now() / 1000);
      const expiredLocks = locks.filter(
        (lock) =>
          !lock.unlocked &&
          lock.lockedAmount > 0 &&
          lock.expiryTimestamp < now
      );
      for (const lock of expiredLocks) {
        await burnExpiredLock(lock.index);
      }
      await fetchAllLocks();
    } catch (err: any) {
      setPopupError(getUserFriendlyError(err));
    }
    setBurnAllLoading(false);
  };

  const now = Math.floor(Date.now() / 1000);
  const expiredLocks = locks.filter(
    (lock) =>
      !lock.unlocked &&
      lock.lockedAmount > 0 &&
      lock.expiryTimestamp < now
  );

  return (
    <>
      <InfoBanner message={infoBannerMsg} onClose={() => { setInfoBannerMsg(""); clearLastActionState(); }} />
      <GlassError message={popupError} onClose={() => setPopupError("")} />
      <SuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        address={donatedAddress}
        txHash={txHash}
        donatedMb={donatedMbState}
      />
      <RequestDataModal
        open={showReqModal}
        onClose={() => {
          setShowReqModal(false);
          setLastRequestBreakdown(null);
        }}
        txHash={reqTxHash}
        donorAddress={lastRequestBreakdown?.donorAddress ?? ""}
        requestedMb={lastRequestBreakdown?.requestedMb ?? 0}
        donorAmount={lastRequestBreakdown?.donorAmount ?? 0}
        feeAmount={lastRequestBreakdown?.feeAmount ?? 0}
        platformAmount={lastRequestBreakdown?.platformAmount ?? 0}
        telecomAmount={lastRequestBreakdown?.telecomAmount ?? 0}
      />
      <ConfirmRequestModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmRequest}
        donorsUsed={donorsUsed}
        requestedMb={requestedMb}
        requestedBitnet={requestedBitnet}
        donorAmount={donorAmount}
        platformAmount={platformAmount}
        telecomAmount={telecomAmount}
        bitnetBalance={bitnetBalance}
        feeAmount={feeAmount}
        totalAmount={totalAmount}
      />
      <Sidebar />
      <main className="min-h-screen flex flex-col bg-black font-['Montserrat',_sans-serif] overflow-x-hidden">
       
        
        <TopBar />
        {/* Mild glass balance pill */}
        <section className="w-full flex flex-col items-center pt-8 mb-2">
          <div className="flex items-center gap-2 justify-center">
            <div
              className="px-6 py-2 rounded-full bg-black/40 backdrop-blur-lg shadow-md flex items-center font-bold text-lg text-[#bfc9d1] border border-[#838996]"
              style={{ 
                boxShadow: "0 2px 12px #25272c"
              }}
            >
              <span className="text-2xl mr-2"></span>
              <span className="mr-2">BITNET Balance</span>
              <span className="font-mono text-xl text-[#ff3c18] bg-black/30 px-3 py-1 rounded-lg">{bitnetBalance}</span>
              <span className="ml-3 text-xs text-[#bfc9d1]">
                {reqLoading ? "" : `(After request: ${simulatedBalance})`}
              </span>
            </div>
          </div>
        </section>
        <section className="flex-1 w-full max-w-4xl flex flex-col items-center mx-auto pt-4">
          <h1 className="text-4xl font-bold text-white mb-10">Dashboard</h1>
          <div className="w-full flex flex-col md:flex-row gap-10 mb-12 justify-center items-stretch">
            {/* Donate Data Card */}
            <div
              tabIndex={0}
              className={clsx(
                "glass-card group flex-1 flex flex-col items-center p-8 rounded-2xl border border-[#838996]/60 shadow-lg transition-transform bg-black/50 outline-none",
                "hover:-translate-y-2 hover:shadow-[0_0_32px_0_#838996]",
                activeCard === "donate"
                  ? "ring-4 ring-[#838996] shadow-[0_0_32px_4px_#838996]"
                  : ""
              )}
              style={{
                background: `rgba(0, 0, 0, 1)`,
                backdropFilter: `blur(12px)`,
              }}
              onClick={() => setActiveCard("donate")}
              onFocus={() => setActiveCard("donate")}
              onBlur={() => setActiveCard(null)}
            >
              <div className="w-16 h-16 mb-4 border-2 border-[#ff3c18] rounded-full flex items-center justify-center text-3xl text-[#ff3c18] transition-all group-hover:scale-110">
              </div>
              <h3 className="font-bold text-2xl text-white mb-2 group-hover:text-[#ff3c18] transition-colors uppercase tracking-widest">
                Donate Data
              </h3>
              <p className="text-[#bfc9d1] text-center text-base mb-4">
                Share unused bandwidth and unlock the ability to request data and earn rewards.
              </p>
              <input
                type="number"
                min={50}
                max={10000}
                value={donateMb}
                disabled={loading}
                onChange={e => setDonateMb(Number(e.target.value))}
                className="mb-4 px-4 py-2 rounded-lg border border-[#ff3c18]/70 bg-transparent text-white w-full text-center focus:border-[#ff3c18] focus:outline-none transition"
                placeholder="Enter MB to donate"
              />
              
              <button
                className="px-6 py-2 rounded-full bg-gradient-to-r from-[#ff3c18] to-[#ff5a2c] text-black font-bold text-lg shadow-lg opacity-90 hover:opacity-100 focus:outline-none transition-all uppercase"
                disabled={loading}
                onClick={handleDonate}
              >
                {loading ? "Donating..." : "Donate Now"}
              </button>
            </div>
            {/* Request Data Card */}
            <div
              tabIndex={0}
              className={clsx(
                "glass-card group flex-1 flex flex-col items-center p-8 rounded-2xl border border-[#838996]/60 shadow-lg transition-transform bg-black/50 outline-none",
                "hover:-translate-y-2 hover:shadow-[0_0_32px_0_#838996] cursor-pointer",
                activeCard === "request"
                  ? "ring-4 ring-[#838996] shadow-[0_0_32px_4px_#838996]"
                  : ""
              )}
              style={{
                background: `rgba(0, 0, 0, 0.55)`,
                backdropFilter: `blur(12px)`,
              }}
              onClick={() => setActiveCard("request")}
              onFocus={() => setActiveCard("request")}
              onBlur={() => setActiveCard(null)}
            >
              <div className="w-16 h-16 mb-4 border-2 border-[#ff3c18] rounded-full flex items-center justify-center text-3xl text-[#ff3c18] transition-all group-hover:scale-110">
                📡
              </div>
              <h3 className="font-bold text-2xl text-white mb-2 group-hover:text-[#ff3c18] transition-colors uppercase tracking-widest">
                Request Data
              </h3>
              <p className="text-[#bfc9d1] text-center text-base mb-4">
                Access the network’s bandwidth after donating. Support the system and get what you need!
              </p>
              <input
                type="number"
                min={50}
                value={requestedMb}
                onChange={e => setRequestedMb(Number(e.target.value))}
                disabled={reqLoading}
                className="mb-2 px-4 py-2 rounded-lg border border-[#ff3c18]/70 bg-transparent text-white w-full text-center focus:border-[#ff3c18] focus:outline-none transition"
                placeholder="MB Amount"
              />
              {requestedMb < 50 && (
        <div className="text-red-400 text-xs mb-2">
          Minimum request amount is 50 MB.
        </div>
      )}
             {/* --- Cleaner Token Split Section --- */}
<div className="flex flex-wrap justify-center gap-3 my-4">
  <div className="glass-badge">
    <span className="badge-label">Total</span>
    <span className="badge-value text-[#ff3c18]">{totalAmount} BITNET</span>
  </div>
  <div className="glass-badge">
    <span className="badge-label">Donor</span>
    <span className="badge-value">{donorAmount} BITNET</span>
  </div>
  <div className="glass-badge">
    <span className="badge-label">Fee</span>
    <span className="badge-value">{feeAmount} BITNET</span>
  </div>
  <div className="glass-badge">
    <span className="badge-label">Platform</span>
    <span className="badge-value">{platformAmount} BITNET</span>
  </div>
  <div className="glass-badge">
    <span className="badge-label">Telecom</span>
    <span className="badge-value">{telecomAmount} BITNET</span>
  </div>
</div>

<style jsx>{`
  .glass-badge {
    min-width: 78px;
    padding: 9px 14px;
    margin-bottom: 2px;
    border-radius: 1.1rem;
    background: rgba(18, 18, 20, 0.5);
    border: 1.5px solid #ff3c18;
    box-shadow: 0 0 14px #ff3c1877, 0 1px 8px #0008;
    display: flex;
    flex-direction: column;
    align-items: center;
    backdrop-filter: blur(5px);
    transition: box-shadow 0.16s;
  }
  .glass-badge:hover {
    box-shadow: 0 0 18px 2px #ff3c18bb, 0 1px 10px #000b;
    background: rgba(30, 22, 22, 0.7);
  }
  .badge-label {
    font-size: 0.70rem;
    color: #ff3c18cc;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 1.2px;
    margin-bottom: 2px;
    text-shadow: 0 0 5px #ff3c1888;
  }
  .badge-value {
    font-weight: 700;
    font-size: 1.08rem;
    color: #fff;
    letter-spacing: 0.5px;
    text-shadow: 0 0 10px #ff3c1888;
  }
  .neon-bar {
    background: linear-gradient(90deg, #641e11ff 40%, #ff5a2c 100%);
    box-shadow: 0 0 18px #ff3c18, 0 0 8px #ff3c18aa;
    border-radius: 9999px;
    transition: width 0.3s cubic-bezier(.4,2,.6,1);
  }
`}</style>
             {/* Neon Glass Progress Bar */}
{requestedMb > 0 && (
  <div className="w-full mb-2">
    <div className="relative w-full h-3 rounded-full bg-black/40 overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full neon-bar"
        style={{
          width: `${Math.min(100, (donorsUsed.reduce((a, c) => a + c.mb, 0)/requestedMb)*100)}%`,
        }}
      />
    </div>
    <div className="text-xs text-[#ff3c18] mt-1 text-right">
      {donorsUsed.reduce((a, c) => a + c.mb, 0)} MB matched of {requestedMb} MB
    </div>
  </div>
)}

{/* Neon Glass Donor Chips */}
<div className="flex flex-wrap gap-2 mb-4">
  {donorsUsed.map((item, i) => (
    <div
      key={i}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm border border-[#ff3c18] shadow-[0_0_12px_#ff3c18aa] neon-chip font-mono text-[#ff3c18] text-sm cursor-pointer hover:bg-[#19191c] transition-all"
      title={item.donor}
      onClick={() => navigator.clipboard.writeText(item.donor)}
    >
      <span className="font-bold text-white">{item.mb} MB</span>
      <span className="opacity-80">
        {item.donor.slice(0, 6)}...{item.donor.slice(-4)}
        <span className="text-xs ml-1 text-[#ff3c18]/60"></span>
      </span>
      
    </div>
  ))}
  {donorsUsed.length === 0 && (
    <span className="text-[#bfc9d1] italic">No eligible donors found.</span>
  )}
</div>

<style jsx>{`
  .neon-bar {
    background: linear-gradient(90deg, #ff3c18 40%, #ff5a2c 100%);
    box-shadow: 0 0 18px #ff3c18, 0 0 8px #ff3c18aa;
    border-radius: 9999px;
    transition: width 0.3s cubic-bezier(.4,2,.6,1);
  }
  .neon-chip {
    box-shadow: 0 0 10px 2px #ff3c1855, 0 0 1px #ff3c18cc;
    transition: box-shadow 0.2s;
  }
  .neon-chip:hover {
    box-shadow: 0 0 16px 4px #ff3c18aa, 0 0 1px #ff3c18dd;
    background: #1a1a1dCC;
  }
`}</style>
              
              {!isEnoughBalance && (
                <div className="text-red-400 text-xs mb-2">
                  You do not have enough BITNET tokens to make this request.
                </div>
              )}
              {!hasDonated && (
                <div className="text-red-400 text-sm text-center mb-4">
                  You must donate at least once before you can request data.
                </div>
              )}
              {hasDonated && (
                <>
                  <button
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-[#ff3c18] to-[#ff5a2c] text-black font-bold text-lg shadow-lg opacity-90 hover:opacity-100 focus:outline-none transition-all uppercase"
                    disabled={
                      !hasDonated ||
                      reqLoading ||
                      donorsUsed.length === 0 ||
                      !isEnoughBalance||
                      requestedMb < 50
                      
                    }
                  
                    onClick={handleRequestClick}
                  >
                    {reqLoading ? "Requesting..." : "Request Now"}
                  </button>
                </>
              )}
            </div>
          </div>
          {/* Locks Table */}
          <div className="w-full max-w-3xl">
            <div
              className="bg-black/50 backdrop-blur-md border border-[#838996]/20 rounded-2xl shadow-xl p-6"
              style={{
                boxShadow: "0 8px 40px 0 rgba(135, 135, 135, 1)",
              }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 tracking-wide flex items-center gap-2">
                <span className="text-[#ff3c18] animate-pulse">●</span>
                Your Donation Locks
              </h2>
              {expiredLocks.length > 0 && (
                <div className="mb-4">
                  <button
                    className="mb-2 px-6 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition"
                    disabled={burnAllLoading}
                    onClick={handleBurnAll}
                  >
                    {burnAllLoading ? "Burning All..." : `Burn All Expired Tokens (${expiredLocks.length})`}
                  </button>
                  
                  {expiredLocks.map((lock) => (
                    <div
                      key={lock.index}
                      className="mb-2 p-2 border rounded bg-red-50 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold">Lock #{lock.index + 1}</span> — {lock.lockedAmount} BITNET ({lock.lockedAmount/10} MB)
                        <span className="ml-2 text-xs text-gray-500">
                          Expired: {new Date(lock.expiryTimestamp * 1000).toLocaleString()}
                        </span>
                      </div>
                      <button
                        className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        disabled={burningLockIndex === lock.index || burnAllLoading}
                        onClick={() => burnExpiredLock(lock.index)}
                      >
                        {burningLockIndex === lock.index ? "Burning..." : "Burn"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#080808]/60 backdrop-blur-sm">
                      <th className="py-3 px-4 text-[#ff3c18] font-bold rounded-tl-xl text-sm tracking-wider">
                        Lock
                      </th>
                      <th className="py-3 px-4 text-[#ff3c18] font-bold text-sm tracking-wider">
                        Amount Locked
                      </th>
                      <th className="py-3 px-4 text-[#ff3c18] font-bold text-sm tracking-wider">
                        Unlocked (Total Requested)
                      </th>
                      <th className="py-3 px-4 text-[#ff3c18] font-bold text-sm tracking-wider">
                        Donor Reward
                      </th>
                      <th className="py-3 px-4 text-[#ff3c18] font-bold text-sm tracking-wider">
                        Status
                      </th>
                      <th className="py-3 px-4 text-[#ff3c18] font-bold text-sm tracking-wider">
                        Locked At
                      </th>
                      <th className="py-3 px-4 text-[#ff3c18] font-bold rounded-tr-xl text-sm tracking-wider">
                        Expires At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {locks.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-gray-400 py-6">
                          No donations yet.
                        </td>
                      </tr>
                    ) : (
                      locks.map((lock, i) => {
                        const initialLocked = initialLockedMap[`${lock.donor}-${lock.index}`] ?? lock.lockedAmount;
                        const unlockedTokens = initialLocked - lock.lockedAmount;
                        const donorUnlockedReward = Math.floor(unlockedTokens * 100 / 100);
                        const lockedAt =
                          Number(lock.lockTimestamp) > 0
                            ? new Date(Number(lock.lockTimestamp) * 1000).toLocaleString()
                            : "-";
                        const expiresAt =
                          Number(lock.expiryTimestamp) > 0
                            ? new Date(Number(lock.expiryTimestamp) * 1000).toLocaleString()
                            : "-";
                        let status = "Locked";
                        if (lock.unlocked) status = "Unlocked";
                        else if (Date.now() >= Number(lock.expiryTimestamp) * 1000) status = "Expired";
                        return (
                          <tr
                            key={i}
                            className={`transition-all duration-200 ${
                              i % 2 === 0 ? "bg-black/20" : "bg-black/10"
                            } hover:bg-[#f8f8ff]/20 hover:scale-[1.01]`}
                          >
                            <td className="py-3 px-4 text-white/90 font-mono text-sm">{i + 1}</td>
                            <td className="py-3 px-4 text-white/90 text-sm">{lock.lockedAmount} BITNET</td>
                            <td className="py-3 px-4 text-[#ff3c18] text-sm font-bold">
                              {unlockedTokens} BITNET
                            </td>
                            <td className="py-3 px-4 text-[#ff3c18] text-sm font-bold">
                              {donorUnlockedReward} BITNET
                            </td>
                            <td className="py-3 px-4 font-bold text-sm">
                              <span
                                className={`px-3 py-1 rounded-full text-xs shadow transition-all duration-200 ${
                                  status === "Locked"
                                    ? "bg-[#ff3c18]/70 text-white"
                                    : status === "Unlocked"
                                    ? "bg-green-600/70 text-white"
                                    : "bg-gray-700/70 text-gray-300"
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-white/80 font-mono text-xs">
                              {lockedAt}
                            </td>
                            <td className="py-3 px-4 text-white/80 font-mono text-xs">
                              {expiresAt}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from "ethers";
import { BITNET_ABI_BLOCKDAG } from "../constants/abi";
import { CONTRACT_ADDRESSES } from "../constants/contractaddress";

const TOKENS_PER_MB = 10;
const MIN_MB = 50;
const MAX_MB = 10_000;
const DECIMALS = 18;

const BLOCKDAG_CHAIN_ID = 1043;
const SEPOLIA_CHAIN_ID = 11155111;

// If your Sepolia ABI is different, import it here and use BITNET_ABI_SEPOLIA below
const SUPPORTED_CHAINS: Record<number, { name: string; abi: any }> = {
  [BLOCKDAG_CHAIN_ID]: {
    name: "blockdag",
    abi: BITNET_ABI_BLOCKDAG,
  },
  [SEPOLIA_CHAIN_ID]: {
    name: "sepolia",
    abi: BITNET_ABI_BLOCKDAG, // Change to BITNET_ABI_SEPOLIA if needed
  },
};

export function getContractAddress(chainId: number = BLOCKDAG_CHAIN_ID): string {
  const addr = CONTRACT_ADDRESSES[String(chainId)];
  if (!addr) throw new Error(`No contract address for chainId ${chainId}`);
  return addr;
}

export function getBitnetAbi(chainId: number = BLOCKDAG_CHAIN_ID): any {
  const chain = SUPPORTED_CHAINS[chainId];
  if (!chain) throw new Error(`Unsupported chainId ${chainId}`);
  return chain.abi;
}

export function getBitnetContract(
  signerOrProvider: ethers.Signer | ethers.Provider,
  chainId: number = BLOCKDAG_CHAIN_ID
) {
  return new ethers.Contract(getContractAddress(chainId), getBitnetAbi(chainId), signerOrProvider);
}

export function mbToTokenAmount(mb: number): bigint {
  return ethers.parseUnits((mb * TOKENS_PER_MB).toString(), DECIMALS);
}

export function validateMbAmount(mb: number): string | null {
  if (mb < MIN_MB) return `Minimum donation is ${MIN_MB} MB`;
  if (mb > MAX_MB) return `Maximum donation is ${MAX_MB} MB`;
  return null;
}

export async function donateAndMint(
  donorAddress: string,
  mb: number,
  expirySeconds: number,
  chainId: number = BLOCKDAG_CHAIN_ID
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const validationError = validateMbAmount(mb);
  if (validationError) throw new Error(validationError);

  const tokenAmount = mbToTokenAmount(mb).toString();

  const res = await fetch("/api/donate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ donorAddress, tokenAmount, expirySeconds, chainId }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Backend error: ${errText}`);
  }

  const data = await res.json();
  return data;
}

export async function getLockCount(
  provider: ethers.Provider,
  donorAddress: string,
  chainId: number = BLOCKDAG_CHAIN_ID
): Promise<number> {
  const contract = getBitnetContract(provider, chainId);
  return Number(await contract.getLockCount(donorAddress));
}

export async function getLockInfo(
  provider: ethers.Provider,
  donorAddress: string,
  lockIndex: number,
  chainId: number = BLOCKDAG_CHAIN_ID
) {
  const contract = getBitnetContract(provider, chainId);
  const [lockedAmount, unlocked, lockTimestamp, expiryTimestamp] = await contract.getLockInfo(donorAddress, lockIndex);
  return { lockedAmount, unlocked, lockTimestamp, expiryTimestamp };
}

export async function getAllLocks(
  provider: ethers.Provider,
  donorAddress: string,
  chainId: number = BLOCKDAG_CHAIN_ID
) {
  const count = await getLockCount(provider, donorAddress, chainId);
  const locks = [];
  for (let i = 0; i < count; i++) {
    const info = await getLockInfo(provider, donorAddress, i, chainId);
    locks.push({ index: i + 1, ...info });
  }
  return locks;
}
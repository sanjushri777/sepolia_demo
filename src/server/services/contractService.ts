/*import { ethers } from "ethers";
import { NETWORKS } from "../config/networks";


// load from env
const OWNER_PRIVATE_KEY: string = process.env.OWNER_PRIVATE_KEY || "";

if (!OWNER_PRIVATE_KEY || OWNER_PRIVATE_KEY.length !== 66 || !OWNER_PRIVATE_KEY.startsWith("0x")) {
  throw new Error("Invalid OWNER_PRIVATE_KEY in .env. Must start with 0x and be 66 characters.");
}

export function getContract(network: "sepolia" | "blockdag") {
  const net = NETWORKS[network];
  if (!net) throw new Error("Unknown network");

  const provider = new ethers.JsonRpcProvider(net.rpcUrl);
  const signer = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(net.contractAddress, net.abi, signer);

  return contract;
}*/